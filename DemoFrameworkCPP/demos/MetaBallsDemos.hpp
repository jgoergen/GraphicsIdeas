#pragma once
#include "raylib.h"
#include "../include/Framework.hpp"
#include <vector>
#include <random>
#include <array>

struct MBall
{
    float x;
    float y;
    float vx;
    float vy;
};

struct GradientStop
{
    float t;
    Color c;
};

class MetaBallsBase : public BaseDemo
{
protected:
    int canvasW = 1400;
    int canvasH = 800;
    int ballCount = 20;
    float radius = 120.f; // base radius
    float blur = 40.f;    // blur extent
    int oversamples = 2;
    float maxMoveSpeed = 6.f;
    int threshold = 120;
    bool flatMode = false;
    int staticAmount = 40;
    bool fuzzyBalls = false;
    float globalAlpha = 0.8f;
    float fadeChance = 0.0f; // variant3 only
    // Tracking previous to rebuild texture if changed
    float prevRadius = -1.f, prevBlur = -1.f;
    int prevOversamples = -1;
    bool prevFuzzy = false;
    int emptyFrames = 0; // adaptive threshold helper

    std::vector<MBall> balls;
    std::mt19937 rng{std::random_device{}()};

    // Rendering
    RenderTexture2D baseRT{};
    bool baseReady = false; // accumulates drawn balls (white blurred circles)
    Texture2D circleTex{};
    bool circleReady = false; // precomputed blurred circle texture
    Texture2D processedTex{};
    bool processedReady = false; // cached processed output

    // Gradient lookup (256 entries) each frame static
    std::array<Color, 256> gradient{};

    // Variants may tweak params before resources built
    virtual void ConfigureVariant() {}

    float RandF(float a, float b)
    {
        std::uniform_real_distribution<float> d(a, b);
        return d(rng);
    }
    int RandI(int a, int b)
    {
        std::uniform_int_distribution<int> d(a, b);
        return d(rng);
    }

    void BuildGradient();
    void BuildCircleTexture();
    void SpawnBalls();
    void UpdateBalls();
    void DrawBallsToRT();
    void ProcessAndPresent();
    void ReleaseResources();

public:
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override;
    void OnShutdown(DemoCtx &cx) override { ReleaseResources(); }
};

class MetaBalls1 : public MetaBallsBase
{
public:
    std::string Name() const override { return "Meta Balls 1"; }

protected:
    void ConfigureVariant() override
    {
        canvasW = 1400;
        canvasH = 800;
        fadeChance = 0.0f;
    }
};
class MetaBalls2 : public MetaBallsBase
{
public:
    std::string Name() const override { return "Meta Balls 2"; }

protected:
    void ConfigureVariant() override
    {
        canvasW = 1400;
        canvasH = 800;
        fadeChance = 0.0f;
    }
};
class MetaBalls3 : public MetaBallsBase
{
public:
    std::string Name() const override { return "Meta Balls 3"; }

protected:
    void ConfigureVariant() override
    {
        canvasW = 800;
        canvasH = 600;
        fadeChance = 0.5f;
        radius = 100.f;
        ballCount = 12;
        maxMoveSpeed = 5.f;
    }
};
