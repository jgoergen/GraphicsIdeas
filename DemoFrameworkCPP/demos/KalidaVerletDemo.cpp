#include "KalidaVerletDemo.hpp"
#include <algorithm>

void KalidaVerletDemo::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("MODE").Range(1, 3).Integer()); // 1=rotational,2=quant rotational,3=quadrant mirror
    cx.vs.Add(VB::Create("SPLITS").Range(0, 200).Integer());
    cx.vs.Add(VB::Create("QSIZE").Range(0, 128).Integer());
    cx.vs.Add(VB::Create("QMOD").Range(1, 12).Integer());
    cx.vs.Add(VB::Create("THICK").Range(0.5f, 6.f));
    cx.vs.Add(VB::Create("FADE").Range(0, 0.3f));
    cx.vs.Add(VB::Create("FIT"));
    cx.vs.Add(VB::Create("BALLS").Range(5, 40).Integer());
    cx.vs.Add(VB::Create("EFFECTORS").Range(0, 12).Integer());
    cx.vs.Add(VB::Create("GRAV_MAX").Range(0.01f, 0.4f)); // gravity component range (-g..g)
    cx.vs.Add(VB::Create("GRAV_TMIN").Range(0.3f, 3.f));
    cx.vs.Add(VB::Create("GRAV_TMAX").Range(1.f, 5.f));
    cx.vs.Add(VB::Create("FORCE_MIN").Range(-1.6f, 0.f)); // effector min force (pull)
    cx.vs.Add(VB::Create("FORCE_MAX").Range(0.f, 1.6f));  // effector max force (push)
    cx.vs.Add(VB::Create("BOUNCE_MAX").Range(0.f, 1.f));  // per-particle random bounce (0..bounce)
    cx.vs.Add(VB::Create("R_ADJ").Range(0.0f, 1.0f));
    cx.vs.Add(VB::Create("G_ADJ").Range(0.0f, 1.0f));
    cx.vs.Add(VB::Create("B_ADJ").Range(0.0f, 1.0f));
}

void KalidaVerletDemo::OnInit(DemoCtx &cx)
{
    if (cx.seed)
        rng.seed(cx.seed ^ 0x517cc1b7u);
    // cache refs
    v.mode.p = cx.vs.Get("MODE");
    v.splits.p = cx.vs.Get("SPLITS");
    v.qsize.p = cx.vs.Get("QSIZE");
    v.qmod.p = cx.vs.Get("QMOD");
    v.thick.p = cx.vs.Get("THICK");
    v.fade.p = cx.vs.Get("FADE");
    v.fit.p = cx.vs.Get("FIT");
    v.balls.p = cx.vs.Get("BALLS");
    v.effectors.p = cx.vs.Get("EFFECTORS");
    v.gravMax.p = cx.vs.Get("GRAV_MAX");
    v.minTime.p = cx.vs.Get("GRAV_TMIN");
    v.maxTime.p = cx.vs.Get("GRAV_TMAX");
    v.forceMin.p = cx.vs.Get("FORCE_MIN");
    v.forceMax.p = cx.vs.Get("FORCE_MAX");
    v.bounceMax.p = cx.vs.Get("BOUNCE_MAX");
    v.rAdj.p = cx.vs.Get("R_ADJ");
    v.gAdj.p = cx.vs.Get("G_ADJ");
    v.bAdj.p = cx.vs.Get("B_ADJ");

    lastParticleCount = -1;
    lastEffectorCount = -1;
    vs.stageMin = {0, 0};
    vs.stageMax = {(float)canvasW, (float)canvasH};
    vs.speedMin = {-8, -8};
    vs.speedMax = {8, 8};
    vs.iterations = 2;
    vs.gravity = {0, 0};
    RebuildParticles((int)v.balls.val());
    RebuildEffectors((int)v.effectors.val());
    ScheduleNextGravity();
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

void KalidaVerletDemo::OnShutdown(DemoCtx &cx)
{
    (void)cx;
    if (rtReady)
    {
        UnloadRenderTexture(rt);
        rtReady = false;
    }
    vs.clear();
}

void KalidaVerletDemo::RebuildParticles(int count)
{
    if (count == lastParticleCount)
        return;
    lastParticleCount = count;
    vs.clear();
    vs.effectors.clear(); // will be recreated after
    prevDraw.clear();
    prevInit = false;
    std::uniform_real_distribution<float> dx(0, (float)canvasW), dy(0, (float)canvasH);
    std::uniform_real_distribution<float> vel(-4.f, 4.f); // give initial velocity for more pronounced motion
    std::uniform_real_distribution<float> bounceDist(0.f, v.bounceMax.val());
    for (int i = 0; i < count; i++)
    {
        auto *p = new df::Particle({dx(rng), dy(rng)});
        p->radius = 10;
        p->collides = true;
        p->bounce = bounceDist(rng);
        // impart initial velocity by offsetting lastPos
        p->lastPos = {p->pos.x - vel(rng), p->pos.y - vel(rng)};
        vs.addParticle(p);
        prevDraw.push_back({p->pos.x, p->pos.y});
    }
    prevInit = true;
}

void KalidaVerletDemo::RebuildEffectors(int count)
{
    if (count == lastEffectorCount)
        return;

    lastEffectorCount = count;
    vs.effectors.clear();
    std::uniform_real_distribution<float> dx(0, (float)canvasW), dy(0, (float)canvasH);
    float fmin = v.forceMin.val();
    float fmax = v.forceMax.val();

    if (fmax < fmin)
        std::swap(fmax, fmin);

    std::uniform_real_distribution<float> fr(fmin, fmax), rr(40, (float)std::min(canvasW, canvasH) / 3.f);

    for (int i = 0; i < count; i++)
    {
        df::Effector e;
        e.pos = {dx(rng), dy(rng)};
        e.force = fr(rng);
        e.radius = rr(rng);
        vs.addEffector(e);
    }
}

void KalidaVerletDemo::RandomizeGravityAndEffectors()
{
    float gmax = v.gravMax.val();

    if (gmax < 0.001f)
        gmax = 0.001f;

    std::uniform_real_distribution<float> g(-gmax, gmax);
    vs.gravity = {g(rng), g(rng)};
    float fmin = v.forceMin.val();
    float fmax = v.forceMax.val();

    if (fmax < fmin)
        std::swap(fmax, fmin);

    std::uniform_real_distribution<float> fr(fmin, fmax);

    for (auto &e : vs.effectors)
    {
        e.force = fr(rng);
    }

    gravTimer = 0.f;
    ScheduleNextGravity();
}

void KalidaVerletDemo::ScheduleNextGravity()
{
    float mn = v.minTime.val();
    float mx = v.maxTime.val();

    if (mx < mn)
        std::swap(mx, mn);
    if (mn < 0.1f)
        mn = 0.1f;
    if (mx < mn + 0.1f)
        mx = mn + 0.1f;

    std::uniform_real_distribution<float> d(mn, mx);
    gravNext = d(rng);
}

void KalidaVerletDemo::OnUpdate(DemoCtx &cx)
{
    (void)cx;
    // Rebuild if counts changed
    RebuildParticles((int)v.balls.val());
    RebuildEffectors((int)v.effectors.val());

    // If bounce max changed, reassign per-particle bounce values
    float bmax = v.bounceMax.val();
    if (bmax != lastBounceMax)
    {
        lastBounceMax = bmax;
        std::uniform_real_distribution<float> bounceDist(0.f, bmax);
        for (auto *p : vs.particles)
            p->bounce = bounceDist(rng);
    }

    // Ensure prevDraw sized
    if (prevDraw.size() != vs.particles.size())
    {
        prevDraw.resize(vs.particles.size());
        for (size_t i = 0; i < vs.particles.size(); ++i)
            prevDraw[i] = {vs.particles[i]->pos.x, vs.particles[i]->pos.y};
    }

    // Physics step
    vs.runTimeStep(GetFrameTime());
    // Fade background
    BeginTextureMode(rt);
    float fade = v.fade.val();

    if (fade > 0)
        DrawRectangle(0, 0, canvasW, canvasH, Fade(BLACK, fade));

    // Draw each particle segment from previous drawn position to new position
    for (size_t i = 0; i < vs.particles.size(); ++i)
    {
        auto *p = vs.particles[i];
        Vector2 start = prevDraw[i];
        Vector2 end{p->pos.x, p->pos.y};
        DrawParticleSegment(start, end);
        prevDraw[i] = end;
    }

    EndTextureMode();
    // Gravity timer
    gravTimer += GetFrameTime();

    if (gravTimer > gravNext)
        RandomizeGravityAndEffectors();
}

void KalidaVerletDemo::DrawParticleSegment(const Vector2 &prev, const Vector2 &cur)
{
    static int r = 255, g = 255, b = 255;
    static int rd = 1, gd = 1, bd = 1; // global evolving color
    auto adj = [&](int &val, int &dir, int amt)
    { if (amt<=0) return; val += dir * (rand()% (amt+1)); if (val>255){val=255;dir=-dir;} else if (val<0){val=0;dir=-dir;} };
    adj(r, rd, (int)v.rAdj.val());
    adj(g, gd, (int)v.gAdj.val());
    adj(b, bd, (int)v.bAdj.val());
    Color col{(unsigned char)r, (unsigned char)g, (unsigned char)b, 255};
    int mode = (int)v.mode.val();
    int splits = (int)v.splits.val();
    float thick = v.thick.val();
    Vector2 p0 = prev;
    Vector2 p1 = cur;
    if (mode == 2)
    {
        float qsize = v.qsize.val();
        if (qsize > 0)
        {
            auto q = [&](Vector2 &pt)
            { pt.x=floorf(pt.x/qsize)*qsize; pt.y=floorf(pt.y/qsize)*qsize; float qmod=v.qmod.val(); if(qmod>1){ pt.x=fmodf(pt.x, canvasW*qmod); pt.y=fmodf(pt.y, canvasH*qmod);} };
            q(p0);
            q(p1);
        }
    }
    if (mode == 3)
        DrawQuadrant(p0, p1, thick, col);
    else
        DrawRotational(p0, p1, std::max(1, splits), thick, col);
}

void KalidaVerletDemo::DrawRotational(const Vector2 &prev, const Vector2 &cur, int splits, float thick, Color col)
{
    float cx = canvasW / 2.f, cy = canvasH / 2.f;
    float dxp = prev.x - cx, dyp = prev.y - cy;
    float dxc = cur.x - cx, dyc = cur.y - cy;
    for (int i = 0; i < splits; i++)
    {
        float ang = (2 * 3.14159265f * i) / splits;
        float c = cosf(ang), s = sinf(ang);
        float prx = dxp * c - dyp * s;
        float pry = dxp * s + dyp * c;
        float rx = dxc * c - dyc * s;
        float ry = dxc * s + dyc * c;
        DrawLineEx({cx + prx, cy + pry}, {cx + rx, cy + ry}, thick, col);
    }
}

void KalidaVerletDemo::DrawQuadrant(const Vector2 &prev, const Vector2 &cur, float thick, Color col)
{
    float cx = canvasW / 2.f, cy = canvasH / 2.f;
    float dxp = prev.x - cx, dyp = prev.y - cy;
    float dxc = cur.x - cx, dyc = cur.y - cy;
    auto dl = [&](float ax, float ay, float bx, float by)
    { DrawLineEx({cx + ax, cy + ay}, {cx + bx, cy + by}, thick, col); };
    dl(dxp, dyp, dxc, dyc);
    dl(-dxp, dyp, -dxc, dyc);
    dl(dxp, -dyp, dxc, -dyc);
    dl(-dxp, -dyp, -dxc, -dyc);
}

void KalidaVerletDemo::OnDraw(DemoCtx &cx)
{
    (void)cx;
    if (!rtReady)
        return;
    fitToWindow = (v.fit.val() >= 0.5f);
    Rectangle src{0, 0, (float)canvasW, -(float)canvasH};
    if (fitToWindow)
    {
        float winW = (float)GetScreenWidth(), winH = (float)GetScreenHeight();
        float scale = std::min(winW / canvasW, winH / canvasH);
        float dw = canvasW * scale, dh = canvasH * scale;
        float dx = (winW - dw) / 2.f, dy = (winH - dh) / 2.f;
        Rectangle dst{dx, dy, dw, dh};
        DrawTexturePro(rt.texture, src, dst, {0, 0}, 0, WHITE);
    }
    else
    {
        DrawTextureRec(rt.texture, src, {0, 0}, WHITE);
    }
}
