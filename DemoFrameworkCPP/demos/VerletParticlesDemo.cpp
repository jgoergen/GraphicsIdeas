// Clean implementation aligning with updated header (variants, palette, etc.)
#include "VerletParticlesDemo.hpp"
#include "raylib.h"
#include "../include/Framework.hpp"
#include "../include/MathUtils.hpp"
#include <algorithm>
#include <random>

void BaseVerletParticlesDemo::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("PARTICLE_COUNT").Range(10, 12000).Initial((float)targetParticleCount).Integer());
    cx.vs.Add(VB::Create("ITER").Range(1, 6).Initial(2).Integer());
    cx.vs.Add(VB::Create("GRAV_X").Range(-0.5f, 0.5f).Initial(0));
    cx.vs.Add(VB::Create("GRAV_Y").Range(-0.5f, 0.5f).Initial(0.1f));
    cx.vs.Add(VB::Create("SPEED").Range(1, 25).Initial(8));
    cx.vs.Add(VB::Create("FADE").Range(0, 1).Initial(fadeBackground));
    cx.vs.Add(VB::Create("SHELL").Range(-50, 200).Initial((float)shellSize).Integer());
    cx.vs.Add(VB::Create("COLLIDE_T").Range(0, 120).Initial((float)collideThreshold).Integer());
}

void BaseVerletParticlesDemo::OnInit(DemoCtx &cx)
{
    // pull current variable values
    targetParticleCount = (int)cx.vs.Get("PARTICLE_COUNT")->value;
    fadeBackground = cx.vs.Get("FADE")->value;
    shellSize = (int)cx.vs.Get("SHELL")->value;
    collideThreshold = (int)cx.vs.Get("COLLIDE_T")->value;
    vs.gravity = {cx.vs.Get("GRAV_X")->value, cx.vs.Get("GRAV_Y")->value};
    float sp = cx.vs.Get("SPEED")->value;
    vs.speedMin = {-sp, -sp};
    vs.speedMax = {sp, sp};
    vs.iterations = (int)cx.vs.Get("ITER")->value;
    vs.markCollides = true;
    vs.stageMin = {10, 10};
    vs.stageMax = {(float)GetScreenWidth() - 10, (float)GetScreenHeight() - 10};
    ConfigureVariant(); // let variant override some values
    GenerateParticles();
    GenerateEffectors();
}

void BaseVerletParticlesDemo::GenerateParticles()
{
    vs.clear();
    std::mt19937 rng((unsigned)time(nullptr) ^ GetRandomValue(0, 999999));
    std::uniform_real_distribution<float> distX(vs.stageMin.x, vs.stageMax.x);
    std::uniform_real_distribution<float> distY(vs.stageMin.y, vs.stageMax.y);
    std::uniform_real_distribution<float> distR(minRadius, maxRadius);
    for (int i = 0; i < targetParticleCount; ++i)
    {
        float r = distR(rng);
        auto *p = new df::Particle({distX(rng), distY(rng)});
        p->radius = r;
        p->collides = true;
        if (useMass)
        {
            p->mass = std::max(1.f, r * 0.5f);
        }
        Color c;
        if (colorFromPalette && !palette.empty())
            c = palette[i % palette.size()];
        else
            c = Color{(unsigned char)GetRandomValue(0, 255), (unsigned char)GetRandomValue(0, 255), (unsigned char)GetRandomValue(0, 255), 255};
        c.a = (unsigned char)std::clamp((int)(particleAlpha * 255), 1, 255);
        p->data.color = c;
        vs.addParticle(p);
    }
}

void BaseVerletParticlesDemo::GenerateEffectors()
{
    vs.effectors.clear();
    // basic grid of gentle effectors
    for (int i = 0; i < 3; ++i)
    {
        for (int j = 0; j < 3; ++j)
        {
            df::Effector e;
            e.pos = {vs.stageMin.x + (vs.stageMax.x - vs.stageMin.x) * (i / 2.0f), vs.stageMin.y + (vs.stageMax.y - vs.stageMin.y) * (j / 2.0f)};
            e.force = ((float)GetRandomValue(-200, 200)) / 10000.0f;
            e.radius = (float)GetRandomValue(60, 180);
            vs.addEffector(e);
        }
    }
}

void BaseVerletParticlesDemo::OnUpdate(DemoCtx &cx)
{
    (void)cx;
    // multiple sub-steps for stability
    for (int i = 0; i < 2; ++i)
        vs.runTimeStep(GetFrameTime());
    gravityTimer += GetFrameTime();
    if (gravityTimer > gravityNextChange)
    {
        RandomizeGravityAndEffectors();
    }
    CustomPerFrame();
}

void BaseVerletParticlesDemo::OnDraw(DemoCtx &cx)
{
    (void)cx;
    DrawBackground(cx);
    for (auto *p : vs.particles)
    {
        if (ShouldDraw(p))
        {
            DrawCircleV(Vector2{p->pos.x, p->pos.y}, p->radius + shellAddFill, p->data.color);
            if (drawShell)
                DrawCircleLines((int)p->pos.x, (int)p->pos.y, (float)(p->radius + shellSize), Fade(p->data.color, 0.2f));
        }
    }
}

bool BaseVerletParticlesDemo::ShouldDraw(const df::Particle *p) const
{
    if (!useCollisionDrawLogic)
        return p->data.drawn;
    bool cond = drawWhenCollideGreater ? (p->data.collided > collideThreshold) : (p->data.collided < collideThreshold);
    return p->data.drawn && cond;
}

void BaseVerletParticlesDemo::DrawBackground(DemoCtx &cx)
{
    (void)cx;
    if (invertBackgroundColor)
    {
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), Fade(WHITE, backgroundFadeAlpha));
        return;
    }
    if (fadeBackground > 0)
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), Fade(BLACK, (backgroundFadeAlpha > 0 ? backgroundFadeAlpha : fadeBackground)));
    else if (!persistentFrame)
        ClearBackground(BLACK);
}

void BaseVerletParticlesDemo::RandomizeGravityAndEffectors()
{
    vs.gravity.x = GetRandomValue((int)(gravXMin * 1000), (int)(gravXMax * 1000)) / 1000.f;
    vs.gravity.y = GetRandomValue((int)(gravYMin * 1000), (int)(gravYMax * 1000)) / 1000.f;
    for (auto &e : vs.effectors)
    {
        e.radius = GetRandomValue((int)effRadMin, (int)effRadMax);
        e.force = GetRandomValue((int)(effForceMin * 1000), (int)(effForceMax * 1000)) / 1000.f;
    }
    gravityTimer = 0.f;
    ScheduleNextGravity(0.5f, 5.f);
}

void BaseVerletParticlesDemo::ScheduleNextGravity(float minSec, float maxSec)
{
    gravityNextChange = GetRandomValue((int)(minSec * 1000), (int)(maxSec * 1000)) / 1000.f;
}

// Variant specific configurations
void VerletParticlesDemo1::ConfigureVariant()
{
    targetParticleCount = 600;
    minRadius = 8;
    maxRadius = 40;
    particleAlpha = 0.6f;
    fadeBackground = 0.03f;
    backgroundFadeAlpha = 0.03f;
    ScheduleNextGravity(1.f, 8.f);
}
void VerletParticlesDemo2::ConfigureVariant()
{
    targetParticleCount = 600;
    palette = {WHITE, BLACK};
    colorFromPalette = true;
    persistentFrame = true;
    fadeBackground = 0.0f;
    ScheduleNextGravity(1.f, 8.f);
}
void VerletParticlesDemo3::ConfigureVariant()
{
    targetParticleCount = 1000;
    minRadius = 5;
    maxRadius = 20;
    palette = {Color{0x3a, 0x55, 0x3a, 255}, Color{0x2b, 0x44, 0x2b, 255}};
    colorFromPalette = true;
    persistentFrame = true;
    fadeBackground = 0.0f;
    ScheduleNextGravity(1.f, 8.f);
}
void VerletParticlesDemo4::ConfigureVariant()
{
    targetParticleCount = 2000 + GetRandomValue(0, 2000);
    minRadius = (float)GetRandomValue(3, 6);
    maxRadius = (float)GetRandomValue(8, 55);
    shellSize = 10;
    collideThreshold = 18;
    useCollisionDrawLogic = true;
    drawWhenCollideGreater = true;
    particleAlpha = 0.41f;
    backgroundFadeAlpha = ((float)GetRandomValue(5, 25)) / 100.f;
    ScheduleNextGravity(0.5f, 5.f);
}
void VerletParticlesDemo5::ConfigureVariant()
{
    targetParticleCount = 8000;
    minRadius = 8;
    maxRadius = 30;
    particleAlpha = 0.6f;
    fadeBackground = 1.f;
    backgroundFadeAlpha = 1.f;
    ScheduleNextGravity(1.f, 8.f);
}
void VerletParticlesDemo6::ConfigureVariant()
{
    targetParticleCount = 1000 + GetRandomValue(0, 1000);
    minRadius = (float)GetRandomValue(3, 6);
    maxRadius = (float)GetRandomValue(12, 65);
    shellSize = 20;
    collideThreshold = 5;
    useCollisionDrawLogic = true;
    drawWhenCollideGreater = false;
    particleAlpha = 0.51f;
    backgroundFadeAlpha = ((float)GetRandomValue(5, 25)) / 100.f;
    ScheduleNextGravity(0.5f, 5.f);
}
void VerletParticlesDemo7::ConfigureVariant()
{
    targetParticleCount = 600 + GetRandomValue(0, 600);
    minRadius = (float)GetRandomValue(5, 15);
    maxRadius = (float)GetRandomValue(15, 50);
    shellSize = (int)GetRandomValue(20, 170);
    collideThreshold = (int)GetRandomValue(1, 18);
    useCollisionDrawLogic = true;
    drawWhenCollideGreater = false;
    particleAlpha = 0.45f;
    backgroundFadeAlpha = ((float)GetRandomValue(5, 15)) / 100.f;
    ScheduleNextGravity(0.5f, 5.f);
}
void VerletCellsDemo1::ConfigureVariant()
{
    targetParticleCount = 2000;
    minRadius = 5;
    maxRadius = 30;
    shellSize = 4;
    particleAlpha = 0.1f;
    backgroundFadeAlpha = 0.08f;
    ScheduleNextGravity(1.f, 8.f);
}

void VerletCellsDemo2::ConfigureVariant()
{
    targetParticleCount = (int)GetRandomValue(0, 1000);
    minRadius = (float)GetRandomValue(2, 12);
    maxRadius = (float)GetRandomValue(12, 70);
    shellSize = (int)GetRandomValue(-3, 3);
    particleAlpha = ((float)GetRandomValue(60, 90)) / 100.f;
    useMass = true;
    perMassAlpha = true;
    invertBackgroundColor = true;
    backgroundFadeAlpha = ((float)GetRandomValue(10, 90)) / 100.f;
    ScheduleNextGravity(0.5f, 6.f);
}

// Variant custom particle generation (override to replicate original JS differences)
void VerletParticlesDemo1::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo2::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo3::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo4::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo5::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo6::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletParticlesDemo7::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletCellsDemo1::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }
void VerletCellsDemo2::GenerateParticles() { BaseVerletParticlesDemo::GenerateParticles(); }

// Background overrides
void VerletParticlesDemo2::DrawBackground(DemoCtx &cx) { (void)cx; /* persistent frame no action */ }
void VerletParticlesDemo3::DrawBackground(DemoCtx &cx) { (void)cx; }
void VerletParticlesDemo5::DrawBackground(DemoCtx &cx)
{
    (void)cx;
    ClearBackground(BLACK);
} // hard clear
void VerletCellsDemo2::DrawBackground(DemoCtx &cx)
{
    (void)cx;
    DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), Fade(WHITE, backgroundFadeAlpha));
}
