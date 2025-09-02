#pragma once
#include "raylib.h"
#include "../include/Framework.hpp"
#include <vector>
#include <cmath>
#include <random>

// Improvements added:
// - Offscreen render texture support (persistent drawing independent of window size).
// - Exposed tunable parameters via variable system (splits, degree change, speed, rotation chance, quantization, steps, deflectors, fade, fit).
// - More faithful color channel evolution with directional reversal at bounds and optional per-channel enable.
// - Background fading option for variants without run resets.

struct KDDeflector
{
    float x;
    float y;
};

class KalidascopeBase : public BaseDemo
{
protected:
    // Canvas size (offscreen); tweak here if needed
    int canvasW = 1920, canvasH = 1080;

    // state
    float x = 0.f, y = 0.f, angle = 0.f; // angle in degrees
    float prevX = 0.f, prevY = 0.f;      // previous position for line drawing
    int runtime = 0;
    int r = 255, g = 255, b = 255;
    int rDir = 1, gDir = 1, bDir = 1; // color direction for oscillation
    std::vector<KDDeflector> deflectors;
    std::mt19937 rng{std::random_device{}()};

    // Rendering resources
    RenderTexture2D rt{}; // offscreen canvas
    bool rtReady = false;
    bool fitToWindow = true; // read from variable FIT each frame

    // Dynamic variable references (populated in OnInit)
    struct Vars
    {
        VarRef mode, splits, degChange, rotChance, moveSpeed, steps, runtimeLimit;
        VarRef quantSize, quantMod, deflectors, fade, fit, thick;
        VarRef rAdj, gAdj, bAdj; // color channel adjustment magnitudes
    } v;
    int lastDeflectorCount = -1; // to detect changes

    // helpers
    float RandFloat(float a, float b)
    {
        std::uniform_real_distribution<float> d(a, b);
        return d(rng);
    }
    int RandInt(int a, int b) { return a + (int)(RandFloat(0.f, 1.f) * (float)(b - a)); }
    virtual void Iterate();
    virtual void DrawStepVariant1();
    virtual void DrawStepVariant2();
    virtual void DrawStepVariant3();
    virtual void DrawCurrentStep(); // dispatches to correct variant drawing

    void Attraction();
    void AdvanceOneStepVariantCommon();

public:
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override; // blank (we draw during update into persistent buffer)
    void OnShutdown(DemoCtx &cx) override;
};

class Kalidascope : public KalidascopeBase
{
public:
    std::string Name() const override { return "Kalidascope"; }

protected:
    void DrawCurrentStep() override; // chooses variant by MODE variable
};
