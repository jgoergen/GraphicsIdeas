// MidpointDisplacementNoise.hpp - Port of MidpointDisplacementNoiseGenerator.js
#pragma once
#include <vector>
#include <random>
#include <cmath>
#include "raylib.h"

namespace df
{
    class MidpointDisplacementNoise
    {
    public:
        MidpointDisplacementNoise(int mapDimension = 256, float roughness = 5.0f, int unitSize = 1, int blockSize = 2, bool looping = false)
            : dim(mapDimension), rough(roughness), unit(unitSize), block(blockSize), loop(looping)
        {
            if (dim % 2 != 0)
                dim += 1; // ensure even for midpoint splits
            map.assign((dim + 1) * (dim + 1), 0.0f);
        }

        void Generate(std::mt19937 *rng = nullptr)
        {
            auto frand = [&](float a = 0.f, float b = 1.f)
            {
                if (rng)
                {
                    std::uniform_real_distribution<float> d(a, b);
                    return d(*rng);
                }
                return a + (float)rand() / RAND_MAX * (b - a);
            };
            // corners
            set(0, 0, frand());
            set(0, dim, frand());
            set(dim, 0, frand());
            set(dim, dim, frand());
            // center
            float center = (get(0, 0) + get(0, dim) + get(dim, 0) + get(dim, dim)) / 4.0f;
            set(dim / 2, dim / 2, center);
            set(dim / 2, 0, center / 3.0f);
            set(dim / 2, dim, center / 3.0f);
            set(0, dim / 2, center / 3.0f);
            set(dim, dim / 2, center / 3.0f);
            midpointDisplace(dim);
        }

        // Render to a raylib Image (grayscale). Caller must UnloadImage.
        Image Render(int offsetX = 0, int offsetY = 0, int heightOffset = 0)
        {
            Image img = GenImageColor(dim * block, dim * block, BLACK);
            for (int x = 0; x <= dim; x += unit)
            {
                for (int y = 0; y <= dim; y += unit)
                {
                    int actualX = x + offsetX;
                    wrap(actualX);
                    if (loop)
                        actualX = dim - actualX;
                    int actualY = y + offsetY;
                    wrap(actualY);
                    if (loop)
                        actualY = dim - actualY;
                    int h = (int)std::floor(get(actualX, actualY) * 250.0f);
                    if (heightOffset)
                    {
                        h += heightOffset;
                        if (h >= 255)
                            h -= 255;
                        if (h < 0)
                            h += 255;
                    }
                    unsigned char uc = (unsigned char)h;
                    Color c{uc, uc, uc, 255};
                    // scale
                    for (int bx = 0; bx < block; ++bx)
                        for (int by = 0; by < block; ++by)
                            ImageDrawPixel(&img, x * block + bx, y * block + by, c);
                }
            }
            return img;
        }

        float GetValue(int x, int y)
        {
            wrap(x);
            wrap(y);
            return get(x, y);
        }

    private:
        int dim;
        float rough;
        int unit;
        int block;
        bool loop;
        std::vector<float> map; // (dim+1)x(dim+1)

        inline int idx(int x, int y) const { return y * (dim + 1) + x; }
        inline float get(int x, int y) const { return map[idx(x, y)]; }
        inline void set(int x, int y, float v) { map[idx(x, y)] = normalize(v); }
        inline void wrap(int &v) const
        {
            while (v > dim)
                v -= dim;
            while (v < 0)
                v += dim;
        }
        inline float normalize(float v) const
        {
            if (v > 1.f)
                v = 1.f;
            else if (v < 0.f)
                v = 0.f;
            return v;
        }
        float displace(int scale)
        {
            float max = (float)scale / (dim + dim) * rough;
            return (((float)rand() / RAND_MAX) - 0.5f) * max;
        }
        void midpointDisplace(int dimension)
        {
            int newDim = dimension / 2;
            if (newDim <= unit)
                return;
            for (int i = newDim; i <= dim; i += newDim)
            {
                for (int j = newDim; j <= dim; j += newDim)
                {
                    int x = i - newDim / 2;
                    int y = j - newDim / 2;
                    float topLeft = get(i - newDim, j - newDim);
                    float topRight = get(i, j - newDim);
                    float bottomLeft = get(i - newDim, j);
                    float bottomRight = get(i, j);
                    float center = (topLeft + topRight + bottomLeft + bottomRight) / 4.0f + displace(dimension);
                    set(x, y, center);
                    center = get(x, y);
                    // top
                    if (j - (newDim * 2) + newDim / 2 > 0)
                        set(x, j - newDim, (topLeft + topRight + center + get(x, j - dimension + newDim / 2)) / 4.0f + displace(dimension));
                    else
                        set(x, j - newDim, (topLeft + topRight + center) / 3.0f + displace(dimension));
                    // bottom
                    if (j + newDim / 2 < dim)
                        set(x, j, (bottomLeft + bottomRight + center + get(x, j + newDim / 2)) / 4.0f + displace(dimension));
                    else
                        set(x, j, (bottomLeft + bottomRight + center) / 3.0f + displace(dimension));
                    // right
                    if (i + newDim / 2 < dim)
                        set(i, y, (topRight + bottomRight + center + get(i + newDim / 2, y)) / 4.0f + displace(dimension));
                    else
                        set(i, y, (topRight + bottomRight + center) / 3.0f + displace(dimension));
                    // left
                    if (i - (newDim * 2) + newDim / 2 > 0)
                        set(i - newDim, y, (topLeft + bottomLeft + center + get(i - dimension + newDim / 2, y)) / 4.0f + displace(dimension));
                    else
                        set(i - newDim, y, (topLeft + bottomLeft + center) / 3.0f + displace(dimension));
                }
            }
            midpointDisplace(newDim);
        }
    };
}
