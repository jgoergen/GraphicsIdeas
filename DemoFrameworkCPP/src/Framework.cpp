#include "../include/Framework.hpp"
#include "raylib.h"
#include "../include/Config.hpp"
#include <algorithm>
#include <cmath>

static DemoVariableSet *g_activeVarSet = nullptr; // used by demo to access variables (quick hack)

void DemoVariable::Regenerate()
{
    if (locked)
    {
        return;
    }

    float newValue = value;

    if (firstGeneration)
    {
        if (hasInitial)
        {
            newValue = value; // keep provided initial
        }
        else if (generator)
        {
            newValue = generator();
        }
        else
        {
            newValue = min + (float)rand() / RAND_MAX * (max - min);
        }

        firstGeneration = false;
    }
    else
    {
        if (generator)
        {
            newValue = generator();
        }
        else
        {
            newValue = min + (float)rand() / RAND_MAX * (max - min);
        }
    }

    target = newValue;
    startValue = value; // capture start
    remainingFrames = std::max(1, transitionFrames);
    totalTransitionFrames = remainingFrames; // remember full length
}

void DemoVariable::Update()
{
    if (remainingFrames > 0)
    {
        // progress ratio 0..1 (inclusive when finishing)
        float progress = 1.0f - (float)remainingFrames / (float)totalTransitionFrames;
        progress = std::clamp(progress, 0.0f, 1.0f);

        float interp;
        if (easing)
        {
            interp = easing(progress, startValue, target);
        }
        else
        {
            interp = startValue + (target - startValue) * progress;
        }
        value = interp;
        remainingFrames--;
        if (remainingFrames <= 0)
        {
            value = target; // snap to exact target end of transition
        }
    }

    // Apply quantization only at the end (or if no transition in progress) so we don't destroy interpolation
    bool done = remainingFrames <= 0;
    if (done)
    {
        if (isBool)
        {
            value = (value >= 0.5f) ? 1.0f : 0.0f;
        }
        else
        {
            if (floored)
            {
                value = std::floor(value);
            }
            else if (ceiled)
            {
                value = std::ceil(value);
            }
            else if (integer)
            {
                value = std::round(value);
            }
        }
    }
}

DemoVariable &DemoVariableSet::Add(const DemoVariable &v)
{
    vars.push_back(v);
    return vars.back();
}

DemoVariable *DemoVariableSet::Get(const std::string &name)
{
    for (auto &v : vars)
    {
        if (v.name == name)
        {
            return &v;
        }
    }

    return nullptr;
}

void DemoVariableSet::ForEach(const std::function<void(DemoVariable &)> &fn)
{
    for (auto &v : vars)
    {
        fn(v);
    }
}

void DemoVariableSet::RegenerateAll(bool onlyUnlocked)
{
    ForEach(
        [&](DemoVariable &v)
        {
            if (!onlyUnlocked || !v.locked)
            {
                v.Regenerate();
            }
        });
}

DemoApp::DemoApp() {}
DemoApp::~DemoApp() { DeactivateDemo(); }

void DemoApp::Register(const DemoRegistration &reg) { demos.push_back(reg); }

void DemoApp::Run()
{
    int regenCountdown = dfc::AUTO_REGEN_MIN_FRAMES + (rand() % (dfc::AUTO_REGEN_MAX_FRAMES - dfc::AUTO_REGEN_MIN_FRAMES + 1));

    while (!WindowShouldClose())
    {
        if (inMenu)
        {
            if (IsKeyPressed(KEY_ESCAPE))
            { /* already in menu */
            }

            BeginDrawing();
            ClearBackground(RAYWHITE);
            ShowMenu();
            EndDrawing();
        }
        else
        {
            float dt = GetFrameTime();
            elapsed += dt;

            // update variables
            if (!pauseTweens)
            {
                vars.ForEach(
                    [](DemoVariable &v)
                    { v.Update(); });
            }

            // auto regeneration countdown
            if (!pauseTweens)
            {
                regenCountdown--;

                if (regenCountdown <= 0)
                {
                    vars.RegenerateAll();
                    regenCountdown = dfc::AUTO_REGEN_MIN_FRAMES + (rand() % (dfc::AUTO_REGEN_MAX_FRAMES - dfc::AUTO_REGEN_MIN_FRAMES + 1));
                }
            }

            if (IsKeyPressed(KEY_R))
            {
                UpdateRNG();
                vars.RegenerateAll();

                if (active)
                {
                    DemoCtx cx{vars, rng, elapsed, dt, actualCurrentSeed};
                    active->OnShutdown(cx);
                    elapsed = 0.0f; // reset elapsed for re-init
                    DemoCtx cx2{vars, rng, elapsed, dt, actualCurrentSeed};
                    active->OnInit(cx2);
                }
            }

            if (IsKeyPressed(KEY_SPACE))
            {
                pauseTweens = !pauseTweens;
            }

            // Allow either ESC or 'E' to exit the current demo back to the menu
            if (IsKeyPressed(KEY_ESCAPE) || IsKeyPressed(KEY_E))
            {
                DeactivateDemo();
                inMenu = true;
                continue;
            }

            if (IsKeyPressed(KEY_O))
            {
                showOverlay = !showOverlay;
            }

            DemoCtx cx{vars, rng, elapsed, dt, actualCurrentSeed};

            if (active)
            {
                active->OnUpdate(cx);
            }

            BeginDrawing();

            if (active)
            {
                active->OnDraw(cx);
            }

            if (showOverlay)
            {
                DrawOverlay();
            }

            EndDrawing();
        }
    }
}

void DemoApp::ShowMenu()
{
    DrawText(
        "DemoFrameworkCPP - Select Demo (UP/DOWN, ENTER, number, S=Seed)",
        dfc::MENU_TITLE_POS_X,
        dfc::MENU_TITLE_POS_Y,
        dfc::MENU_TITLE_FONT_SIZE,
        BLACK);

    // Seed entry
    if (enteringSeed)
    {
        int key = GetKeyPressed();

        while (key > 0)
        {
            if (key >= KEY_ZERO && key <= KEY_NINE)
            {
                if (seedInput.size() < 10)
                {
                    seedInput.push_back(char('0' + key - KEY_ZERO));
                }
            }
            else if (key == KEY_BACKSPACE)
            {
                if (!seedInput.empty())
                {
                    seedInput.pop_back();
                }
            }
            else if (key == KEY_ENTER || key == KEY_KP_ENTER)
            {
                unsigned long long v = 0ULL;

                if (!seedInput.empty())
                {
                    try
                    {
                        v = std::stoull(seedInput);
                    }
                    catch (...)
                    {
                        v = 0ULL;
                    }
                }

                if (v > 0xFFFFFFFFULL)
                {
                    v = 0xFFFFFFFFULL;
                }

                actualCurrentSeed = (unsigned int)currentSeed;
                enteringSeed = false;
            }
            else if (key == KEY_ESCAPE)
            {
                enteringSeed = false;
                seedInput.clear();
            }
            key = GetKeyPressed();
        }
    }
    else if (IsKeyPressed(KEY_S))
    {
        enteringSeed = true;
        seedInput.clear();
    }

    std::string seedLine = enteringSeed ? ("Seed (0=random) > " + seedInput) : ("Seed: " + std::to_string(currentSeed) + " (S to edit)");
    DrawText(seedLine.c_str(), dfc::MENU_TITLE_POS_X, dfc::MENU_TITLE_POS_Y + dfc::MENU_ITEM_SPACING_Y, 24, DARKBLUE);

    // Handle up/down navigation with wrapping
    if (!enteringSeed && IsKeyPressed(KEY_DOWN))
    {
        menuSelected = (menuSelected + 1) % (int)demos.size();
    }
    else if (!enteringSeed && IsKeyPressed(KEY_UP))
    {
        menuSelected = (menuSelected - 1 + (int)demos.size()) % (int)demos.size();
    }

    // If user presses a number key, jump directly
    if (!enteringSeed)
    {
        for (size_t i = 0; i < demos.size() && i < 9; ++i)
        {
            // limit to keys 1-9
            if (IsKeyPressed(KEY_ONE + (int)i))
            {
                menuSelected = (int)i;
                ActivateDemo((int)i);
                inMenu = false;
                return;
            }
        }
    }

    // Enter/Space to start selected demo
    if (!enteringSeed && (IsKeyPressed(KEY_ENTER) || IsKeyPressed(KEY_KP_ENTER)))
    {
        ActivateDemo(menuSelected);
        inMenu = false;
        return;
    }

    // Draw items with highlight
    for (size_t i = 0; i < demos.size(); ++i)
    {
        int y = dfc::MENU_ITEM_START_Y + (int)i * dfc::MENU_ITEM_SPACING_Y;
        bool selected = ((int)i == menuSelected);

        if (selected)
        {
            int textWidth = MeasureText(demos[i].name.c_str(), dfc::MENU_ITEM_FONT_SIZE);
            int bgWidth = textWidth + 120; // padding for number & margins

            DrawRectangle(
                dfc::MENU_ITEM_POS_X - 10,
                y - 4,
                bgWidth,
                dfc::MENU_ITEM_FONT_SIZE + 8,
                Fade(LIGHTGRAY, 0.5f));
        }

        std::string line = std::to_string(i + 1) + ") " + demos[i].name;
        DrawText(
            line.c_str(),
            dfc::MENU_ITEM_POS_X,
            y,
            dfc::MENU_ITEM_FONT_SIZE,
            selected ? BLACK : DARKGRAY);
    }
}

void DemoApp::UpdateRNG()
{
    // configuration phase
    if (currentSeed == 0)
    {
        actualCurrentSeed = (unsigned int)std::random_device{}();
    }
    else
    {
        actualCurrentSeed = currentSeed;
    }

    rng.seed(actualCurrentSeed);
    srand(actualCurrentSeed);
}

void DemoApp::ActivateDemo(int index)
{
    DeactivateDemo();

    if (index < 0 || index >= (int)demos.size())
    {
        return;
    }

    active = demos[index].factory();
    vars = DemoVariableSet();
    elapsed = 0.0f;
    UpdateRNG();
    DemoCtx confCx{vars, rng, elapsed, 0.0f, actualCurrentSeed};
    active->OnConfigure(confCx);

    // First generation pass for all variables so initial/generator/range logic runs once
    vars.ForEach(
        [](DemoVariable &v)
        {
            if (v.remainingFrames <= 0)
            {
                v.Regenerate();
            }
        });

    active->SetVariables(&vars);

    vars.ForEach(
        [](DemoVariable &v)
        {
            if (v.transitionFrames <= 1)
            {
                v.transitionFrames = dfc::DEFAULT_VAR_TRANS_FRAMES;
            }
        });

    DemoCtx initCx{vars, rng, elapsed, 0.0f, actualCurrentSeed};
    active->OnInit(initCx);
}

void DemoApp::DeactivateDemo()
{
    if (active)
    {
        DemoCtx cx{vars, rng, elapsed, 0.0f, actualCurrentSeed};
        active->OnShutdown(cx);
        delete active;
        active = nullptr;
    }
}

void DemoApp::DrawOverlay()
{
    int y = dfc::OVERLAY_START_Y;
    DrawRectangle(0, 0, dfc::OVERLAY_PANEL_WIDTH, GetScreenHeight(), Fade(LIGHTGRAY, dfc::OVERLAY_BG_ALPHA));
    std::string seedLine = "Seed: " + std::to_string(actualCurrentSeed);
    DrawText(seedLine.c_str(), dfc::OVERLAY_PADDING_X, y, dfc::OVERLAY_FONT_HEADER, BLACK);
    y += dfc::OVERLAY_SPACING_AFTER_HEADER;
    DrawText("Variables:", dfc::OVERLAY_PADDING_X, y, dfc::OVERLAY_FONT_HEADER, BLACK);
    y += dfc::OVERLAY_SPACING_AFTER_HEADER;

    vars.ForEach(
        [&](DemoVariable &v)
        {
            std::string ln = v.name + ": " + std::to_string(v.value) + " -> " + std::to_string(v.target);

            DrawText(
                ln.c_str(),
                dfc::OVERLAY_PADDING_X,
                y,
                dfc::OVERLAY_FONT_BASE,
                DARKGRAY);

            y += dfc::OVERLAY_SPACING_BETWEEN_LINES;
        });

    y += dfc::OVERLAY_SPACING_GROUP;
    std::string info = "FPS: " + std::to_string(GetFPS());
    DrawText(info.c_str(), dfc::OVERLAY_PADDING_X, y, dfc::OVERLAY_FONT_FPS, MAROON);
    y += dfc::OVERLAY_SPACING_AFTER_FPS;
    DrawText("Keys: ESC/E menu, R regen, SPACE pause tweens, O overlay", dfc::OVERLAY_PADDING_X, y, dfc::OVERLAY_FONT_HELP, BLACK);
}
