// MathUtils.hpp - Port of MathHelperFunctions.js to C++ for DemoFrameworkCPP
#pragma once
#include <cmath>
#include <utility>
#include <random>

namespace df
{
    struct Point2
    {
        float x{0};
        float y{0};
    };

    namespace Math
    {
        inline float Quantize(float value, float interval)
        {
            if (interval == 0.0f)
                return value;
            return std::round(value / interval) * interval;
        }

        // Returns {row, col} (y, x) like original JS (floor(index/width), index % width)
        inline std::pair<int, int> IndexToXY(int index, int width)
        {
            return {index / width, index % width};
        }

        inline int XYToIndex(int x, int y, int width)
        {
            return x * width + y; // mirrors JS implementation
        }

        // Random float in [low, high). If low==high returns low.
        inline float GetRandom(float low, float high, std::mt19937 *rng = nullptr)
        {
            if (low == high)
                return low;
            if (rng)
            {
                std::uniform_real_distribution<float> dist(low, high);
                return dist(*rng);
            }
            return low + static_cast<float>(rand()) / RAND_MAX * (high - low);
        }

        // Random int in [low, high). If low==high returns low.
        inline int GetRandomInt(int low, int high, std::mt19937 *rng = nullptr)
        {
            if (low == high)
                return low;
            if (rng)
            {
                std::uniform_int_distribution<int> dist(low, high - 1);
                return dist(*rng);
            }
            return low + (rand() % (high - low));
        }

        inline float WrapVal(float val, float lowerLimit, float upperLimit)
        {
            const float range = (upperLimit - lowerLimit);
            if (range == 0.0f)
                return lowerLimit;
            while (val < lowerLimit)
                val += range;
            while (val > upperLimit)
                val -= range;
            return val;
        }

        // Bearing (degrees 0..360) between two geographic positions (lat1, lon1) -> (lat2, lon2) in degrees.
        inline float GetBearingBetweenPositions(float lat1Deg, float lon1Deg, float lat2Deg, float lon2Deg)
        {
            auto DegToRad = [](double d)
            { return d * 3.14159265358979323846 / 180.0; };
            double lat1 = DegToRad(lat1Deg);
            double lat2 = DegToRad(lat2Deg);
            double dLon = DegToRad(lon2Deg - lon1Deg);
            double y = std::sin(dLon) * std::cos(lat2);
            double x = std::cos(lat1) * std::sin(lat2) - std::sin(lat1) * std::cos(lat2) * std::cos(dLon);
            double brng = std::atan2(y, x) * 180.0 / 3.14159265358979323846; // -180..180
            brng = std::fmod((brng + 360.0), 360.0);
            return static_cast<float>(brng);
        }

        inline float DegToRad(float degrees) { return degrees * 3.14159265358979323846f / 180.0f; }
        inline float RadToDeg(float radians) { return radians * 180.0f / 3.14159265358979323846f; }
        inline float RadToBearing(float radians) { return std::fmod(RadToDeg(radians) + 360.0f, 360.0f); }

        inline Point2 RotatePoint(float centerX, float centerY, float x, float y, float angleDegrees)
        {
            float r = DegToRad(angleDegrees);
            float c = std::cos(r);
            float s = std::sin(r);
            Point2 p;
            p.x = (c * (x - centerX)) + (s * (y - centerY)) + centerX;
            p.y = (c * (y - centerY)) - (s * (x - centerX)) + centerY;
            return p;
        }

        inline float Map(float value, float fromStart, float fromEnd, float toStart, float toEnd)
        {
            return (value - fromStart) / (fromEnd - fromStart) * (toEnd - toStart) + toStart;
        }
    }
}
