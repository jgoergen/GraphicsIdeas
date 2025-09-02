#pragma once
#include "BaseDemo.hpp"
#include "raylib.h" // for RenderTexture2D, Color, etc.
#include <string>
#include <vector>

// Port of feedback-chars HTML/JS demo to C++ DemoFrameworkCPP
// Implements a feedback surface with character drawing and color cycling.

class FeedbackCharsDemo : public BaseDemo
{
public:
    std::string Name() const override { return "Feedback Chars"; }
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override;
    void OnShutdown(DemoCtx &cx) override;

private:
    // Render targets for feedback ping-pong
    RenderTexture2D targets[2]{};
    int currentTarget = 0;
    int screenW = 0;
    int screenH = 0;

    // Time accumulation (milliseconds like original JS elapsed)
    float elapsedMs = 0.0f;

    // Cached chosen character
    std::string chosenChar;
    std::vector<std::string> charSet = {"+", "[]", "-", "O", "I", "X", "*", ".", ":", "8", "~", "(o)", "="};

    // Convenience accessors for variables
    void RecreateTargetsIfNeeded();
    struct Vars
    {
        VarRef aDiv, cDiv, rMult, gMult, bMult, expDiv, alpha, fontSize;
        VarRef rotSpeed, scaleAmp, xAmp, yAmp, period;
    } v; // cached
};
