// Geometry2D.hpp - Ports of Circle2D.js, Line2D.js, CollisionFuncs.js
#pragma once
#include "Vector2D.hpp"
#include <optional>
#include <cmath>

namespace df
{
    struct Circle2D
    {
        Vector2D center;
        float radius{0};
        Circle2D() = default;
        Circle2D(const Vector2D &c, float r) : center(c), radius(r) {}
        bool isPointInside(float x, float y) const { return center.distanceTo({x, y}) < radius; }
        bool isVectorInside(const Vector2D &v) const { return center.distanceTo(v) < radius; }
        bool intersects(const Circle2D &c) const { return center.distanceTo(c.center) <= (radius + c.radius); }
        bool containsCircle(const Circle2D &c) const
        {
            float d = center.distanceTo(c.center);
            return (c.radius >= radius && d <= (c.radius - radius)) || (radius >= c.radius && d <= (radius - c.radius));
        }
    };

    struct Line2D
    {
        Vector2D a;
        Vector2D b;
        Line2D() = default;
        Line2D(const Vector2D &p1, const Vector2D &p2) : a(p1), b(p2) {}
        Vector2D leftNormal() const { return (b - a).getLeftNormal(); }
        Vector2D rightNormal() const { return (b - a).getRightNormal(); }
        float crossPoint(const Vector2D &p) const { return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x); }
        bool isVectorColinear(const Vector2D &p, float tolerance = 0.f) const { return std::fabs(crossPoint(p)) < tolerance; }
        bool isVectorLeft(const Vector2D &p) const { return crossPoint(p) > 0; }
        bool isVectorRight(const Vector2D &p) const { return crossPoint(p) < 0; }
        float directionRadians() const { return std::atan2(b.y - a.y, b.x - a.x); }
    };

    namespace Collision
    {
        inline bool CircleCrossesLine(const Vector2D &point, float radius, const Vector2D &lineStart, const Vector2D &lineEnd)
        {
            Vector2D d = lineEnd - lineStart; // segment vector
            Vector2D f = lineStart - point;
            float a = d.dot(d);
            float b = 2 * f.dot(d);
            float c = f.dot(f) - radius * radius;
            float disc = b * b - 4 * a * c;
            if (disc < 0)
                return false;
            disc = std::sqrt(disc);
            float t1 = (-b - disc) / (2 * a);
            float t2 = (-b + disc) / (2 * a);
            if (t1 >= 0 && t1 <= 1)
                return true;
            if (t2 >= 0 && t2 <= 1)
                return true;
            return false;
        }

        struct CircleLineCollision
        {
            Vector2D pointCollisionVector;
            Vector2D lineStartCollisionVector;
            Vector2D lineEndCollisionVector;
        };

        inline CircleLineCollision GetCircleCrossingLineCollision(const Vector2D &circle, float radius, const Vector2D &lineStart, const Vector2D &lineEnd)
        {
            Vector2D lineDir = (lineStart - lineEnd).getNormalized();
            Vector2D pointToStart = circle - lineStart;
            float dot = pointToStart.dot(lineDir);
            Vector2D nearestPoint = lineStart + lineDir * dot;
            Vector2D collisionVector = (circle - nearestPoint).getNormalized();
            float t;
            if (std::fabs(lineStart.x - lineEnd.x) > std::fabs(lineStart.y - lineEnd.y))
                t = (circle.x - collisionVector.x - lineStart.x) / (lineEnd.x - lineStart.x);
            else
                t = (circle.y - collisionVector.y - lineStart.y) / (lineEnd.y - lineStart.y);
            float lambda = 1.0f / (t * t + (1 - t) * (1 - t));
            return {collisionVector * 0.5f, collisionVector * (1 - t) * 0.5f * lambda, collisionVector * t * 0.5f * lambda};
        }
    }
}
