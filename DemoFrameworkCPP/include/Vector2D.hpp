// Vector2D.hpp - Port of v3/libs/2DLib/Vector2D.js
#pragma once
#include <cmath>
#include <string>
#include <algorithm>

#ifndef DF_PI
#define DF_PI 3.14159265358979323846f
#endif

namespace df
{
    struct Vector2D
    {
        float x{0.0f};
        float y{0.0f};
        static constexpr float NORMAL_TOLERANCE = 0.0001f;

        Vector2D() = default;
        Vector2D(float _x, float _y) : x(_x), y(_y) {}

        float magnitude() const { return std::sqrt(x * x + y * y); }
        float length() const { return magnitude(); }
        float distanceTo(const Vector2D &o) const { return Vector2D(o.x - x, o.y - y).magnitude(); }
        float dot(const Vector2D &o) const { return x * o.x + y * o.y; }
        float cross(const Vector2D &o) const { return x * o.y - o.x * y; }
        Vector2D &setMagnitude(float m)
        {
            float dir = directionRadians();
            x = std::cos(dir) * m;
            y = std::sin(dir) * m;
            return *this;
        }
        Vector2D &setLength(float l) { return setMagnitude(l); }
        Vector2D &normalize()
        {
            float mag = magnitude();
            if (mag <= NORMAL_TOLERANCE)
                mag = 1.0f;
            x /= mag;
            y /= mag;
            if (std::fabs(x) < NORMAL_TOLERANCE)
                x = 0;
            if (std::fabs(y) < NORMAL_TOLERANCE)
                y = 0;
            return *this;
        }
        Vector2D getNormalized() const
        {
            float mag = magnitude();
            if (mag <= NORMAL_TOLERANCE)
                mag = 1.0f;
            float nx = x / mag;
            float ny = y / mag;
            if (std::fabs(nx) < NORMAL_TOLERANCE)
                nx = 0;
            if (std::fabs(ny) < NORMAL_TOLERANCE)
                ny = 0;
            return {nx, ny};
        }
        Vector2D getReverse() const { return {-x, -y}; }
        Vector2D &reverse()
        {
            x = -x;
            y = -y;
            return *this;
        }
        float directionRadians() const { return std::atan2(y, x); }
        float directionDegrees() const { return directionRadians() * 180.0f / DF_PI; }
        void setDirectionRadians(float angleDeg)
        {
            float mag = magnitude();
            float rad = angleDeg * DF_PI / 180.f;
            x = std::cos(rad) * mag;
            y = std::sin(rad) * mag;
        }
        void setDirectionDegrees(float angleRad)
        {
            float mag = magnitude();
            x = std::cos(angleRad) * mag;
            y = std::sin(angleRad) * mag;
        }
        Vector2D getRightNormal() const
        {
            Vector2D n = getNormalized();
            return {n.y, -n.x};
        }
        Vector2D getLeftNormal() const
        {
            Vector2D n = getNormalized();
            return {-n.y, n.x};
        }
        Vector2D &clamp(const Vector2D *minV, const Vector2D *maxV)
        {
            if (minV)
            {
                x = std::max(x, minV->x);
                y = std::max(y, minV->y);
            }
            if (maxV)
            {
                x = std::min(x, maxV->x);
                y = std::min(y, maxV->y);
            }
            return *this;
        }
        std::string toString() const { return "x:" + std::to_string(x) + ", y:" + std::to_string(y); }
        Vector2D copy() const { return *this; }

        // Arithmetic helpers (non-mutating)
        Vector2D operator+(const Vector2D &o) const { return {x + o.x, y + o.y}; }
        Vector2D operator-(const Vector2D &o) const { return {x - o.x, y - o.y}; }
        Vector2D operator*(float s) const { return {x * s, y * s}; }
        Vector2D operator/(float s) const { return {x / s, y / s}; }
        Vector2D &operator+=(const Vector2D &o)
        {
            x += o.x;
            y += o.y;
            return *this;
        }
        Vector2D &operator-=(const Vector2D &o)
        {
            x -= o.x;
            y -= o.y;
            return *this;
        }
        Vector2D &operator*=(float s)
        {
            x *= s;
            y *= s;
            return *this;
        }
        Vector2D &operator/=(float s)
        {
            x /= s;
            y /= s;
            return *this;
        }
    };
}
