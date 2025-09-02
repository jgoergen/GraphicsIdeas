// ColorUtils.hpp - Port of ColorFunctions.js to C++
#pragma once
#include "raylib.h"
#include <algorithm>

namespace df
{
    namespace ColorConv
    {
        // All h,s,v,l in [0,1]
        inline Color HSVtoRGB(float h, float s, float v)
        {
            float r = 0, g = 0, b = 0;
            float i = std::floor(h * 6.0f);
            float f = h * 6.0f - i;
            float p = v * (1.0f - s);
            float q = v * (1.0f - f * s);
            float t = v * (1.0f - (1.0f - f) * s);
            int m = (int)i % 6;
            switch (m)
            {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            }
            return Color{(unsigned char)std::round(r * 255.0f), (unsigned char)std::round(g * 255.0f), (unsigned char)std::round(b * 255.0f), 255};
        }

        struct HSV
        {
            float h, s, v;
        };
        inline HSV RGBtoHSV(const Color &c)
        {
            float r = c.r, g = c.g, b = c.b;
            float max = std::max({r, g, b});
            float min = std::min({r, g, b});
            float d = max - min;
            float h = 0.0f;
            float s = (max == 0.0f) ? 0.0f : (d / max);
            float v = max / 255.0f;
            if (max == min)
                h = 0.0f;
            else if (max == r)
                h = (g - b) + d * (g < b ? 6.0f : 0.0f), h /= 6.0f * d;
            else if (max == g)
                h = (b - r) + d * 2.0f, h /= 6.0f * d;
            else if (max == b)
                h = (r - g) + d * 4.0f, h /= 6.0f * d;
            return {h, s, v};
        }

        struct HSL
        {
            float h, s, l;
        };
        inline HSL HSVtoHSL(float h, float s, float v)
        {
            float _s = s * v;
            float _l = (2 - s) * v;
            _s /= (_l <= 1) ? _l : 2 - _l;
            _l /= 2.0f;
            return {h, _s, _l};
        }

        inline HSV HSLtoHSV(float h, float s, float l)
        {
            l *= 2.0f;
            s *= (l <= 1.0f) ? l : 2.0f - l;
            float v = (l + s) / 2.0f;
            float _s = (2.0f * s) / (l + s + 1e-6f);
            return {h, _s, v};
        }
    }
}
