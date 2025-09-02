#pragma once
#include "raylib.h"
#include "../include/Framework.hpp"
#include "../include/Verlet.hpp"
#include <random>

// Kaleidoscope demo driven by a Verlet particle system.
// Particles (balls) move under verlet physics + random gravity/effectors; we render
// mirrored/rotational line trails using their lastPos -> pos as segments.

class KalidaVerletDemo : public BaseDemo
{
public:
    std::string Name() const override { return "Kalida Verlet"; }

    void OnConfigure(DemoCtx &cx) override; // declare dynamic variables
    void OnInit(DemoCtx &cx) override;      // build initial system & render target
    void OnUpdate(DemoCtx &cx) override;    // advance physics & draw lines
    void OnDraw(DemoCtx &cx) override;      // blit offscreen to screen
    void OnShutdown(DemoCtx &cx) override;  // cleanup

private:
    // Offscreen render texture (persistent)
    RenderTexture2D rt{};
    bool rtReady = false;
    int canvasW = 1920, canvasH = 1080;
    bool fitToWindow = true;

    // Verlet system
    df::VerletSystem vs;
    int lastParticleCount = -1;
    int lastEffectorCount = -1;
    std::vector<Vector2> prevDraw; // previous drawn position per particle
    bool prevInit = false;

    // Gravity randomization timer
    float gravTimer = 0.f;
    float gravNext = 3.f;

    // Cached variable refs
    struct Vars
    {
        VarRef mode, splits, qsize, qmod, thick, fade, fit, balls, effectors, gravMax, minTime, maxTime, forceMin, forceMax, bounceMax, rAdj, gAdj, bAdj;
    } v;

    std::mt19937 rng{std::random_device{}()};
    float lastBounceMax = -1.f;

    void RebuildParticles(int count);
    void RebuildEffectors(int count);
    void RandomizeGravityAndEffectors();
    void ScheduleNextGravity();
    void DrawParticleSegment(const Vector2 &start, const Vector2 &end);
    void DrawRotational(const Vector2 &prev, const Vector2 &cur, int splits, float thick, Color col);
    void DrawQuadrant(const Vector2 &prev, const Vector2 &cur, float thick, Color col);
};
