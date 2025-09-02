#include "KalidascopeDemos.hpp"
#include "../include/Framework.hpp"
#include <algorithm>

void KalidascopeBase::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("MODE").Range(1, 3).Integer()); // 1=rotational,2=quant rotational,3=quadrant mirror
    cx.vs.Add(VB::Create("SPLITS").Range(0, 200).Integer());
    cx.vs.Add(VB::Create("DEG_CHANGE").Range(0, 60).Integer());
    cx.vs.Add(VB::Create("ROT_CHANCE").Range(0, 1));
    cx.vs.Add(VB::Create("MOVE_SPEED").Range(0.01f, 3.f));
    cx.vs.Add(VB::Create("STEPS").Range(1, 20).Integer());
    cx.vs.Add(VB::Create("RUNTIME").Range(50, 40000).Integer());
    cx.vs.Add(VB::Create("QSIZE").Range(0, 128));
    cx.vs.Add(VB::Create("QMOD").Range(1, 12));
    cx.vs.Add(VB::Create("DEFLECTORS").Range(0, 100).Integer());
    cx.vs.Add(VB::Create("FADE").Range(0, 0.1f));
    cx.vs.Add(VB::Create("FIT").BoolInitial(true));
    cx.vs.Add(VB::Create("THICK").Range(0.5f, 6.f));
    cx.vs.Add(VB::Create("R_ADJ").Range(0.0f, 3.0f));
    cx.vs.Add(VB::Create("G_ADJ").Range(0.0f, 3.0f));
    cx.vs.Add(VB::Create("B_ADJ").Range(0.0f, 3.0f));
}

void KalidascopeBase::OnInit(DemoCtx &cx)
{
    if (cx.seed != 0)
    {
        rng.seed(cx.seed ^ 0x9E3779B9u);
    }

    // Cache variable refs for quick access
    v.mode.p = cx.vs.Get("MODE");
    v.splits.p = cx.vs.Get("SPLITS");
    v.degChange.p = cx.vs.Get("DEG_CHANGE");
    v.rotChance.p = cx.vs.Get("ROT_CHANCE");
    v.moveSpeed.p = cx.vs.Get("MOVE_SPEED");
    v.steps.p = cx.vs.Get("STEPS");
    v.runtimeLimit.p = cx.vs.Get("RUNTIME");
    v.quantSize.p = cx.vs.Get("QSIZE");
    v.quantMod.p = cx.vs.Get("QMOD");
    v.deflectors.p = cx.vs.Get("DEFLECTORS");
    v.fade.p = cx.vs.Get("FADE");
    v.fit.p = cx.vs.Get("FIT");
    v.thick.p = cx.vs.Get("THICK");
    v.rAdj.p = cx.vs.Get("R_ADJ");
    v.gAdj.p = cx.vs.Get("G_ADJ");
    v.bAdj.p = cx.vs.Get("B_ADJ");

    lastDeflectorCount = -1; // force rebuild
    deflectors.clear();
    x = canvasW / 2.f;
    y = canvasH / 2.f;
    angle = 0.f;
    prevX = x;
    prevY = y;
    runtime = 0;
    r = g = b = 255;
    rDir = gDir = bDir = 1;

    if (!rtReady)
    {
        rt = LoadRenderTexture(canvasW, canvasH);
        rtReady = true;
        SetTextureFilter(rt.texture, TEXTURE_FILTER_BILINEAR);
    }

    BeginTextureMode(rt);
    ClearBackground(BLACK);
    EndTextureMode();
}

void KalidascopeBase::OnUpdate(DemoCtx &cx)
{
    (void)cx; // all state derived from variable refs

    // Rebuild deflectors list if count changed
    int desiredDeflectors = (int)v.deflectors.val();

    if (desiredDeflectors != lastDeflectorCount)
    {
        lastDeflectorCount = desiredDeflectors;
        deflectors.clear();
        for (int i = 0; i < desiredDeflectors; i++)
            deflectors.push_back({RandFloat(0, (float)canvasW), RandFloat(0, (float)canvasH)});
    }

    BeginTextureMode(rt);
    float fade = v.fade.val();

    if (fade > 0.0f)
    {
        DrawRectangle(0, 0, canvasW, canvasH, Fade(BLACK, fade));
    }

    Iterate();
    EndTextureMode();
}

void KalidascopeBase::OnDraw(DemoCtx &cx)
{
    // Draw offscreen texture to window, optionally fit
    if (!rtReady)
    {
        return;
    }

    Rectangle src{0, 0, (float)canvasW, -(float)canvasH};

    fitToWindow = (v.fit.val() >= 0.5f);

    if (fitToWindow)
    {
        float winW = (float)GetScreenWidth();
        float winH = (float)GetScreenHeight();
        float scale = std::min(winW / canvasW, winH / canvasH);
        float drawW = canvasW * scale;
        float drawH = canvasH * scale;
        float dx = (winW - drawW) / 2.f;
        float dy = (winH - drawH) / 2.f;
        Rectangle dst{dx, dy, drawW, drawH};
        DrawTexturePro(rt.texture, src, dst, {0, 0}, 0, WHITE);
    }
    else
    {
        DrawTextureRec(rt.texture, src, {0, 0}, WHITE);
    }
}

void KalidascopeBase::OnShutdown(DemoCtx &cx)
{
    if (rtReady)
    {
        UnloadRenderTexture(rt);
        rtReady = false;
    }
}

void KalidascopeBase::Attraction()
{
    // Move towards nearest deflector if within range
    float minDist2 = 200.f * 200.f;
    float bestDx = 0, bestDy = 0;
    bool found = false;

    for (auto &d : deflectors)
    {
        float dx = d.x - x;
        float dy = d.y - y;
        float dsq = dx * dx + dy * dy;

        if (dsq < minDist2)
        {
            minDist2 = dsq;
            bestDx = dx;
            bestDy = dy;
            found = true;
        }
    }

    if (found)
    {
        float dist = std::sqrt(minDist2);

        if (dist > 1e-3f)
        {
            x += bestDx / dist; // simple pull step
            y += bestDy / dist;
        }
    }
}

void KalidascopeBase::AdvanceOneStepVariantCommon()
{
    float rotationChance = v.rotChance.val();
    float maxDegreeChange = v.degChange.val();

    if (RandFloat(0, 1) < rotationChance)
    {
        angle += RandFloat(-maxDegreeChange, maxDegreeChange);
    }

    float mv = v.moveSpeed.val();
    prevX = x;
    prevY = y;
    float rad = angle * (3.14159265f / 180.f);
    x += std::cos(rad) * mv;
    y += std::sin(rad) * mv;

    if (x < 0)
    {
        // x += canvasW;
        x = 0;
    }
    else if (x >= canvasW)
    {
        // x -= canvasW;
        x = canvasW;
    }

    if (y < 0)
    {
        // y += canvasH;
        y = 0;
    }
    else if (y >= canvasH)
    {
        // y -= canvasH;
        y = canvasH;
    }

    Attraction();

    auto stepChannel = [&](int &val, int &dir, int adjust)
    { if(adjust<=0) return; val += dir * RandInt(0,adjust); if(val>255){val=255;dir=-dir;} else if(val<0){val=0;dir=-dir;} };

    stepChannel(r, rDir, (int)v.rAdj.val());
    stepChannel(g, gDir, (int)v.gAdj.val());
    stepChannel(b, bDir, (int)v.bAdj.val());
}

void KalidascopeBase::DrawStepVariant1()
{
    int splits = (int)v.splits.val();
    if (splits <= 0)
        return;
    float thick = v.thick.val();
    float cx = canvasW / 2.f, cy = canvasH / 2.f;
    float dxPrev = prevX - cx, dyPrev = prevY - cy;
    float dx = x - cx, dy = y - cy;
    Color col{(unsigned char)r, (unsigned char)g, (unsigned char)b, 255};
    for (int i = 0; i < splits; i++)
    {
        float ang = (2 * 3.14159265f * i) / splits;
        float prx = dxPrev * std::cos(ang) - dyPrev * std::sin(ang);
        float pry = dxPrev * std::sin(ang) + dyPrev * std::cos(ang);
        float rx = dx * std::cos(ang) - dy * std::sin(ang);
        float ry = dx * std::sin(ang) + dy * std::cos(ang);
        DrawLineEx({cx + prx, cy + pry}, {cx + rx, cy + ry}, thick, col);
    }
}

void KalidascopeBase::DrawStepVariant2()
{
    int splits = (int)v.splits.val();
    if (splits <= 0)
        return;
    float thick = v.thick.val();
    float qsize = v.quantSize.val();
    float qmod = v.quantMod.val();
    if (qmod < 1)
        qmod = 1;
    float qx = x, qy = y, pqx = prevX, pqy = prevY;
    if (qsize > 0)
    {
        auto quant = [&](float &vx)
        { vx = std::floor(vx / qsize) * qsize; if (qmod>1) vx = std::fmod(vx, canvasW * qmod); };
        quant(qx);
        quant(qy);
        quant(pqx);
        quant(pqy);
    }
    float cx = canvasW / 2.f, cy = canvasH / 2.f;
    float dx = qx - cx, dy = qy - cy;
    float dxPrev = pqx - cx, dyPrev = pqy - cy;
    Color col{(unsigned char)r, (unsigned char)g, (unsigned char)b, 255};
    for (int i = 0; i < splits; i++)
    {
        float ang = (2 * 3.14159265f * i) / splits;
        float prx = dxPrev * std::cos(ang) - dyPrev * std::sin(ang);
        float pry = dxPrev * std::sin(ang) + dyPrev * std::cos(ang);
        float rx = dx * std::cos(ang) - dy * std::sin(ang);
        float ry = dx * std::sin(ang) + dy * std::cos(ang);
        DrawLineEx({cx + prx, cy + pry}, {cx + rx, cy + ry}, thick, col);
    }
}

void KalidascopeBase::DrawStepVariant3()
{
    float thick = v.thick.val();
    float cx = canvasW / 2.f, cy = canvasH / 2.f;
    float dx = x - cx, dy = y - cy;
    float dxPrev = prevX - cx, dyPrev = prevY - cy;
    Color col{(unsigned char)r, (unsigned char)g, (unsigned char)b, 255};
    auto dl = [&](float ax, float ay, float bx, float by)
    { DrawLineEx({cx + ax, cy + ay}, {cx + bx, cy + by}, thick, col); };
    dl(dxPrev, dyPrev, dx, dy);
    dl(-dxPrev, dyPrev, -dx, dy);
    dl(dxPrev, -dyPrev, dx, -dy);
    dl(-dxPrev, -dyPrev, -dx, -dy);
}

void KalidascopeBase::Iterate()
{
    int steps = (int)v.steps.val();
    if (steps < 1)
        steps = 1;
    int maxRuntime = (int)v.runtimeLimit.val();
    if (maxRuntime < 1)
        maxRuntime = 1;
    for (int i = 0; i < steps; i++)
    {
        AdvanceOneStepVariantCommon();
        if (runtime < maxRuntime)
            DrawCurrentStep();
        runtime++;
        if (runtime >= maxRuntime)
        {
            runtime = 0;
            x = canvasW / 2.f;
            y = canvasH / 2.f;
            angle = 0.f;
        }
    }
}

void KalidascopeBase::DrawCurrentStep()
{
    int mode = (int)v.mode.val();
    if (mode == 2)
    {
        DrawStepVariant2();
    }
    else if (mode == 3)
    {
        DrawStepVariant3();
    }
    else
    {
        DrawStepVariant1();
    }
}

void Kalidascope::DrawCurrentStep() { KalidascopeBase::DrawCurrentStep(); }
