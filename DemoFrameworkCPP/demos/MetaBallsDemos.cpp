// Clean reimplementation after prior corruption.
#include "MetaBallsDemos.hpp"
#include <algorithm>
#include <cmath>
#include "../include/Config.hpp"

static Color RandCol()
{
    return Color{(unsigned char)GetRandomValue(0, 255), (unsigned char)GetRandomValue(0, 255), (unsigned char)GetRandomValue(0, 255), 255};
}

void MetaBallsBase::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("BALLS").Range(20, 120).Integer());
    cx.vs.Add(VB::Create("RADIUS").Range(80, 200));
    cx.vs.Add(VB::Create("BLUR").Range(0, 160));
    cx.vs.Add(VB::Create("OVERSAMPLES").Range(0, 6).Integer());
    cx.vs.Add(VB::Create("MAX_SPEED").Range(0.5f, 10.f));
    cx.vs.Add(VB::Create("THRESH").Range(0, 255).Integer());
    cx.vs.Add(VB::Create("FLAT").BoolInitial(flatMode));
    cx.vs.Add(VB::Create("STATIC").Range(0, 255).Integer());
    cx.vs.Add(VB::Create("FUZZY").BoolInitial(fuzzyBalls));
    cx.vs.Add(VB::Create("G_ALPHA").Range(0.2f, 1.f));
    cx.vs.Add(VB::Create("FADE_CH").Range(0, 1));
}

void MetaBallsBase::OnInit(DemoCtx &cx)
{
    ConfigureVariant();
    if (dfc::AUTO_STRETCH_STAGE)
    {
        canvasW = GetScreenWidth();
        canvasH = GetScreenHeight();
    }
    // Pull initial values (user can tweak later each frame)
    auto gv = [&](const char *n)
    { return cx.vs.Get(n); };
    ballCount = (int)gv("BALLS")->value;
    radius = gv("RADIUS")->value;
    blur = gv("BLUR")->value;
    oversamples = (int)gv("OVERSAMPLES")->value;
    maxMoveSpeed = gv("MAX_SPEED")->value;
    threshold = (int)gv("THRESH")->value;
    flatMode = gv("FLAT")->value >= 0.5f;
    staticAmount = (int)gv("STATIC")->value;
    fuzzyBalls = gv("FUZZY")->value >= 0.5f;
    globalAlpha = gv("G_ALPHA")->value;
    fadeChance = gv("FADE_CH")->value;

    if (!baseReady)
    {
        baseRT = LoadRenderTexture(canvasW, canvasH);
        baseReady = true;
    }
    BeginTextureMode(baseRT);
    ClearBackground(BLACK);
    EndTextureMode();

    BuildGradient();
    BuildCircleTexture();
    prevRadius = radius;
    prevBlur = blur;
    prevOversamples = oversamples;
    prevFuzzy = fuzzyBalls;
    SpawnBalls();
}

void MetaBallsBase::OnUpdate(DemoCtx &cx)
{
    // Live parameter updates
    auto gv = [&](const char *n)
    { return cx.vs.Get(n); };
    ballCount = (int)gv("BALLS")->value; // if changed drastically, respawn
    if ((int)balls.size() != ballCount)
        SpawnBalls();
    radius = gv("RADIUS")->value;
    blur = gv("BLUR")->value;
    oversamples = (int)gv("OVERSAMPLES")->value;
    maxMoveSpeed = gv("MAX_SPEED")->value;
    threshold = (int)gv("THRESH")->value;
    flatMode = gv("FLAT")->value >= 0.5f;
    staticAmount = (int)gv("STATIC")->value;
    fuzzyBalls = gv("FUZZY")->value >= 0.5f;
    globalAlpha = gv("G_ALPHA")->value;
    fadeChance = gv("FADE_CH")->value;

    // Rebuild circle texture if shape parameters changed
    if (std::fabs(prevRadius - radius) > 0.01f || std::fabs(prevBlur - blur) > 0.01f || prevOversamples != oversamples || prevFuzzy != fuzzyBalls)
    {
        BuildCircleTexture();
        prevRadius = radius;
        prevBlur = blur;
        prevOversamples = oversamples;
        prevFuzzy = fuzzyBalls;
    }

    UpdateBalls();

    // Draw balls to render target
    BeginTextureMode(baseRT);
    ClearBackground(BLACK);
    BeginBlendMode(BLEND_ADDITIVE); // accumulate intensity
    DrawBallsToRT();
    EndBlendMode();
    EndTextureMode();

    // CPU post-process
    Image img = LoadImageFromTexture(baseRT.texture); // RGBA8
    Color *px = LoadImageColors(img);                 // allocated copy we can modify
    int count = img.width * img.height;
    int visible = 0;
    for (int i = 0; i < count; ++i)
    {
        // Use red channel as intensity (additive draws white)
        int v = px[i].r;
        if (v < threshold)
        {
            px[i].a = 0; // fully transparent
            continue;
        }
        visible++;
        int noise = staticAmount > 0 ? GetRandomValue(0, staticAmount) : 0;
        if (flatMode)
        {
            int val = std::max(0, 255 - noise);
            px[i].r = px[i].g = px[i].b = val;
            px[i].a = 255;
        }
        else
        {
            const Color &g = gradient[std::clamp(v, 0, 255)];
            px[i].r = (unsigned char)std::max(0, g.r - noise);
            px[i].g = (unsigned char)std::max(0, g.g - noise);
            px[i].b = (unsigned char)std::max(0, g.b - noise);
            px[i].a = 255;
        }
        // Per-pixel fade chance (variant 3 effect)
        if (fadeChance > 0.f && GetRandomValue(0, 1000) < (int)(fadeChance * 1000))
        {
            int f = GetRandomValue(32, 255);
            px[i].a = (unsigned char)std::max(0, px[i].a - f);
        }
    }

    // Adaptive safety: if nothing visible drop threshold slowly to recover
    if (visible < count / 500 && threshold > 5)
        threshold -= 1;

    if (!processedReady)
    {
        // Build texture from modified pixels (px)
        Image tmp{};
        tmp.data = px;
        tmp.width = img.width;
        tmp.height = img.height;
        tmp.mipmaps = 1;
        tmp.format = PIXELFORMAT_UNCOMPRESSED_R8G8B8A8;
        processedTex = LoadTextureFromImage(tmp);
        processedReady = true;
    }
    else
    {
        UpdateTexture(processedTex, px);
    }

    UnloadImageColors(px); // frees px
    UnloadImage(img);
}

void MetaBallsBase::OnDraw(DemoCtx &cx)
{
    Rectangle dst{0, 0, (float)GetScreenWidth(), (float)GetScreenHeight()};
    if (processedReady)
    {
        Rectangle src{0, 0, (float)processedTex.width, -(float)processedTex.height};
        DrawTexturePro(processedTex, src, dst, {0, 0}, 0.f, Fade(WHITE, globalAlpha));
    }
    else if (baseReady)
    {
        Rectangle src{0, 0, (float)baseRT.texture.width, -(float)baseRT.texture.height};
        DrawTexturePro(baseRT.texture, src, dst, {0, 0}, 0.f, Fade(WHITE, globalAlpha));
    }
}

void MetaBallsBase::BuildGradient()
{
    // 4 random color stops like JS version
    std::array<Color, 4> stops{RandCol(), RandCol(), RandCol(), RandCol()};
    for (int i = 0; i < 256; ++i)
    {
        float t = i / 255.f;
        float pos = t * 3.f;
        int idx = (int)pos;
        float localT = pos - idx;
        if (idx >= 3)
        {
            gradient[i] = stops[3];
            continue;
        }
        const Color &a = stops[idx];
        const Color &b = stops[idx + 1];
        auto L = [&](unsigned char A, unsigned char B)
        { return (unsigned char)(A + (B - A) * localT); };
        gradient[i] = Color{L(a.r, b.r), L(a.g, b.g), L(a.b, b.b), 255};
    }
}

void MetaBallsBase::BuildCircleTexture()
{
    if (circleReady)
    {
        UnloadTexture(circleTex);
        circleReady = false;
    }
    // The size includes a margin for blur softness
    int r = (int)std::ceil(radius);
    int margin = (int)std::ceil(std::max(blur, 1.f));
    int size = (r + margin) * 2;
    Image img = GenImageColor(size, size, BLANK);
    // Operate directly on the image's memory (uncompressed RGBA8)
    Color *px = (Color *)img.data;
    float center = size / 2.f;
    float rr = (float)r;
    float invR = 1.f / rr;
    float exponent = std::max(0.25f, 2.0f - blur / 50.f); // higher blur -> smaller exponent -> softer
    for (int y = 0; y < size; ++y)
    {
        for (int x = 0; x < size; ++x)
        {
            float dx = x - center;
            float dy = y - center;
            float d = std::sqrt(dx * dx + dy * dy);
            if (d <= rr)
            {
                float t = d * invR; // 0..1
                float falloff = std::pow(1.f - t, exponent);
                unsigned char a = (unsigned char)std::clamp<int>((int)(falloff * 255), 0, 255);
                if (fuzzyBalls && a > 0)
                {
                    int n = GetRandomValue(0, std::max(1, staticAmount / 4 + 1));
                    a = (unsigned char)std::max(0, a - n);
                }
                px[y * size + x] = Color{255, 255, 255, a};
            }
        }
    }
    // Simple separable blur passes to simulate oversampling
    if (oversamples > 0)
    {
        std::vector<unsigned char> temp(size * size);
        for (int pass = 0; pass < oversamples; ++pass)
        {
            // horizontal
            for (int y = 0; y < size; ++y)
            {
                for (int x = 0; x < size; ++x)
                {
                    int sum = 0, cnt = 0;
                    for (int k = -1; k <= 1; ++k)
                    {
                        int xx = x + k;
                        if (xx >= 0 && xx < size)
                        {
                            sum += px[y * size + xx].a;
                            cnt++;
                        }
                    }
                    temp[y * size + x] = (unsigned char)(sum / cnt);
                }
            }
            // vertical
            for (int y = 0; y < size; ++y)
            {
                for (int x = 0; x < size; ++x)
                {
                    int sum = 0, cnt = 0;
                    for (int k = -1; k <= 1; ++k)
                    {
                        int yy = y + k;
                        if (yy >= 0 && yy < size)
                        {
                            sum += temp[yy * size + x];
                            cnt++;
                        }
                    }
                    px[y * size + x].a = (unsigned char)(sum / cnt);
                }
            }
        }
    }

    circleTex = LoadTextureFromImage(img);
    circleReady = true;
    UnloadImage(img);
}

void MetaBallsBase::SpawnBalls()
{
    balls.clear();
    balls.reserve(ballCount);
    for (int i = 0; i < ballCount; ++i)
    {
        MBall b{};
        b.x = RandF(0.f, (float)canvasW);
        b.y = RandF(0.f, (float)canvasH);
        b.vx = RandF(-maxMoveSpeed, maxMoveSpeed);
        b.vy = RandF(-maxMoveSpeed, maxMoveSpeed);
        balls.push_back(b);
    }
}

void MetaBallsBase::UpdateBalls()
{
    for (auto &b : balls)
    {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > canvasW)
        {
            b.vx *= -1;
            b.x = std::clamp(b.x, 0.f, (float)canvasW);
        }
        if (b.y < 0 || b.y > canvasH)
        {
            b.vy *= -1;
            b.y = std::clamp(b.y, 0.f, (float)canvasH);
        }
    }
}

void MetaBallsBase::DrawBallsToRT()
{
    for (auto &b : balls)
    {
        DrawTexture(circleTex, (int)(b.x - circleTex.width / 2), (int)(b.y - circleTex.height / 2), WHITE);
    }
}

void MetaBallsBase::ProcessAndPresent() {}

void MetaBallsBase::ReleaseResources()
{
    if (baseReady)
    {
        UnloadRenderTexture(baseRT);
        baseReady = false;
    }
    if (circleReady)
    {
        UnloadTexture(circleTex);
        circleReady = false;
    }
    if (processedReady)
    {
        UnloadTexture(processedTex);
        processedReady = false;
    }
}
