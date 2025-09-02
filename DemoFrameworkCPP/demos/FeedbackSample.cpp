#include "FeedbackSample.hpp"
#include <cmath>
#include <algorithm>
#include <random>

void FeedbackSampleDemo::OnConfigure(DemoCtx &cx)
{
    // Controls focused on recursive sampling & transform of inserted miniature image.
    cx.vs.Add(VB::Create("SAMPLE_SCALE").Range(0.05f, 1.0f));    // base scaling of sample relative to screen
    cx.vs.Add(VB::Create("SCALE_AMP").Range(0.0f, 1.0f));        // oscillation amplitude (added to base)
    cx.vs.Add(VB::Create("X_AMP").Range(-600.0f, 600.0f));          // horizontal oscillation radius
    cx.vs.Add(VB::Create("Y_AMP").Range(-400.0f, 400.0f));          // vertical oscillation radius
    cx.vs.Add(VB::Create("PERIOD").Range(0.5f, 100.0f));          // seconds per oscillation
    cx.vs.Add(VB::Create("RESAMPLE_MIN").Range(0.05f, 1.0f));    // min seconds until new capture
    cx.vs.Add(VB::Create("RESAMPLE_MAX").Range(0.1f, 1.0f));     // max seconds until new capture
    cx.vs.Add(VB::Create("SAMPLE_ALPHA").Range(1.0f, 1.0f));    // alpha for composite of sample
    cx.vs.Add(VB::Create("ROT_SPEED").Range(-360.f, 360.f));      // rotation amplitude degrees
    cx.vs.Add(VB::Create("ROT_PERIOD").Range(0.25f, 500.f));       // rotation oscillation period
    cx.vs.Add(VB::Create("R_MULT").Range(0.0f, 4.0f));            // legacy RGB mixing
    cx.vs.Add(VB::Create("G_MULT").Range(0.0f, 8.0f));
    cx.vs.Add(VB::Create("B_MULT").Range(0.0f, 4.0f));
    cx.vs.Add(VB::Create("COLOR_PERIOD").Range(0.5f, 300.0f));     // general cycle
    cx.vs.Add(VB::Create("HUE_PERIOD").Range(0.5f, 300.0f));       // separate hue period
    cx.vs.Add(VB::Create("SAT").Range(0.0f, 1.0f));               // saturation
    cx.vs.Add(VB::Create("VAL").Range(0.0f, 2.0f));               // value (allows brightening)
    cx.vs.Add(VB::Create("DECAY").Range(0.0f, 0.02f));             // per-frame fade alpha
    cx.vs.Add(VB::Create("SAMPLE_LAYERS").Range(1.f, 8.f).Integer()); // count of layered samples
    cx.vs.Add(VB::Create("LAYER_SCALE_STEP").Range(0.0f, 0.1f));  // scale reduction per layer
    cx.vs.Add(VB::Create("LAYER_HUE_OFFSET").Range(0.0f, 1.0f));  // hue offset per layer
    cx.vs.Add(VB::Create("ROT_LAYER_OFFSET").Range(-180.f, 180.f)); // rotation offset per layer
    cx.vs.Add(VB::Create("NOISE_BURST_MIN").Range(0.2f, 10.0f));    // min seconds between color noise bursts
    cx.vs.Add(VB::Create("NOISE_BURST_MAX").Range(0.5f, 15.0f));    // max seconds between color noise bursts
    cx.vs.Add(VB::Create("NOISE_BURST_ALPHA").Range(0.4f, 1.0f));  // alpha of colored noise overlay
    cx.vs.Add(VB::Create("FEEDBACK_SCALE_AMP").Range(0.0f, 0.2f));  // zoom amplitude for whole buffer
    cx.vs.Add(VB::Create("FEEDBACK_ROT_SPEED").Range(-5.f, 5.f)); // feedback rotation amplitude
    cx.vs.Add(VB::Create("FEEDBACK_ROT_PERIOD").Range(0.5f, 300.f));   // feedback rotation period
    cx.vs.Add(VB::Create("BLEND_MODE").Range(0.f, 3.f).Integer());   // 0 normal,1 additive,2 multiply,3 screen
    cx.vs.Add(VB::Create("MIN_TINT").Range(0.0f, 0.6f));             // floor on per-channel tint
    cx.vs.Add(VB::Create("INVERT_SAMPLE").Range(0.f, 1.f).Integer()); // invert captured sample toggle
}

void FeedbackSampleDemo::RecreateTargetsIfNeeded()
{
    int w = GetScreenWidth();
    int h = GetScreenHeight();
    if (w == screenW && h == screenH && targets[0].id > 0 && sampleLayers[0].id > 0)
        return;

    // unload old
    for (auto &t : targets)
        if (t.id > 0) { UnloadRenderTexture(t); t.id = 0; }
    UnloadSamples();

    screenW = w;
    screenH = h;
    targets[0] = LoadRenderTexture(screenW, screenH);
    targets[1] = LoadRenderTexture(screenW, screenH);
    for (int i = 0; i < MAX_SAMPLE_LAYERS; ++i)
        sampleLayers[i] = LoadRenderTexture(screenW, screenH);

    // Initialize with noise
    FillNoise(targets[0]);
    FillNoise(targets[1]);
    for (int i = 0; i < MAX_SAMPLE_LAYERS; ++i) FillNoise(sampleLayers[i]);
    currentTarget = 0;
}

void FeedbackSampleDemo::FillNoise(RenderTexture2D &rt)
{
    BeginTextureMode(rt);
    // Colorful HSV-based noise: hue varies with a hash, saturation/value randomish
    for (int y = 0; y < screenH; ++y)
    {
        for (int x = 0; x < screenW; ++x)
        {
            unsigned int hsh = (unsigned int)(x * 374761393u + y * 668265263u + 0x9E3779B9u);
            hsh = (hsh ^ (hsh >> 13)) * 1274126177u;
            float hue = (hsh & 0xFFFF) / 65535.0f; // 0..1
            float sat = 0.5f + ((hsh >> 16) & 0xFF) / 510.0f; // 0.5 .. 1.0
            float val = 0.4f + ((hsh >> 24) & 0xFF) / 255.0f * 0.6f; // 0.4 .. 1.0
            Color c = HSVtoRGB(hue, sat, val);
            DrawPixel(x, y, c);
        }
    }
    EndTextureMode();
}

void FeedbackSampleDemo::CaptureSample(RenderTexture2D &finalFrameRT)
{
    // Shift older layers down
    for (int i = MAX_SAMPLE_LAYERS - 1; i > 0; --i)
    {
        if (sampleLayers[i - 1].id == 0) continue;
        BeginTextureMode(sampleLayers[i]);
        ClearBackground(BLACK);
        Rectangle full{0,0,(float)screenW,-(float)screenH};
        DrawTextureRec(sampleLayers[i-1].texture, full, {0,0}, WHITE);
        EndTextureMode();
    }
    // Capture newest into layer 0
    BeginTextureMode(sampleLayers[0]);
    ClearBackground(BLACK);
    Rectangle srcRect{0,0,(float)screenW,-(float)screenH};
    DrawTextureRec(finalFrameRT.texture, srcRect, {0,0}, WHITE);
    EndTextureMode();
    // Invert newest sample if enabled
    if (v.invertSample.p && v.invertSample.val() > 0.5f)
    {
        Image img = LoadImageFromTexture(sampleLayers[0].texture);
        if (img.data)
        {
            Color *pix = (Color*)img.data;
            int count = img.width * img.height;
            for (int i = 0; i < count; ++i)
            {
                pix[i].r = (unsigned char)(255 - pix[i].r);
                pix[i].g = (unsigned char)(255 - pix[i].g);
                pix[i].b = (unsigned char)(255 - pix[i].b);
            }
            UpdateTexture(sampleLayers[0].texture, img.data);
        }
        UnloadImage(img);
    }
}

void FeedbackSampleDemo::OnInit(DemoCtx &cx)
{
    RecreateTargetsIfNeeded();
    elapsedMs = 0.0f;
    // Initial variable generation
    cx.vs.RegenerateAll(false);
    v.sampleScale.p = cx.vs.Get("SAMPLE_SCALE");
    v.scaleAmp.p = cx.vs.Get("SCALE_AMP");
    v.xAmp.p = cx.vs.Get("X_AMP");
    v.yAmp.p = cx.vs.Get("Y_AMP");
    v.period.p = cx.vs.Get("PERIOD");
    v.resampleMin.p = cx.vs.Get("RESAMPLE_MIN");
    v.resampleMax.p = cx.vs.Get("RESAMPLE_MAX");
    v.alpha.p = cx.vs.Get("SAMPLE_ALPHA");
    v.rotSpeed.p = cx.vs.Get("ROT_SPEED");
    v.rotPeriod.p = cx.vs.Get("ROT_PERIOD");
    v.rMult.p = cx.vs.Get("R_MULT");
    v.gMult.p = cx.vs.Get("G_MULT");
    v.bMult.p = cx.vs.Get("B_MULT");
    v.colorPeriod.p = cx.vs.Get("COLOR_PERIOD");
    v.huePeriod.p = cx.vs.Get("HUE_PERIOD");
    v.sat.p = cx.vs.Get("SAT");
    v.val.p = cx.vs.Get("VAL");
    v.decay.p = cx.vs.Get("DECAY");
    v.sampleLayersCount.p = cx.vs.Get("SAMPLE_LAYERS");
    v.layerScaleStep.p = cx.vs.Get("LAYER_SCALE_STEP");
    v.layerHueOffset.p = cx.vs.Get("LAYER_HUE_OFFSET");
    v.rotLayerOffset.p = cx.vs.Get("ROT_LAYER_OFFSET");
    v.noiseBurstMin.p = cx.vs.Get("NOISE_BURST_MIN");
    v.noiseBurstMax.p = cx.vs.Get("NOISE_BURST_MAX");
    v.noiseBurstAlpha.p = cx.vs.Get("NOISE_BURST_ALPHA");
    v.feedbackScaleAmp.p = cx.vs.Get("FEEDBACK_SCALE_AMP");
    v.feedbackRotSpeed.p = cx.vs.Get("FEEDBACK_ROT_SPEED");
    v.feedbackRotPeriod.p = cx.vs.Get("FEEDBACK_ROT_PERIOD");
    v.blendMode.p = cx.vs.Get("BLEND_MODE");
    v.minTint.p = cx.vs.Get("MIN_TINT");
    v.invertSample.p = cx.vs.Get("INVERT_SAMPLE");

    // Schedule first sample (deferred until after first frame composed)
    float minS = v.resampleMin.val();
    float maxS = std::max(minS, v.resampleMax.val());
    std::uniform_real_distribution<float> dist(minS, maxS);
    nextSampleMs = dist(cx.r) * 1000.0f * 0.25f; // quarter of an interval for initial freshness
    sampleDue = false;
    firstFrameDrawn = false;
    // Schedule first noise burst
    float nMin = v.noiseBurstMin.val();
    float nMax = std::max(nMin, v.noiseBurstMax.val());
    std::uniform_real_distribution<float> ndist(nMin, nMax);
    nextNoiseBurstMs = ndist(cx.r) * 1000.0f * 0.5f; // earlier first burst
}

void FeedbackSampleDemo::OnShutdown(DemoCtx &cx)
{
    (void)cx;
    for (auto &t : targets)
        if (t.id > 0) { UnloadRenderTexture(t); t.id = 0; }
    UnloadSamples();
}

void FeedbackSampleDemo::OnUpdate(DemoCtx &cx)
{
    RecreateTargetsIfNeeded();
    elapsedMs += cx.dt * 1000.0f;

    if (elapsedMs >= nextSampleMs)
    {
    sampleDue = true; // defer capture to after draw for true final composited frame
        float minS = v.resampleMin.val();
        float maxS = std::max(minS, v.resampleMax.val());
        std::uniform_real_distribution<float> dist(minS, maxS);
        nextSampleMs = elapsedMs + dist(cx.r) * 1000.0f;
    }

    // Schedule noise burst
    if (elapsedMs >= nextNoiseBurstMs)
    {
        float nMin = v.noiseBurstMin.val();
        float nMax = std::max(nMin, v.noiseBurstMax.val());
        std::uniform_real_distribution<float> ndist(nMin, nMax);
        nextNoiseBurstMs = elapsedMs + ndist(cx.r) * 1000.0f;
        noiseBurstPending = true;
        noiseSeed = (unsigned int)elapsedMs;
    }
}

void FeedbackSampleDemo::OnDraw(DemoCtx &cx)
{
    (void)cx;
    if (targets[0].id == 0)
        return;

    float baseScale = v.sampleScale.val();
    float scaleAmp = v.scaleAmp.val();
    float xAmp = v.xAmp.val();
    float yAmp = v.yAmp.val();
    float period = std::max(0.0001f, v.period.val());
    float alpha = v.alpha.val();
    float rotSpeed = v.rotSpeed.val();
    float rotPeriod = std::max(0.0001f, v.rotPeriod.val());
    float rMult = v.rMult.val();
    float gMult = v.gMult.val();
    float bMult = v.bMult.val();
    float colorPeriod = std::max(0.0001f, v.colorPeriod.val());
    float huePeriod = std::max(0.0001f, v.huePeriod.val());
    float sat = v.sat.val();
    float val = v.val.val();
    float decay = v.decay.val();
    int layersToDraw = std::clamp((int)std::round(v.sampleLayersCount.val()), 1, MAX_SAMPLE_LAYERS);
    float layerScaleStep = v.layerScaleStep.val();
    float layerHueOffset = v.layerHueOffset.val();
    float rotLayerOffset = v.rotLayerOffset.val();
    float noiseBurstAlpha = v.noiseBurstAlpha.val();
    float feedbackScaleAmp = v.feedbackScaleAmp.val();
    float fbRotSpeed = v.feedbackRotSpeed.val();
    float fbRotPeriod = std::max(0.0001f, v.feedbackRotPeriod.val());
    int blendMode = std::clamp((int)std::round(v.blendMode.val()),0,3);
    float minTint = v.minTint.val();
    bool forceWhiteTint = (rMult + gMult + bMult) < 0.05f; // avoid black-out when multipliers near zero

    float tSec = elapsedMs / 1000.0f;
    float phase = tSec / period;
    float twoPi = 6.28318530718f;
    float oscX = std::sin(phase * twoPi);
    float oscY = std::cos(phase * twoPi / 2.0f); // slight variance
    float oscScale = std::cos(phase * twoPi);
    float rotPhase = tSec / rotPeriod;
    float oscRot = std::sin(rotPhase * twoPi); // rotation oscillator

    float scale = baseScale + oscScale * scaleAmp;
    if (scale < 0.01f)
        scale = 0.01f;

    int next = 1 - currentTarget;
    RenderTexture2D &src = targets[currentTarget];
    RenderTexture2D &dst = targets[next];

    BeginTextureMode(dst);
    Rectangle srcRect{0, 0, (float)screenW, -(float)screenH};
    // Apply feedback zoom/rotation style transform of previous full frame
    float feedbackScale = 1.0f + feedbackScaleAmp * oscScale; // reuse oscScale for subtle breathing
    if (feedbackScale < 0.05f) feedbackScale = 0.05f;
    float fbW = screenW * feedbackScale;
    float fbH = screenH * feedbackScale;
    float fbDx = (screenW - fbW) * 0.5f;
    float fbDy = (screenH - fbH) * 0.5f;
    Rectangle fbDst{fbDx, fbDy, fbW, fbH};
    float fbRotPhase = tSec / fbRotPeriod;
    float fbRot = std::sin(fbRotPhase * twoPi) * fbRotSpeed;
    DrawTexturePro(src.texture, srcRect, fbDst, {0,0}, fbRot, WHITE);
    if (decay > 0.0001f)
    {
        unsigned char dA = (unsigned char)std::clamp(decay * 255.0f, 0.0f, 255.0f);
        DrawRectangle(0, 0, screenW, screenH, {0, 0, 0, dA});
    }

    // Draw the sample texture scaled & positioned
    float baseCenterX = screenW * 0.5f + oscX * xAmp;
    float baseCenterY = screenH * 0.5f + oscY * yAmp;
    float colorPhase = tSec / colorPeriod;
    float hueBase = std::fmod(tSec / huePeriod, 1.0f); // cycles 0..1
    unsigned char aByte = (unsigned char)std::clamp(alpha * 255.0f, 0.0f, 255.0f);
    for (int li = 0; li < layersToDraw; ++li)
    {
        float layerScale = scale - li * layerScaleStep;
        if (layerScale <= 0.0f) break;
        float layerW = screenW * layerScale;
        float layerH = screenH * layerScale;
        float dx = baseCenterX - layerW * 0.5f;
        float dy = baseCenterY - layerH * 0.5f;
        Rectangle dstRect{dx, dy, layerW, layerH};
        float layerHue = std::fmod(hueBase + li * layerHueOffset, 1.0f);
        Color tint{255,255,255,aByte};
        /*
        // Combine HSV base with legacy multipliers as post-multipliers
        if (!forceWhiteTint)
        {
            Color hsvCol = HSVtoRGB(layerHue, std::clamp(sat,0.f,1.f), std::max(0.f, val));
            auto clamp255f = [](float v){ if(v<0)v=0; if(v>255)v=255; return (unsigned char)v; };
            float rgbR = hsvCol.r/255.0f * (std::sin(colorPhase * twoPi * 0.5f + li) * 0.5f + 0.5f) * rMult;
            float rgbG = hsvCol.g/255.0f * (std::sin(colorPhase * twoPi * 0.8f + 2.0f + li) * 0.5f + 0.5f) * gMult;
            float rgbB = hsvCol.b/255.0f * (std::sin(colorPhase * twoPi * 1.1f + 4.0f + li) * 0.5f + 0.5f) * bMult;
            auto applyFloor = [&](float c){ return std::clamp(c*(1.0f-minTint)+minTint, 0.0f, 1.0f); };
            float tr = applyFloor(rgbR);
            float tg = applyFloor(rgbG);
            float tb = applyFloor(rgbB);
            if (blendMode==2) { tr = std::min(tr+0.2f,1.f); tg=std::min(tg+0.2f,1.f); tb=std::min(tb+0.2f,1.f); }
            tint = {clamp255f(tr*255.f), clamp255f(tg*255.f), clamp255f(tb*255.f), aByte};
        }
*/
        float rotation = oscRot * rotSpeed + li * rotLayerOffset; // per-layer offset
        RenderTexture2D &layerTex = sampleLayers[std::min(li, MAX_SAMPLE_LAYERS-1)];
        switch(blendMode){
            case 1: // additive
                BeginBlendMode(BLEND_ADD_COLORS);
                DrawTexturePro(layerTex.texture, srcRect, dstRect, {0,0}, rotation, tint);
                EndBlendMode(); break;
            case 2: // multiply
                BeginBlendMode(BLEND_MULTIPLIED);
                DrawTexturePro(layerTex.texture, srcRect, dstRect, {0,0}, rotation, tint);
                EndBlendMode(); break;
            case 3: // screen (simulate: invert, multiply, invert) using shader-less approximation via additive + some dark fade
            {
                BeginBlendMode(BLEND_ADD_COLORS);
                DrawTexturePro(layerTex.texture, srcRect, dstRect, {0,0}, rotation, tint);
                EndBlendMode();
                break;
            }
            default:
                DrawTexturePro(layerTex.texture, srcRect, dstRect, {0,0}, rotation, tint); break;
        }
    }
    EndTextureMode();

    // Optional colored noise burst overlay (outside feedback accumulation so it feeds in next frame)
    if (noiseBurstPending && noiseBurstAlpha > 0.001f)
    {
        // Apply to the just-produced destination so it participates in next feedback iteration.
        float a = std::clamp(noiseBurstAlpha, 0.0f, 1.0f);
        OverlayColoredNoise(dst, a, noiseSeed);
        noiseBurstPending = false;
    }

    // Present to screen
    DrawTextureRec(dst.texture, srcRect, {0, 0}, WHITE);
    // Capture final composited frame every frame for recursion; shift layers only when sampleDue
    if (firstFrameDrawn)
    {
        if (sampleDue)
        {
            CaptureSample(dst); // includes shifting + optional invert
            sampleDue = false;
        }
        else
        {
            // Update only newest layer (no shift) for continuous recursion
            BeginTextureMode(sampleLayers[0]);
            ClearBackground(BLACK);
            Rectangle srcRect2{0,0,(float)screenW,-(float)screenH};
            DrawTextureRec(dst.texture, srcRect2, {0,0}, WHITE);
            EndTextureMode();
            if (v.invertSample.val() > 0.5f)
            {
                Image img = LoadImageFromTexture(sampleLayers[0].texture);
                if (img.data)
                {
                    Color *pix = (Color*)img.data; int count = img.width * img.height;
                    for (int i=0;i<count;++i){ pix[i].r=255-pix[i].r; pix[i].g=255-pix[i].g; pix[i].b=255-pix[i].b; }
                    UpdateTexture(sampleLayers[0].texture, img.data);
                }
                UnloadImage(img);
            }
        }
    }
    if (!firstFrameDrawn) firstFrameDrawn = true; // enable capture path next frame
    currentTarget = next;
}

Color FeedbackSampleDemo::HSVtoRGB(float h, float s, float v)
{
    h = h - std::floor(h); // wrap
    float c = v * s;
    float x = c * (1 - std::fabs(std::fmod(h * 6.0f, 2.0f) - 1));
    float m = v - c;
    float r=0,g=0,b=0;
    int sector = (int)(h * 6.0f);
    switch(sector % 6){
        case 0: r=c; g=x; b=0; break;
        case 1: r=x; g=c; b=0; break;
        case 2: r=0; g=c; b=x; break;
        case 3: r=0; g=x; b=c; break;
        case 4: r=x; g=0; b=c; break;
        case 5: r=c; g=0; b=x; break;
    }
    unsigned char R=(unsigned char)std::clamp((r+m)*255.f,0.f,255.f);
    unsigned char G=(unsigned char)std::clamp((g+m)*255.f,0.f,255.f);
    unsigned char B=(unsigned char)std::clamp((b+m)*255.f,0.f,255.f);
    return {R,G,B,255};
}

void FeedbackSampleDemo::UnloadSamples()
{
    for (auto &rt : sampleLayers)
    {
        if (rt.id>0){ UnloadRenderTexture(rt); rt.id=0; }
    }
}

void FeedbackSampleDemo::RecreateSampleLayers()
{
    UnloadSamples();
    for (int i=0;i<MAX_SAMPLE_LAYERS;++i) sampleLayers[i]=LoadRenderTexture(screenW,screenH);
}

void FeedbackSampleDemo::OverlayColoredNoise(RenderTexture2D &rt, float alpha, unsigned int seed)
{
    BeginTextureMode(rt);
    // We draw sparse noise blocks for efficiency
    int block = 4; // 4x4 blocks
    unsigned char aByte = (unsigned char)std::clamp(alpha * 255.0f, 0.0f, 255.0f);
    for (int y = 0; y < screenH; y += block)
    {
        for (int x = 0; x < screenW; x += block)
        {
            unsigned int h = (unsigned int)(x * 2654435761u ^ y * 974634777u ^ seed * 668265263u);
            h ^= (h >> 13); h *= 1274126177u; h ^= (h >> 16);
            float hue = (h & 0xFFFF) / 65535.0f;
            float sat = 0.6f + ((h >> 17) & 0x7F) / 255.0f * 0.4f;
            float val = 0.5f + ((h >> 24) & 0xFF) / 255.0f * 0.5f;
            Color c = HSVtoRGB(hue, sat, val);
            c.a = aByte;
            DrawRectangle(x, y, block, block, c);
        }
    }
    EndTextureMode();
}
