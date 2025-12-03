mod commands;
mod scanner;

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition,
};

#[cfg(not(debug_assertions))]
use tauri::WindowEvent;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

// Track when window was last shown to prevent immediate hide
static LAST_SHOW_TIME: AtomicU64 = AtomicU64::new(0);
// Track when tray icon was last clicked (to ignore focus-lost from mouse down)
static LAST_TRAY_CLICK_TIME: AtomicU64 = AtomicU64::new(0);

fn get_current_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn show_window(app: &tauri::AppHandle, position: Option<PhysicalPosition<f64>>) {
    if let Some(window) = app.get_webview_window("main") {
        // Record show time to prevent immediate hide
        LAST_SHOW_TIME.store(get_current_time_ms(), Ordering::SeqCst);

        // Position window near tray icon if position provided
        if let Some(pos) = position {
            // Get window size
            if let Ok(size) = window.outer_size() {
                // Position window above/below the click, centered horizontally
                let x = (pos.x as i32) - (size.width as i32 / 2);
                let y = if pos.y > 400.0 {
                    // Tray is at bottom, show window above
                    (pos.y as i32) - (size.height as i32) - 10
                } else {
                    // Tray is at top, show window below
                    (pos.y as i32) + 10
                };
                let _ = window.set_position(PhysicalPosition::new(x.max(0), y.max(0)));
            }
        }
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn hide_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

fn toggle_window_visibility(app: &tauri::AppHandle, position: Option<PhysicalPosition<f64>>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            hide_window(app);
        } else {
            show_window(app, position);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        // Check if it's our Ctrl+Shift+P shortcut
                        let expected = Shortcut::new(
                            Some(Modifiers::CONTROL | Modifiers::SHIFT),
                            Code::KeyP,
                        );
                        if shortcut == &expected {
                            toggle_window_visibility(app, None);
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::scan_ports,
            commands::kill_process,
            commands::get_port_info,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Register global shortcut: Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (macOS)
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyP);
            if let Err(e) = app.global_shortcut().register(shortcut) {
                log::warn!("Failed to register Ctrl+Shift+P shortcut: {}", e);
            } else {
                log::info!("Registered global shortcut: Ctrl+Shift+P");
            }

            // Build tray menu
            let show_item = MenuItemBuilder::with_id("show", "Show/Hide")
                .build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit")
                .build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;

            // Load tray icon (embedded at compile time, decoded from PNG)
            let icon = Image::from_bytes(include_bytes!("../icons/32x32.png"))?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .tooltip("Unbind - Port Manager")
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            toggle_window_visibility(app, None);
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            position,
                            ..
                        } => {
                            // Record click time to prevent focus-lost from hiding window
                            LAST_TRAY_CLICK_TIME.store(get_current_time_ms(), Ordering::SeqCst);
                            let app = tray.app_handle();
                            toggle_window_visibility(app, Some(position));
                        }
                        TrayIconEvent::Enter { .. } => {
                            // Mouse entering tray area - record time to debounce
                            LAST_TRAY_CLICK_TIME.store(get_current_time_ms(), Ordering::SeqCst);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Hide window when it loses focus (menu bar behavior)
            // This is disabled in debug mode for WSL2 compatibility
            #[cfg(not(debug_assertions))]
            {
                let app_handle = app.handle().clone();
                if let Some(window) = app.get_webview_window("main") {
                    window.on_window_event(move |event| {
                        if let WindowEvent::Focused(false) = event {
                            let now = get_current_time_ms();
                            let last_show = LAST_SHOW_TIME.load(Ordering::SeqCst);
                            let last_tray_click = LAST_TRAY_CLICK_TIME.load(Ordering::SeqCst);

                            // Prevent hiding if:
                            // - Window was just shown (within 300ms)
                            // - Tray icon was just clicked/hovered (within 300ms) - prevents mouse-down hide
                            let debounce_ms = 300;
                            if now - last_show > debounce_ms && now - last_tray_click > debounce_ms {
                                hide_window(&app_handle);
                            }
                        }
                    });
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("Error while running tauri application: {}", e);
            std::process::exit(1);
        });
}
