// DrawingUtils.hpp - Partial port of DrawingHelperFunctions.js for raylib
#pragma once
#include "raylib.h"
#include <vector>
#include <cstdint>
#include "MathUtils.hpp"

namespace df
{
    namespace Draw
    {
        inline void Circle(int x, int y, float radius, Color fillColor, int borderThickness = 0, Color borderColor = BLACK)
        {
            DrawCircleV({(float)x, (float)y}, radius, fillColor);
            if (borderThickness > 0)
                DrawCircleLines(x, y, radius, borderColor);
        }

        inline void SunburstPixelPattern(int splits, int center, int x, int y, int pixelSize, Color color)
        {
            for (int i = 0; i < splits; ++i)
            {
                float rads = (float)M_PI / 180.0f * ((360.0f / splits) * i);
                float c = std::cos(rads);
                float s = std::sin(rads);
                int px = (int)((c * (x - center)) + (s * (y - center)) + center);
                int py = (int)((c * (y - center)) - (s * (x - center)) + center);
                DrawRectangle(px, py, pixelSize, pixelSize, color);
            }
        }

        inline df::Point2 InterpolatePoints(const df::Point2 &p1, const df::Point2 &p2, float amount)
        {
            return {p1.x + ((p2.x - p1.x) * amount), p1.y + ((p2.y - p1.y) * amount)};
        }

        // amount in [0,1]; points form loop like JS version
        inline df::Point2 InterpolateMultiplePoints(float amount, const std::vector<df::Point2> &points)
        {
            if (points.empty())
                return {0, 0};
            float segmentLen = (1.0f / points.size()) + 0.01f;
            int seg1 = (int)std::floor(amount / segmentLen);
            if (seg1 >= (int)points.size())
                seg1 = (int)points.size() - 1;
            int seg2 = (seg1 == (int)points.size() - 1) ? 0 : seg1 + 1;
            while (amount > segmentLen)
                amount -= segmentLen;
            float segAmount = amount / segmentLen;
            return {points[seg1].x + ((points[seg2].x - points[seg1].x) * segAmount),
                    points[seg1].y + ((points[seg2].y - points[seg1].y) * segAmount)};
        }

        inline void SunburstLinePattern(int splits, int center, int x1, int y1, int x2, int y2, Color color)
        {
            for (int i = 0; i < splits; ++i)
            {
                float rads = (float)M_PI / 180.0f * ((360.0f / splits) * i);
                float c = std::cos(rads);
                float s = std::sin(rads);
                int sx = (int)((c * (x1 - center)) + (s * (y1 - center)) + center);
                int sy = (int)((c * (y1 - center)) - (s * (x1 - center)) + center);
                int ex = (int)((c * (x2 - center)) + (s * (y2 - center)) + center);
                int ey = (int)((c * (y2 - center)) - (s * (x2 - center)) + center);
                DrawLine(sx, sy, ex, ey, color);
            }
        }

        inline std::vector<df::Point2> BreakLineIntoSteps(float x1, float y1, float x2, float y2, int steps)
        {
            std::vector<df::Point2> pts;
            pts.reserve(steps);
            float intervalX = (x2 - x1) / steps;
            float intervalY = (y2 - y1) / steps;
            for (int step = 0; step < steps; ++step)
            {
                df::Point2 p{x1 + step * intervalX, y1 + step * intervalY};
                pts.push_back(p);
            }
            return pts;
        }

        // Image pixel helpers -------------------------------------------------
        inline Color GetPixel(const Image &img, int x, int y)
        {
            return GetImageColor(img, x, y);
        }

        inline void SetPixel(Image &img, int x, int y, Color c)
        {
            ImageDrawPixel(&img, x, y, c);
        }

        inline void AddToPixel(Image &img, int x, int y, int dr, int dg, int db)
        {
            Color c = GetImageColor(img, x, y);
            int r = std::clamp<int>(c.r + dr, 0, 255);
            int g = std::clamp<int>(c.g + dg, 0, 255);
            int b = std::clamp<int>(c.b + db, 0, 255);
            SetPixel(img, x, y, Color{(unsigned char)r, (unsigned char)g, (unsigned char)b, c.a});
        }

        inline void GreyScale(Image &img)
        {
            for (int y = 0; y < img.height; ++y)
                for (int x = 0; x < img.width; ++x)
                {
                    Color c = GetImageColor(img, x, y);
                    unsigned char avg = (unsigned char)((c.r + c.g + c.b) / 3);
                    SetPixel(img, x, y, {avg, avg, avg, c.a});
                }
        }

        // Reduce color palette with optional Floyd–Steinberg dithering.
        inline void ReduceColors(Image &img, int reductionFactor, bool dithering)
        {
            if (reductionFactor <= 0)
                return;
            auto ReduceChannel = [&](int v)
            { return (int)std::round(reductionFactor * v / 255.0) * (255 / reductionFactor); };
            for (int y = 0; y < img.height; ++y)
            {
                for (int x = 0; x < img.width; ++x)
                {
                    Color oldC = GetImageColor(img, x, y);
                    int nr = ReduceChannel(oldC.r);
                    int ng = ReduceChannel(oldC.g);
                    int nb = ReduceChannel(oldC.b);
                    SetPixel(img, x, y, {(unsigned char)nr, (unsigned char)ng, (unsigned char)nb, oldC.a});
                    if (dithering)
                    {
                        int errR = oldC.r - nr;
                        int errG = oldC.g - ng;
                        int errB = oldC.b - nb;
                        const struct Off
                        {
                            int dx, dy;
                            float f;
                        } offs[] = {
                            {1, 0, 7 / 16.f}, {-1, 1, 3 / 16.f}, {0, 1, 5 / 16.f}, {1, 1, 1 / 16.f}};
                        for (auto &o : offs)
                        {
                            int nx = x + o.dx, ny = y + o.dy;
                            if (nx < 0 || nx >= img.width || ny < 0 || ny >= img.height)
                                continue;
                            Color nc = GetImageColor(img, nx, ny);
                            int rr = std::clamp<int>(nc.r + (int)(errR * o.f), 0, 255);
                            int rg = std::clamp<int>(nc.g + (int)(errG * o.f), 0, 255);
                            int rb = std::clamp<int>(nc.b + (int)(errB * o.f), 0, 255);
                            SetPixel(img, nx, ny, {(unsigned char)rr, (unsigned char)rg, (unsigned char)rb, nc.a});
                        }
                    }
                }
            }
        }

        inline void Brighten(Image &img, int adjustment)
        {
            for (int y = 0; y < img.height; ++y)
                for (int x = 0; x < img.width; ++x)
                {
                    Color c = GetImageColor(img, x, y);
                    int r = std::clamp<int>(c.r + adjustment, 0, 255);
                    int g = std::clamp<int>(c.g + adjustment, 0, 255);
                    int b = std::clamp<int>(c.b + adjustment, 0, 255);
                    SetPixel(img, x, y, {(unsigned char)r, (unsigned char)g, (unsigned char)b, c.a});
                }
        }

        // Simple box blur (radius, iterations) - lighter than full JS port but functional.
        inline void BoxBlur(Image &img, int radius, int iterations = 1)
        {
            if (radius <= 0 || iterations <= 0)
                return;
            Image tmp = ImageCopy(img);
            std::vector<Color> buffer(img.width * img.height);
            for (int it = 0; it < iterations; ++it)
            {
                // horizontal
                for (int y = 0; y < img.height; ++y)
                {
                    for (int x = 0; x < img.width; ++x)
                    {
                        int r = 0, g = 0, b = 0, a = 0, count = 0;
                        for (int dx = -radius; dx <= radius; ++dx)
                        {
                            int nx = x + dx;
                            if (nx < 0 || nx >= img.width)
                                continue;
                            Color c = GetImageColor(img, nx, y);
                            r += c.r;
                            g += c.g;
                            b += c.b;
                            a += c.a;
                            ++count;
                        }
                        buffer[y * img.width + x] = {(unsigned char)(r / count), (unsigned char)(g / count), (unsigned char)(b / count), (unsigned char)(a / count)};
                    }
                }
                // vertical
                for (int y = 0; y < img.height; ++y)
                {
                    for (int x = 0; x < img.width; ++x)
                    {
                        int r = 0, g = 0, b = 0, a = 0, count = 0;
                        for (int dy = -radius; dy <= radius; ++dy)
                        {
                            int ny = y + dy;
                            if (ny < 0 || ny >= img.height)
                                continue;
                            Color c = buffer[ny * img.width + x];
                            r += c.r;
                            g += c.g;
                            b += c.b;
                            a += c.a;
                            ++count;
                        }
                        SetPixel(img, x, y, {(unsigned char)(r / count), (unsigned char)(g / count), (unsigned char)(b / count), (unsigned char)(a / count)});
                    }
                }
            }
            UnloadImage(tmp);
        }
    }
}
