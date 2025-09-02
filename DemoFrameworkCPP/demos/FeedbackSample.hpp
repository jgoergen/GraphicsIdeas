#pragma once
#include "BaseDemo.hpp"
#include "raylib.h"

// FeedbackSampleDemo
//  - Prefills screen with random noise
//  - Maintains a ping-pong feedback of the screen
//  - At random (variable-driven) intervals, captures the current full feedback surface
//    into a sample texture.
//  - Each frame it draws the previous frame plus a scaled down copy of the captured
//    sample texture (recursive feedback injection) whose size & motion are controlled
//    by dynamic variables (auto-transitioned by the framework).

class FeedbackSampleDemo : public BaseDemo
{
public:
    std::string Name() const override { return "Feedback Sample"; }
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override;
    void OnShutdown(DemoCtx &cx) override;

private:
    RenderTexture2D targets[2]{}; // ping-pong
    static constexpr int MAX_SAMPLE_LAYERS = 8;
    RenderTexture2D sampleLayers[MAX_SAMPLE_LAYERS]{}; // captured samples (layer 0 newest)
    int currentTarget = 0;
    int screenW = 0;
    int screenH = 0;
    float elapsedMs = 0.0f;
    float nextSampleMs = 0.0f;      // time (ms) of next capture
    float nextNoiseBurstMs = 0.0f;  // time (ms) of next noise burst
    bool noiseBurstPending = false; // set on update, consumed in draw
    unsigned int noiseSeed = 0;     // seed used for current burst pattern
    bool sampleDue = false;         // set in update, capture after draw for recursive final frame
    bool firstFrameDrawn = false;   // ensure at least one composed frame before sampling

    struct Vars
    {
        VarRef sampleScale;         // base scale of injected sample (uniform)
        VarRef scaleAmp;            // oscillatory added scale amount
        VarRef xAmp;                // horizontal motion amplitude
        VarRef yAmp;                // vertical motion amplitude
        VarRef period;              // seconds for base translation/scale oscillation
        VarRef resampleMin;         // min seconds between resamples
        VarRef resampleMax;         // max seconds between resamples
        VarRef alpha;               // overlay alpha for injected sample
        VarRef rotSpeed;            // rotation amplitude (degrees)
        VarRef rotPeriod;           // rotation oscillation period
        VarRef rMult, gMult, bMult; // legacy RGB multipliers (post HSV)
        VarRef colorPeriod;         // seconds for full color cycle (hue)
        VarRef huePeriod;           // alternate hue cycle period
        VarRef sat;                 // HSV saturation
        VarRef val;                 // HSV value
        VarRef decay;               // per-frame fade amount (black overlay alpha)
        VarRef sampleLayersCount;   // number of samples to draw
        VarRef layerScaleStep;      // scale reduction per layer
        VarRef layerHueOffset;      // hue offset per layer (0..1 wraps)
        VarRef rotLayerOffset;      // rotation offset per layer (degrees)
        VarRef noiseBurstMin;       // min seconds between colored noise bursts
        VarRef noiseBurstMax;       // max seconds between colored noise bursts
        VarRef noiseBurstAlpha;     // alpha of injected colored noise burst
        VarRef feedbackScaleAmp;    // amplitude of zoom applied to whole feedback buffer each frame
        VarRef feedbackRotSpeed;    // rotation amplitude for whole feedback
        VarRef feedbackRotPeriod;   // rotation period for whole feedback
        VarRef blendMode;           // blend mode selector (int)
        VarRef minTint;             // minimum tint channel (avoid black out)
        VarRef invertSample;        // invert captured sample (0/1)
    } v;

    void RecreateTargetsIfNeeded();
    void CaptureSample(RenderTexture2D &finalFrameRT);
    void FillNoise(RenderTexture2D &rt);
    void RecreateSampleLayers();
    void UnloadSamples();
    static Color HSVtoRGB(float h, float s, float v);
    void OverlayColoredNoise(RenderTexture2D &rt, float alpha, unsigned int seed);
};
