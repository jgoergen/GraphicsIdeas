#pragma once

namespace dfc
{
    constexpr int WINDOW_WIDTH = 1920;
    constexpr int WINDOW_HEIGHT = 1080;
    constexpr int TARGET_FPS = 60; // set 0 for uncapped

    // Launch / rendering behavior
    constexpr bool START_FULLSCREEN = false;  // If true, app starts in fullscreen mode
    constexpr bool AUTO_STRETCH_STAGE = true; // If true, demos use current window/screen size; overlay remains fixed
    constexpr bool ENABLE_MSAA4X = true;      // Enable multi-sample anti-aliasing for smoother lines
    // Automatic variable regeneration (all variables) at random frame intervals
    constexpr int AUTO_REGEN_MIN_FRAMES = 240; // 4s @60fps
    constexpr int AUTO_REGEN_MAX_FRAMES = 720; // 12s @60fps

    // Default transition frame count applied to any DemoVariable whose transitionFrames <= 1
    // (Allows per-variable custom values via VB::TransitionFrames while providing a global fallback.)
    constexpr int DEFAULT_VAR_TRANS_FRAMES = 120; // requested 600-frame interpolation

    // Framework UI / layout configuration (overlay + menu). Adjust here instead of editing framework code.
    // Menu layout
    constexpr int MENU_TITLE_POS_X = 40;
    constexpr int MENU_TITLE_POS_Y = 40;
    constexpr int MENU_TITLE_FONT_SIZE = 38;
    constexpr int MENU_ITEM_POS_X = 80;
    constexpr int MENU_ITEM_START_Y = 100;
    constexpr int MENU_ITEM_SPACING_Y = 30; // distance between menu items vertically
    constexpr int MENU_ITEM_FONT_SIZE = 30;

    // Overlay panel layout
    constexpr int OVERLAY_PANEL_WIDTH = 800;  // left side panel width
    constexpr int OVERLAY_PADDING_X = 10;     // left padding for text
    constexpr int OVERLAY_START_Y = 10;       // initial Y for overlay content
    constexpr float OVERLAY_BG_ALPHA = 0.60f; // background alpha for side panel

    // Overlay font sizing (change base to scale others)
    constexpr int OVERLAY_FONT_BASE = 30;                      // base size for variable lines
    constexpr int OVERLAY_FONT_HEADER = OVERLAY_FONT_BASE + 2; // "Variables:" header size
    constexpr int OVERLAY_FONT_FPS = OVERLAY_FONT_BASE + 2;    // FPS line
    constexpr int OVERLAY_FONT_HELP = OVERLAY_FONT_BASE - 2;   // help / hint line

    // Overlay vertical spacing
    constexpr int OVERLAY_SPACING_AFTER_HEADER = 24;  // gap after "Variables:" header
    constexpr int OVERLAY_SPACING_BETWEEN_LINES = 26; // gap between variable lines
    constexpr int OVERLAY_SPACING_GROUP = 20;         // extra gap before groups (e.g. before FPS line)
    constexpr int OVERLAY_SPACING_AFTER_FPS = 24;     // gap after FPS line before help text
}
