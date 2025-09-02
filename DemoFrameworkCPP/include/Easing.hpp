// Easing.hpp - Port of EasingFunctions.js (frame-based easing) to normalized time functions.
#pragma once
#include <cmath>
#include <functional>

namespace df
{
    namespace Ease
    {
        // Contract: t in [0,1], returns interpolated value between start and end.
        inline float Linear(float t, float start, float end) { return start + (end - start) * t; }

        // helper sine/cos based variants similar to Sin2/Sin5/Sin10 (oscillatory)
        inline float SinN(float t, float start, float end, float cycles)
        {
            return (end - start) * std::sin(t * cycles) + start;
        }
        inline float Sin2(float t, float s, float e) { return SinN(t, s, e, 2.0f); }
        inline float Sin5(float t, float s, float e) { return SinN(t, s, e, 5.0f); }
        inline float Sin10(float t, float s, float e) { return SinN(t, s, e, 10.0f); }
        inline float CosN(float t, float start, float end, float cycles) { return (end - start) * std::cos(t * cycles) + start; }
        inline float Cos2(float t, float s, float e) { return CosN(t, s, e, 2.0f); }
        inline float Cos5(float t, float s, float e) { return CosN(t, s, e, 5.0f); }
        inline float Cos10(float t, float s, float e) { return CosN(t, s, e, 10.0f); }

        inline float InQuad(float t, float b, float e) { return (e - b) * t * t + b; }
        inline float OutQuad(float t, float b, float e) { return -(e - b) * t * (t - 2) + b; }
        inline float InOutQuad(float t, float b, float e)
        {
            t *= 2.0f;
            if (t < 1)
                return (e - b) / 2.0f * t * t + b;
            t -= 1;
            return -(e - b) / 2.0f * (t * (t - 2) - 1) + b;
        }
        inline float InCubic(float t, float b, float e) { return (e - b) * t * t * t + b; }
        inline float OutCubic(float t, float b, float e)
        {
            t -= 1;
            return (e - b) * (t * t * t + 1) + b;
        }
        inline float InOutCubic(float t, float b, float e)
        {
            t *= 2;
            if (t < 1)
                return (e - b) / 2 * t * t * t + b;
            t -= 2;
            return (e - b) / 2 * (t * t * t + 2) + b;
        }
        inline float InQuart(float t, float b, float e) { return (e - b) * t * t * t * t + b; }
        inline float OutQuart(float t, float b, float e)
        {
            t -= 1;
            return -(e - b) * (t * t * t * t - 1) + b;
        }
        inline float InOutQuart(float t, float b, float e)
        {
            t *= 2;
            if (t < 1)
                return (e - b) / 2 * t * t * t * t + b;
            t -= 2;
            return -(e - b) / 2 * (t * t * t * t - 2) + b;
        }
        inline float InQuint(float t, float b, float e) { return (e - b) * t * t * t * t * t + b; }
        inline float OutQuint(float t, float b, float e)
        {
            t -= 1;
            return (e - b) * (t * t * t * t * t + 1) + b;
        }
        inline float InOutQuint(float t, float b, float e)
        {
            t *= 2;
            if (t < 1)
                return (e - b) / 2 * t * t * t * t * t + b;
            t -= 2;
            return (e - b) / 2 * (t * t * t * t * t + 2) + b;
        }
        inline float InSine(float t, float b, float e) { return -(e - b) * std::cos(t * (float)M_PI / 2.0f) + (e - b) + b; }
        inline float OutSine(float t, float b, float e) { return (e - b) * std::sin(t * (float)M_PI / 2.0f) + b; }
        inline float InOutSine(float t, float b, float e) { return -(e - b) / 2.0f * (std::cos((float)M_PI * t) - 1) + b; }
        inline float InExpo(float t, float b, float e) { return (t == 0.0f) ? b : (e - b) * std::pow(2.0f, 10.0f * (t - 1.0f)) + b; }
        inline float OutExpo(float t, float b, float e) { return (t == 1.0f) ? b + (e - b) : (e - b) * (-std::pow(2.0f, -10.0f * t) + 1.0f) + b; }
        inline float InOutExpo(float t, float b, float e)
        {
            if (t == 0.0f)
                return b;
            if (t == 1.0f)
                return b + (e - b);
            t *= 2;
            if (t < 1)
                return (e - b) / 2 * std::pow(2.0f, 10.0f * (t - 1)) + b;
            return (e - b) / 2 * (-std::pow(2.0f, -10.0f * (t - 1)) + 2) + b;
        }
        inline float InCirc(float t, float b, float e) { return -(e - b) * (std::sqrt(1 - t * t) - 1) + b; }
        inline float OutCirc(float t, float b, float e)
        {
            t -= 1;
            return (e - b) * std::sqrt(1 - t * t) + b;
        }
        inline float InOutCirc(float t, float b, float e)
        {
            t *= 2;
            if (t < 1)
                return -(e - b) / 2 * (std::sqrt(1 - t * t) - 1) + b;
            t -= 2;
            return (e - b) / 2 * (std::sqrt(1 - t * t) + 1) + b;
        }

        inline float InElastic(float t, float b, float e)
        {
            if (t == 0)
                return b;
            if (t == 1)
                return b + (e - b);
            float p = 0.3f;
            float a = (e - b);
            float s = p / 4.0f;
            t -= 1.0f;
            return -(a * std::pow(2.0f, 10.0f * t) * std::sin((t - s) * 2.0f * (float)M_PI / p)) + b;
        }
        inline float OutElastic(float t, float b, float e)
        {
            if (t == 0)
                return b;
            if (t == 1)
                return b + (e - b);
            float p = 0.3f;
            float a = (e - b);
            float s = p / 4.0f;
            return a * std::pow(2.0f, -10.0f * t) * std::sin((t - s) * 2.0f * (float)M_PI / p) + (e - b) + b;
        }
        inline float InOutElastic(float t, float b, float e)
        {
            if (t == 0)
                return b;
            if (t == 1)
                return b + (e - b);
            t *= 2.0f;
            float p = 0.3f * 1.5f;
            float a = (e - b);
            float s = p / 4.0f;
            if (t < 1)
            {
                t -= 1.0f;
                return -0.5f * (a * std::pow(2.0f, 10.0f * t) * std::sin((t - s) * 2.0f * (float)M_PI / p)) + b;
            }
            t -= 1.0f;
            return a * std::pow(2.0f, -10.0f * t) * std::sin((t - s) * 2.0f * (float)M_PI / p) * 0.5f + (e - b) + b;
        }

        // Utility to adapt frame-based interface: supply frame index and max frames -> normalized t
        inline std::function<float(float, float, float)> FromFrameFn(std::function<float(float, float, float)> fn)
        {
            return fn;
        } // already matches signature (t,start,end)
    }
}
