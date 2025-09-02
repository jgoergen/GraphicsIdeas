// ImageUtils.hpp - Port of needed ImageUtilities.js functions using raylib Image
#pragma once
#include "raylib.h"
#include <algorithm>

namespace df
{
    namespace Img
    {
        inline void ReplaceColor(Image &img, Color target, Color replacement, bool matchAlpha = false)
        {
            for (int y = 0; y < img.height; ++y)
                for (int x = 0; x < img.width; ++x)
                {
                    Color c = GetImageColor(img, x, y);
                    if (c.r == target.r && c.g == target.g && c.b == target.b && (!matchAlpha || c.a == target.a))
                        ImageDrawPixel(&img, x, y, replacement);
                }
        }

        inline void MakeColorTransparent(Image &img, Color col)
        {
            Color transparent{0, 0, 0, 0};
            ReplaceColor(img, col, transparent, false);
        }

        inline void Tint(Image &img, Color col, float amount)
        {
            amount = std::clamp(amount, 0.0f, 1.0f);
            for (int y = 0; y < img.height; ++y)
                for (int x = 0; x < img.width; ++x)
                {
                    Color c = GetImageColor(img, x, y);
                    int r = (int)(c.r + (col.r - c.r) * amount);
                    int g = (int)(c.g + (col.g - c.g) * amount);
                    int b = (int)(c.b + (col.b - c.b) * amount);
                    ImageDrawPixel(&img, x, y, {(unsigned char)r, (unsigned char)g, (unsigned char)b, c.a});
                }
        }
    }
}
