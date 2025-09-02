// VectorHelperFunctions.hpp - Port/adaptation of v3/libs/2DLib/VectorHelperFunctions.js
#pragma once
#include <cmath>
#include "Vector2D.hpp"
#include "Verlet.hpp" // forward uses Particle for collision helpers

namespace df
{
    namespace VecHelp
    {
        inline bool IsParallel(const Vector2D &v1, const Vector2D &v2, float tolerance = 1e-4f)
        {
            Vector2D a = v1.getNormalized();
            Vector2D b = v2.getNormalized();
            if (std::fabs(a.x - b.x) <= tolerance && std::fabs(a.y - b.y) <= tolerance)
                return true;
            if (std::fabs(a.x + b.x) <= tolerance && std::fabs(a.y + b.y) <= tolerance)
                return true; // opposite direction
            return false;
        }

        inline float AngleBetweenVectorsDegrees(const Vector2D &v1, const Vector2D &v2)
        {
            float magProd = v1.magnitude() * v2.magnitude();
            if (magProd == 0)
                return 0.0f;
            float d = std::clamp(v1.dot(v2) / magProd, -1.0f, 1.0f);
            return std::acos(d) * 180.0f / (float)M_PI;
        }

        inline float Perp(const Vector2D &v1, const Vector2D &v2) { return v2.x * v1.y - v2.y * v1.x; }

        inline Vector2D Projection(const Vector2D &v1, const Vector2D &v2)
        {
            float denom = v2.dot(v2);
            if (denom == 0)
                return {0, 0};
            float scale = v1.dot(v2) / denom;
            return v2 * scale;
        }

        inline Vector2D Projection2(const Vector2D &v, float dx, float dy)
        {
            float denom = dx * dx + dy * dy;
            if (denom == 0)
                return {0, 0};
            float dot = v.x * dx + v.y * dy;
            float scale = dot / denom;
            return {dx * scale, dy * scale};
        }

        inline float Dot(const Vector2D &v1, const Vector2D &v2) { return v1.dot(v2); }

        // Collision helpers working on Particles (using position delta as velocity)
        inline void RoundCollision(Particle &p1, Particle &p2, bool useMass)
        {
            Vector2D temp = p1.pos - p2.pos;
            temp.setMagnitude(1.f);
            Vector2D v1 = p1.pos - p1.lastPos;
            Vector2D v2 = p2.pos - p2.lastPos;
            float a1 = v1.dot(temp);
            float a2 = v2.dot(temp);
            float optimizedP = useMass ? (2.f * (a1 - a2)) / (p1.mass + p2.mass) : (2.f * (a1 - a2));
            Vector2D newV1 = v1 - temp * optimizedP * p2.mass;
            Vector2D newV2 = v2 + temp * optimizedP * p1.mass;
            // apply new positions (verlet style)
            p1.lastPos = p1.pos - newV1;
            p2.lastPos = p2.pos - newV2;
        }

        inline void FlatCollision(Particle &moving, const Vector2D &wallDir, float friction = 1.0f, float bounce = 1.0f)
        {
            Vector2D vel = moving.pos - moving.lastPos;
            Vector2D wallNorm = wallDir.getNormalized();
            Vector2D leftNorm = wallDir.getLeftNormal();
            float d1 = vel.dot(wallNorm);
            Vector2D proj1 = wallNorm * d1;
            float d2 = vel.dot(leftNorm);
            Vector2D proj2 = leftNorm * d2 * -1.f; // reflect
            Vector2D newVel = proj1 * friction + proj2 * bounce;
            moving.lastPos = moving.pos - newVel;
        }

        inline Vector2D FindIntersectionVector(const Vector2D &point, const Vector2D &lineDir)
        {
            Vector2D diff = {point.x - lineDir.x, point.y - lineDir.y};
            Vector2D left = lineDir.getLeftNormal();
            return Projection2(diff, left.x, left.y);
        }

        inline float DistanceToIntersection(const Vector2D &point, const Vector2D &lineDir)
        {
            Vector2D left = lineDir.getLeftNormal();
            float dot = (point.x - lineDir.x) * left.x + (point.y - lineDir.y) * left.y;
            float sx = dot * left.x;
            float sy = dot * left.y;
            return std::sqrt(sx * sx + sy * sy);
        }
    }
}
