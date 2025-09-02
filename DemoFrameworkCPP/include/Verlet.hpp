// Verlet.hpp - Port of VerletIntegration & related (Particle, Constraint, Body, Effector, Prefabs)
#pragma once
#include <vector>
#include <functional>
#include <optional>
#include <algorithm>
#include <utility>
#include "Vector2D.hpp"
#include "raylib.h"
#include "Geometry2D.hpp"
#include "MathUtils.hpp"

namespace df
{
    struct Particle
    {
        Vector2D pos;     // current position
        Vector2D lastPos; // previous position
        float mass{1.0f};
        std::optional<Vector2D> pinnedTo; // fixed position
        bool collides{false};
        int objectID{0};
        float radius{0.0f};
        float bounce{0.0f}; // per-particle restitution
        struct Data
        {
            int collided = 0;
            bool drawn = true;
            Color color{WHITE};
        } data;
        Particle() = default;
        Particle(const Vector2D &p, float m = 1.0f) : pos(p), lastPos(p), mass(m) {}
    };

    struct Constraint
    {
        Particle *a{nullptr};
        Particle *b{nullptr};
        float restLength{0};
        float stiffness{1.0f};
        float tolerance{9999.0f};
        bool collides{false};
        int objectID{0};
        Constraint() = default;
        Constraint(Particle *pa, Particle *pb, float stiff = 1.0f, float tol = 9999.f, bool col = false, int obj = 0)
            : a(pa), b(pb), restLength((pa->pos - pb->pos).magnitude()), stiffness(stiff), tolerance(tol), collides(col), objectID(obj) {}
    };

    struct Body
    {
        std::vector<Constraint *> edges;
        bool collides{true};
        float mass{1.0f};
        std::vector<Vector2D *> uniqueVerts;
        Body() = default;
        Body(const std::vector<Constraint *> &e, bool c = true, float m = 1.0f) : edges(e), collides(c), mass(m) { buildUnique(); }
        void buildUnique()
        {
            uniqueVerts.clear();
            for (auto *c : edges)
            {
                if (std::find(uniqueVerts.begin(), uniqueVerts.end(), &c->a->pos) == uniqueVerts.end())
                    uniqueVerts.push_back(&c->a->pos);
                if (std::find(uniqueVerts.begin(), uniqueVerts.end(), &c->b->pos) == uniqueVerts.end())
                    uniqueVerts.push_back(&c->b->pos);
            }
        }
        Vector2D getCenter() const
        {
            Vector2D acc;
            for (auto *v : uniqueVerts)
                acc += *v;
            if (!uniqueVerts.empty())
                acc /= (float)uniqueVerts.size();
            return acc;
        }
        std::pair<Vector2D, Vector2D> getBounds() const
        {
            Vector2D mn(1e9f, 1e9f), mx(-1e9f, -1e9f);
            for (auto *v : uniqueVerts)
            {
                mn.x = std::min(mn.x, v->x);
                mn.y = std::min(mn.y, v->y);
                mx.x = std::max(mx.x, v->x);
                mx.y = std::max(mx.y, v->y);
            }
            return {mn, mx};
        }
        std::pair<float, float> projectToAxis(const Vector2D &axis) const
        {
            float dot = axis.dot(*uniqueVerts[0]);
            float mn = dot, mx = dot;
            for (auto *v : uniqueVerts)
            {
                float d = axis.dot(*v);
                mn = std::min(mn, d);
                mx = std::max(mx, d);
            }
            return {mn, mx};
        }
        struct CollisionInfo
        {
            float distance;
            Vector2D collisionAxis;
            Constraint *edge;
            Body *edgeBody;
            Vector2D *vertex;
            Body *vertexBody;
        };
        CollisionInfo *getCollision(Body &other, CollisionInfo &out)
        {
            float minDist = 1e9f;
            Vector2D bestAxis;
            Constraint *bestEdge = nullptr;
            Body *bestEdgeBody = nullptr;
            bool separated = false;
            auto testAxes = [&](Body &bd)
            {
                for (auto *e : bd.edges)
                {
                    Vector2D axis(e->a->pos.y - e->b->pos.y, e->b->pos.x - e->a->pos.x);
                    axis.normalize();
                    auto p1 = projectToAxis(axis);
                    auto p2 = other.projectToAxis(axis);
                    float dist = (p1.first < p2.first) ? (p2.first - p1.second) : (p1.first - p2.second); // positive -> gap
                    if (dist > 0)
                    {
                        separated = true;
                        return;
                    }
                    float absd = std::fabs(dist);
                    if (absd < minDist)
                    {
                        minDist = absd;
                        bestAxis = axis;
                        bestEdge = e;
                        bestEdgeBody = &bd;
                    }
                }
            };
            testAxes(*this);
            if (separated)
                return nullptr;
            testAxes(other);
            if (separated)
                return nullptr;
            if (!bestEdge)
                return nullptr;
            Body *primary = this;
            Body *secondary = &other;
            if (bestEdgeBody == this)
            {
                primary = &other;
                secondary = this;
            }
            // ensure axis points from edge body towards vertex body
            if (bestAxis.dot(secondary->getCenter() - primary->getCenter()) > 0)
                bestAxis.reverse();
            float smallest = 1e9f;
            Vector2D *collVert = nullptr;
            for (auto *v : primary->uniqueVerts)
            {
                float vd = bestAxis.dot(*v - secondary->getCenter());
                if (vd < smallest)
                {
                    smallest = vd;
                    collVert = v;
                }
            }
            bestAxis *= 0.5f; // damping like JS version
            out = {minDist, bestAxis, bestEdge, bestEdgeBody, collVert, primary};
            return &out;
        }
    };

    struct Effector
    {
        Vector2D pos;
        float force{0};
        float radius{1};
        bool pinToMouse{false};
    };

    class VerletSystem
    {
    public:
        int iterations = 2;
        std::vector<Particle *> particles;
        std::vector<Effector> effectors;
        std::vector<Constraint *> constraints;
        std::vector<Body *> bodies;
        Vector2D gravity{0, 0.005f};
        bool paused = false;
        Vector2D stageMin{10, 10};
        Vector2D stageMax{790, 490};
        Vector2D speedMin{-4, -4};
        Vector2D speedMax{4, 4};
        bool useMass = false;
        float stageFriction = 0.001f;
        bool markCollides = false;
        int maxCollideCount = 20;
        std::function<void(Constraint *)> constraintSnapCallback;
        // Coefficient of restitution (0 = inelastic, 1 = perfectly bouncy) for particle collisions.
        // Default 0 to keep things calm; raise if you want bounce.
        float restitution = 0.0f;

        ~VerletSystem() { clear(); }
        void clear()
        {
            for (auto *p : particles)
                delete p;
            for (auto *c : constraints)
                delete c;
            for (auto *b : bodies)
                delete b;
            particles.clear();
            constraints.clear();
            bodies.clear();
        }

        void addParticle(Particle *p) { particles.push_back(p); }
        void addEffector(const Effector &e) { effectors.push_back(e); }
        void addConstraint(Constraint *c) { constraints.push_back(c); }
        void addBody(Body *b) { bodies.push_back(b); }

        void runTimeStep(float dt)
        {
            if (!paused)
            {
                runVerlet(dt);
                satisfyConstraints();
            }
        }

        void runVerlet(float /*dt*/)
        {
            for (auto *p : particles)
            {
                if (markCollides && p->data.collided > 0)
                    p->data.collided--;
                Vector2D velocity = p->pos - p->lastPos; // effectors
                for (const auto &eff : effectors)
                {
                    float dx = p->pos.x - eff.pos.x;
                    float dy = p->pos.y - eff.pos.y;
                    if (std::fabs(dx) + std::fabs(dy) < eff.radius)
                    {
                        if (eff.force < 0)
                            velocity += Vector2D((1 - (dx / eff.radius)) * eff.force, (1 - (dy / eff.radius)) * eff.force);
                        else
                            velocity += Vector2D((dx / eff.radius) * eff.force, (dy / eff.radius) * eff.force);
                    }
                }
                velocity += gravity; // clamp speed
                auto clampf = [&](float v, float mn, float mx)
                { return v < mn ? mn : (v > mx ? mx : v); };
                velocity.x = clampf(velocity.x, speedMin.x, speedMax.x);
                velocity.y = clampf(velocity.y, speedMin.y, speedMax.y);
                velocity *= (1 - stageFriction);
                p->lastPos = p->pos;
                p->pos += velocity;
            }
        }

        void satisfyConstraints()
        { // stage clamp
            for (auto *p : particles)
            {
                if (p->radius > 0)
                    p->pos.clamp(&Vector2D(stageMin.x + p->radius, stageMin.y + p->radius), &Vector2D(stageMax.x - p->radius, stageMax.y - p->radius));
                else
                    p->pos.clamp(&stageMin, &stageMax);
            }
            for (int it = 0; it < iterations; ++it)
            {
                runConstraints();
                runParticleCollisions();
                runBodyCollisions();
                runPinning();
            }
        }

        void runConstraints()
        {
            for (size_t i = 0; i < constraints.size();)
            {
                Constraint *c = constraints[i];
                Vector2D delta = c->a->pos - c->b->pos;
                float len = delta.magnitude();
                if (len == 0)
                {
                    delta = {1, 0};
                    len = 1;
                }
                Vector2D dir = delta / len;
                float diff = (c->restLength - len);
                Vector2D adj = dir * (diff * 0.5f * c->stiffness);
                c->a->pos += adj;
                c->b->pos -= adj;
                if (std::fabs(diff) > c->tolerance)
                {
                    Constraint *snap = c;
                    constraints.erase(constraints.begin() + i);
                    if (constraintSnapCallback)
                        constraintSnapCallback(snap);
                    delete snap;
                }
                else
                {
                    ++i;
                }
            }
        }

        void runParticleCollisions()
        {
            // New approach: purely positional separation (mass weighted) + optional velocity restitution.
            for (size_t i = 0; i < particles.size(); ++i)
            {
                Particle *a = particles[i];
                if (!a->collides || a->radius <= 0)
                    continue;
                for (size_t j = i + 1; j < particles.size(); ++j)
                {
                    Particle *b = particles[j];
                    if (!b->collides || b->radius <= 0)
                        continue;
                    float totalR = a->radius + b->radius;
                    // Cheap broad phase (AABB-ish) using diamond metric used previously, keep generous factor (2x radii) for safety.
                    if (std::fabs(a->pos.x - b->pos.x) > totalR * 2 || std::fabs(a->pos.y - b->pos.y) > totalR * 2)
                        continue;
                    Vector2D delta = b->pos - a->pos;
                    float distSq = delta.x * delta.x + delta.y * delta.y;
                    if (distSq <= 0.000001f)
                    {
                        // Practically identical positions: jitter slightly to avoid NaNs / division by zero.
                        delta = {0.001f, 0.0f};
                        distSq = delta.x * delta.x + delta.y * delta.y;
                    }
                    float dist = std::sqrt(distSq);
                    if (dist >= totalR)
                        continue; // no overlap
                    // Register collision for visualization first
                    if (markCollides)
                    {
                        if (a->data.collided < maxCollideCount)
                            a->data.collided++;
                        if (b->data.collided < maxCollideCount)
                            b->data.collided++;
                    }
                    // Overlap amount
                    float overlap = totalR - dist;
                    Vector2D normal = delta / dist; // from a -> b
                    float invMassA = (useMass ? 1.0f / a->mass : 1.0f);
                    float invMassB = (useMass ? 1.0f / b->mass : 1.0f);
                    float invMassSum = invMassA + invMassB;
                    if (invMassSum <= 0)
                        invMassSum = 1.0f; // fallback
                    // Positional correction: distribute inversely proportional to mass (heavier moves less)
                    Vector2D correction = normal * (overlap / invMassSum);
                    a->pos -= correction * invMassA;
                    b->pos += correction * invMassB;

                    // Per-particle bounce: use average of their bounce coefficients
                    float pairRestitution = (a->bounce + b->bounce) * 0.5f;
                    if (pairRestitution > 0.0f)
                    {
                        Vector2D va = a->pos - a->lastPos;
                        Vector2D vb = b->pos - b->lastPos;
                        Vector2D rel = va - vb; // relative velocity (approx)
                        float velAlongNormal = rel.dot(normal);
                        if (velAlongNormal < 0.0f) // only if closing along normal (post-separation adjustment)
                        {
                            float j = -(1.0f + pairRestitution) * velAlongNormal;
                            j /= invMassSum;
                            Vector2D impulse = normal * j;
                            a->lastPos -= impulse * invMassA;
                            b->lastPos += impulse * invMassB;
                        }
                    }
                }
            }
        }

        void runBodyCollisions()
        {
            for (size_t i = 0; i < bodies.size(); ++i)
            {
                Body *A = bodies[i];
                if (!A->collides)
                    continue;
                for (size_t j = i + 1; j < bodies.size(); ++j)
                {
                    Body *B = bodies[j];
                    if (!B->collides)
                        continue;
                    Body::CollisionInfo info;
                    if (A->getCollision(*B, info))
                    {
                        float t;
                        Vector2D &s = info.edge->a->pos;
                        Vector2D &e = info.edge->b->pos;
                        if (std::fabs(s.x - e.x) > std::fabs(s.y - e.y))
                            t = (info.vertex->x - info.collisionAxis.x - s.x) / (e.x - s.x);
                        else
                            t = (info.vertex->y - info.collisionAxis.y - s.y) / (e.y - s.y);
                        float lambda = 1.f / (t * t + (1 - t) * (1 - t));
                        if (useMass)
                        {
                            float edgeMass = info.edgeBody->mass;
                            float invMass = 1.f / (edgeMass + info.vertexBody->mass);
                            float ratio1 = info.vertexBody->mass * invMass;
                            float ratio2 = edgeMass * invMass;
                            s -= info.collisionAxis * (1 - t) * ratio1 * lambda;
                            e -= info.collisionAxis * t * ratio1 * lambda;
                            *info.vertex += info.collisionAxis * ratio2;
                        }
                        else
                        {
                            s -= info.collisionAxis * (1 - t) * 0.5f * lambda;
                            e -= info.collisionAxis * t * 0.5f * lambda;
                            *info.vertex += info.collisionAxis * 0.5f;
                        }
                    }
                }
            }
        }

        void runPinning()
        {
            for (auto *p : particles)
                if (p->pinnedTo)
                    p->pos = p->pinnedTo->copy();
        }
    };

    // Prefabs ---------------------------------------------------------
    namespace Prefab
    {
        inline void Rope(VerletSystem &vs, float startX, float startY, int links, float linkLength, float elasticity, bool pinFirst)
        {
            Particle *last = nullptr;
            for (int i = 0; i < links; ++i)
            {
                Particle *p = new Particle({startX + i * linkLength, startY});
                if (i == 0 && pinFirst)
                    p->pinnedTo = Vector2D(startX, startY);
                vs.addParticle(p);
                if (last)
                {
                    vs.addConstraint(new Constraint(p, last, elasticity));
                }
                last = p;
            }
        }

        inline void Box(VerletSystem &vs, float x, float y, float width, float height, float rotationDegrees, bool collides, float stiffness, int objectID)
        {
            using df::Math::RotatePoint;
            auto p1 = new Particle({x, y});
            p1->objectID = objectID;
            auto rp2 = RotatePoint(x, y, x + width, y, rotationDegrees);
            auto p2 = new Particle({rp2.x, rp2.y});
            p2->objectID = objectID;
            auto rp3 = RotatePoint(x, y, x + width, y + height, rotationDegrees);
            auto p3 = new Particle({rp3.x, rp3.y});
            p3->objectID = objectID;
            auto rp4 = RotatePoint(x, y, x, y + height, rotationDegrees);
            auto p4 = new Particle({rp4.x, rp4.y});
            p4->objectID = objectID;
            vs.addParticle(p1);
            vs.addParticle(p2);
            vs.addParticle(p3);
            vs.addParticle(p4);
            auto c1 = new Constraint(p1, p2, stiffness, 9999.f, collides, objectID);
            auto c2 = new Constraint(p2, p3, stiffness, 9999.f, collides, objectID);
            auto c3 = new Constraint(p3, p4, stiffness, 9999.f, collides, objectID);
            auto c4 = new Constraint(p4, p1, stiffness, 9999.f, collides, objectID);
            vs.addConstraint(c1);
            vs.addConstraint(c2);
            vs.addConstraint(c3);
            vs.addConstraint(c4);
            vs.addBody(new Body({c1, c2, c3, c4}, true));
            vs.addConstraint(new Constraint(p1, p3, stiffness));
            vs.addConstraint(new Constraint(p2, p4, stiffness));
        }

        inline void Triangle(VerletSystem &vs, float startX, float startY, float size, float elasticity, int objectID)
        {
            auto p1 = new Particle({startX, startY});
            p1->objectID = objectID;
            auto p2 = new Particle({startX + size, startY});
            p2->objectID = objectID;
            auto p3 = new Particle({startX, startY + size});
            p3->objectID = objectID;
            vs.addParticle(p1);
            vs.addParticle(p2);
            vs.addParticle(p3);
            auto e1 = new Constraint(p1, p2, elasticity, 9999.f, true, objectID);
            auto e2 = new Constraint(p2, p3, elasticity, 9999.f, true, objectID);
            auto e3 = new Constraint(p3, p1, elasticity, 9999.f, true, objectID);
            vs.addConstraint(e1);
            vs.addConstraint(e2);
            vs.addConstraint(e3);
            vs.addBody(new Body({e1, e2, e3}, true));
        }

        inline void Cloth(VerletSystem &vs, float startX, float startY, int links, float linkLength, float elasticity, float tolerance, bool pinCorners)
        {
            // grid size: xlinks = links*2 horizontally as per JS version
            int xlinks = links * 2;
            std::vector<std::vector<Particle *>> grid(xlinks, std::vector<Particle *>(links, nullptr));
            for (int i = 0; i < xlinks; ++i)
            {
                for (int j = 0; j < links; ++j)
                {
                    bool pin = (pinCorners && j == 0 && (i == 0 || i == (xlinks - 1)));
                    auto p = new Particle({startX + i * linkLength, startY + j * linkLength});
                    if (pin)
                        p->pinnedTo = Vector2D(p->pos.x, p->pos.y);
                    vs.addParticle(p);
                    grid[i][j] = p;
                    if (i > 0)
                    {
                        auto c = new Constraint(p, grid[i - 1][j], elasticity, tolerance, true, 0);
                        vs.addConstraint(c);
                    }
                    if (j > 0)
                    {
                        auto c = new Constraint(p, grid[i][j - 1], elasticity, tolerance, true, 0);
                        vs.addConstraint(c);
                    }
                }
            }
        }
    }
}
