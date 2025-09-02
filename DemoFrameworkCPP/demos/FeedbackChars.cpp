#include "FeedbackChars.hpp"
#include "raylib.h"
#include <random>
#include <cmath>
#include <algorithm>

void FeedbackCharsDemo::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("A_DIV").Range(0.5f, 4.0f));
    cx.vs.Add(VB::Create("C_DIV").Range(0.5f, 4.0f));
    cx.vs.Add(VB::Create("R_MULT").Range(1.0f, 6.0f));
    cx.vs.Add(VB::Create("G_MULT").Range(1.0f, 60.0f));
    cx.vs.Add(VB::Create("B_MULT").Range(1.0f, 6.0f));
    cx.vs.Add(VB::Create("EXP_DIV").Range(5.0f, 20.0f));
    cx.vs.Add(VB::Create("ALPHA").Range(0.2f, 1.0f));
    cx.vs.Add(VB::Create("FONT_SIZE").Range(100.0f, 400.0f));
    // New dynamic controls for motion & feedback transform
    cx.vs.Add(VB::Create("ROT_SPEED").Range(-720.f, 720.f));      // degrees per second equivalent scaling
    cx.vs.Add(VB::Create("SCALE_AMP").Range(0.f, 1.0f));          // max additional uniform scale
    cx.vs.Add(VB::Create("X_AMP").Range(0.f, 600.f));             // horizontal motion amplitude
    cx.vs.Add(VB::Create("Y_AMP").Range(0.f, 400.f));             // vertical motion amplitude
    cx.vs.Add(VB::Create("PERIOD").Range(0.5f, 10.f));            // seconds for a full oscillation
}

void FeedbackCharsDemo::RecreateTargetsIfNeeded()
{
    int w = GetScreenWidth();
    int h = GetScreenHeight();
    if (w == screenW && h == screenH && targets[0].id > 0)
        return;

    // If existing, unload
    for (auto &t : targets)
    {
        if (t.id > 0)
            UnloadRenderTexture(t);
    }
    screenW = w;
    screenH = h;
    targets[0] = LoadRenderTexture(screenW, screenH);
    targets[1] = LoadRenderTexture(screenW, screenH);

    // Clear both targets to black
    for (int i = 0; i < 2; ++i)
    {
        BeginTextureMode(targets[i]);
        ClearBackground(BLACK);
        EndTextureMode();
    }
    currentTarget = 0;
}

void FeedbackCharsDemo::OnInit(DemoCtx &cx)
{
    RecreateTargetsIfNeeded();
    elapsedMs = GetRandomValue(0, 10000);
    // Regenerate all once (already done by framework generation, but ensure unlocked only false)
    cx.vs.RegenerateAll(false);
    if (!charSet.empty())
    {
        int idx = GetRandomValue(0, (int)charSet.size() - 1);
        chosenChar = charSet[idx];
    }
    // cache variable refs
    v.aDiv.p = cx.vs.Get("A_DIV");
    v.cDiv.p = cx.vs.Get("C_DIV");
    v.rMult.p = cx.vs.Get("R_MULT");
    v.gMult.p = cx.vs.Get("G_MULT");
    v.bMult.p = cx.vs.Get("B_MULT");
    v.expDiv.p = cx.vs.Get("EXP_DIV");
    v.alpha.p = cx.vs.Get("ALPHA");
    v.fontSize.p = cx.vs.Get("FONT_SIZE");
    v.rotSpeed.p = cx.vs.Get("ROT_SPEED");
    v.scaleAmp.p = cx.vs.Get("SCALE_AMP");
    v.xAmp.p = cx.vs.Get("X_AMP");
    v.yAmp.p = cx.vs.Get("Y_AMP");
    v.period.p = cx.vs.Get("PERIOD");
}

void FeedbackCharsDemo::OnShutdown(DemoCtx &cx)
{
    (void)cx;
    for (auto &t : targets)
    {
        if (t.id > 0)
        {
            UnloadRenderTexture(t);
            t.id = 0;
        }
    }
}

void FeedbackCharsDemo::OnUpdate(DemoCtx &cx)
{
    RecreateTargetsIfNeeded();
    elapsedMs += cx.dt * 1000.0f;
}

void FeedbackCharsDemo::OnDraw(DemoCtx &cx)
{
    (void)cx;
    if (targets[0].id == 0)
        return;

    float aDiv = std::max(0.0001f, v.aDiv.val());
    float cDiv = std::max(0.0001f, v.cDiv.val());
    float rMult = v.rMult.val();
    float gMult = v.gMult.val();
    float bMult = v.bMult.val();
    float expDiv = std::max(0.0001f, v.expDiv.val());
    float alpha = v.alpha.val();
    float fontSize = v.fontSize.val();
    float rotSpeed = v.rotSpeed.val();
    float scaleAmp = v.scaleAmp.val();
    float xAmp = v.xAmp.val();
    float yAmp = v.yAmp.val();
    float period = std::max(0.0001f, v.period.val());

    float tSec = elapsedMs / 1000.0f;
    float phase = (tSec / period);
    // keep phase in reasonable range to avoid precision issues
    // but do NOT reset elapsedMs so transitions remain smooth
    float twoPi = 6.28318530718f;
    float oscA = std::cos(phase * twoPi / aDiv); // for color/vertical influence
    float oscB = std::cos(phase * twoPi);        // base oscillator
    float oscC = std::sin(phase * twoPi / cDiv); // another axis
    float a = oscA * 100.0f;
    float b = oscB * (a / 100.0f);
    float c = oscC * 100.0f;

    int next = 1 - currentTarget;
    RenderTexture2D &src = targets[currentTarget];
    RenderTexture2D &dst = targets[next];

    BeginTextureMode(dst);
    Rectangle srcRect{0, 0, (float)screenW, -(float)screenH};
    // Derive a uniform scale factor from the same oscillating value that drives rotation (b)
    // Previous code added a raw pixel offset which stretched unevenly; now we scale about center.
    // Scale now driven by SCALE_AMP and the main oscillator
    float scaleFactor = 1.0f + oscB * scaleAmp;
    if (scaleFactor < 0.05f) scaleFactor = 0.05f;      // clamp extreme negatives
    float destW = (float)screenW * scaleFactor;
    float destH = (float)screenH * scaleFactor;
    if (destW < 1) destW = 1;
    if (destH < 1) destH = 1;
    // Center the scaled rectangle so feedback zooms in/out around screen center
    float dx = (screenW - destW) * 0.5f;
    float dy = (screenH - destH) * 0.5f;
    Rectangle dstRect{dx, dy, destW, destH};
    DrawTexturePro(src.texture, srcRect, dstRect, {0, 0}, 0.0f, WHITE);

    auto clamp255 = [](float v)
    { if (v<0) v=0; else if (v>255) v=255; return (unsigned char)v; };
    Color color{clamp255(std::fabs(a) * rMult), clamp255(std::fabs(b) * gMult * 255.0f), clamp255(std::fabs(c) * bMult), clamp255(alpha * 255.0f)};
    float x = screenW * 0.5f + oscC * xAmp;
    float y = screenH * 0.5f + oscA * yAmp;
    float rotation = oscB * rotSpeed; // already degrees per second scaled by oscillator
    Font font = GetFontDefault();
    DrawTextPro(font, chosenChar.c_str(), {x, y}, {fontSize * 0.5f, fontSize * 0.5f}, rotation, fontSize, 0.0f, color);
    EndTextureMode();
    DrawTextureRec(dst.texture, srcRect, {0, 0}, WHITE);
    currentTarget = next;
}
