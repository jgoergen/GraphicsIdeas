#pragma once
#include "BaseDemo.hpp"
#include "../include/Verlet.hpp"
#include <memory>

// Base class factorizing shared logic for simple particle/effectors demos
class BaseVerletParticlesDemo : public BaseDemo
{
protected:
    df::VerletSystem vs; // physics
    int targetParticleCount = 600;
    float fadeBackground = 0.05f;
    bool drawShell = false;
    int shellSize = 0;
    bool invertDrawCondition = false; // for variants that draw only collided > threshold etc.
    int collideThreshold = 0;
    Color bgColor{0, 0, 0, 255};
    Color fadeColor{0, 0, 0, 10};
    bool useMass = false;
    float minRadius = 5.f;
    float maxRadius = 8.f;
    float particleAlpha = 0.2f;
    bool colorFromPalette = false;
    std::vector<Color> palette;
    // gravity/effectors randomization timing
    float gravityTimer = 0.f;
    float gravityNextChange = 0.f;
    float gravXMin = -0.05f, gravXMax = 0.05f, gravYMin = -0.05f, gravYMax = 0.05f; // ranges per variant
    float effForceMin = -0.2f, effForceMax = 0.2f, effRadMin = 50.f, effRadMax = 200.f;
    bool useCollisionDrawLogic = false; // variants 4,6,7 use collided threshold conditions
    bool drawWhenCollideGreater = true; // true: collided>threshold else collided<threshold
    bool perMassAlpha = false;          // cells2
    bool invertBackgroundColor = false; // cells2
    bool persistentFrame = false;       // variants 2 & 3 (no fade / clear)
    float backgroundFadeAlpha = 0.0f;   // overlay alpha each frame (0 = none, >0 draws)
    float shellAddFill = 0.f;           // radius addition when drawing fill

    virtual void ConfigureVariant() {}
    virtual void GenerateParticles();
    virtual void GenerateEffectors();
    virtual void CustomPerFrame() {}
    virtual bool ShouldDraw(const df::Particle *p) const;
    virtual void DrawBackground(DemoCtx &cx);
    void RandomizeGravityAndEffectors();
    void ScheduleNextGravity(float minSec, float maxSec);

public:
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override;
    std::string Name() const override { return "Verlet Particles"; }
};

class VerletParticlesDemo1 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 1"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
};
class VerletParticlesDemo2 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 2"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
    void DrawBackground(DemoCtx &cx) override;
};
class VerletParticlesDemo3 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 3"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
    void DrawBackground(DemoCtx &cx) override;
};
class VerletParticlesDemo4 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 4"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
};
class VerletParticlesDemo5 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 5"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
    void DrawBackground(DemoCtx &cx) override;
};
class VerletParticlesDemo6 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 6"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
};
class VerletParticlesDemo7 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Particles 7"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
};
class VerletCellsDemo1 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Cells 1"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
};
class VerletCellsDemo2 : public BaseVerletParticlesDemo
{
public:
    std::string Name() const override { return "Verlet Cells 2"; }
    void ConfigureVariant() override;
    void GenerateParticles() override;
    void DrawBackground(DemoCtx &cx) override;
};
