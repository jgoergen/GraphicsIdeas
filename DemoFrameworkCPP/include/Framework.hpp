#pragma once
#include <string>
#include <vector>
#include <functional>
#include <unordered_map>
#include <random>

// Forward declaration for builder so DemoVariableSet can reference it
struct VB;

struct DemoVariable
{
    std::string name;
    float value = 0.0f;      // current value
    float target = 0.0f;     // target value to lerp toward
    float startValue = 0.0f; // starting value for current transition (kept for stable interpolation)
    float min = 0.0f;
    float max = 1.0f;
    int transitionFrames = 0; // frames to reach target
    bool locked = false;
    bool ceiled = false;
    bool floored = false;
    bool integer = false;
    bool isBool = false;         // treat value as boolean (0/1)
    bool hasInitial = false;     // user supplied explicit initial value
    bool firstGeneration = true; // first regenerate pass special rules

    // runtime
    int remainingFrames = 0;       // frames left in transition
    int totalTransitionFrames = 0; // total frames of current transition (stable reference)

    std::function<float()> generator;                 // random generator
    std::function<float(float, float, float)> easing; // easing function (t, start, end)

    void Regenerate();
    void Update();
};

class DemoVariableSet
{
public:
    DemoVariable &Add(const DemoVariable &v);
    DemoVariable &Add(const VB &builder); // builder overload
    DemoVariable *Get(const std::string &name);
    void ForEach(const std::function<void(DemoVariable &)> &fn);
    void RegenerateAll(bool onlyUnlocked = true);

private:
    std::vector<DemoVariable> vars;
};

// Forward declare context struct so demos can reference before definition
struct DemoCtx;

// Lightweight typed reference to a DemoVariable (easy auto-complete & implicit float conversion)
struct VarRef
{
    DemoVariable *p = nullptr;
    float val() const { return p ? p->value : 0.0f; }
    operator float() const { return val(); }
};

class BaseDemo
{
public:
    virtual ~BaseDemo() = default;
    virtual std::string Name() const = 0;
    // New unified callbacks all receive a short-name context parameter (cx)
    // OnConfigure: add variables using cx.vs & cx.r (rng)
    virtual void OnConfigure(DemoCtx &cx) = 0;
    virtual void OnInit(DemoCtx &cx) {}     // after variables defined & first generation
    virtual void OnUpdate(DemoCtx &cx) {}   // per-frame update (cx.dt delta seconds, cx.t elapsed seconds)
    virtual void OnDraw(DemoCtx &cx) = 0;   // render
    virtual void OnShutdown(DemoCtx &cx) {} // cleanup
protected:
    DemoVariableSet *variableSet = nullptr; // still exposed for convenience
public:
    void SetVariables(DemoVariableSet *set) { variableSet = set; }
    DemoVariableSet *Variables() const { return variableSet; }
};

struct DemoRegistration
{
    std::string name;
    std::function<BaseDemo *()> factory;
};

// Per-frame context passed to every demo callback with very short member names for rapid typing.
//  vs : variable set
//  r  : rng (std::mt19937)
//  t  : elapsed time (seconds since demo activation)
//  dt : delta time of current frame (seconds)
struct DemoCtx
{
    DemoVariableSet &vs;
    std::mt19937 &r;
    float t;
    float dt;
    unsigned int seed; // deterministic seed (0 if random-origin)
};

class DemoApp
{
public:
    DemoApp();
    ~DemoApp();

    void Register(const DemoRegistration &reg);
    void Run();

private:
    std::vector<DemoRegistration> demos;
    BaseDemo *active = nullptr;
    DemoVariableSet vars;
    bool inMenu = true;
    bool pauseTweens = false;
    bool showOverlay = true; // toggle with key (e.g., 'O')
    std::mt19937 rng{std::random_device{}()};
    float elapsed = 0.0f;               // seconds
    int menuSelected = 0;               // current highlighted menu item
    unsigned int currentSeed = 0;       // 0 => random on activation
    unsigned int actualCurrentSeed = 0; // 0 => random on activation
    bool enteringSeed = false;
    std::string seedInput;

    void ShowMenu();
    void UpdateRNG();
    void ActivateDemo(int index);
    void DeactivateDemo();
    void DrawOverlay();
};

// Fluent builder for defining demo variables with named-style chaining.
// Usage example (inside OnConfigureVariables):
//   vars.Add(VB::Create("SIZE").Initial(4).Range(2,8).Integer().Generator([](){ ...; }));
struct VB
{
    DemoVariable v;
    static VB Create(const std::string &name)
    {
        VB b;
        b.v.name = name;
        return b;
    }
    VB &Initial(float value)
    {
        v.value = v.target = value;
        v.hasInitial = true;
        return *this;
    }
    VB &BoolInitial(bool b)
    {
        v.isBool = true;
        v.value = v.target = (b ? 1.0f : 0.0f);
        v.hasInitial = true;
        return *this;
    }
    VB &Range(float mn, float mx)
    {
        v.min = mn;
        v.max = mx;
        return *this;
    }
    VB &TransitionFrames(int frames)
    {
        v.transitionFrames = frames;
        return *this;
    }
    VB &Locked(bool locked = true)
    {
        v.locked = locked;
        return *this;
    }
    VB &Integer(bool integer = true)
    {
        v.integer = integer;
        return *this;
    }
    VB &Bool(bool bFlag = true)
    {
        v.isBool = bFlag;
        if (bFlag)
        {
            v.min = 0.0f;
            v.max = 1.0f;
        }
        return *this;
    }
    VB &Floored(bool floored = true)
    {
        v.floored = floored;
        return *this;
    }
    VB &Ceiled(bool ceiled = true)
    {
        v.ceiled = ceiled;
        return *this;
    }
    VB &Generator(std::function<float()> gen)
    {
        v.generator = std::move(gen);
        return *this;
    }
    VB &Easing(std::function<float(float, float, float)> easeFn)
    {
        v.easing = std::move(easeFn);
        return *this;
    }
    DemoVariable Build() const { return v; }
};

// Overload implementation (must appear after builder definition)
inline DemoVariable &DemoVariableSet::Add(const VB &builder)
{
    return Add(builder.Build());
}
