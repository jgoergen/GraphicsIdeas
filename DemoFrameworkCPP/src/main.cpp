#include "raylib.h"
#include "../include/Framework.hpp"
#include "../include/Config.hpp"
// Demos
#include "../demos/CellularAutomata.hpp"
#include "../demos/FeedbackChars.hpp"
#include "../demos/FeedbackSample.hpp"
#include "../demos/VerletParticlesDemo.hpp"
#include "../demos/KalidascopeDemos.hpp"
#include "../demos/KalidaVerletDemo.hpp"
#include "../demos/MetaBallsDemos.hpp"

int main() {
    unsigned int flags = FLAG_WINDOW_RESIZABLE;
    if (dfc::START_FULLSCREEN) flags |= FLAG_FULLSCREEN_MODE;
    if (dfc::ENABLE_MSAA4X) flags |= FLAG_MSAA_4X_HINT;
    SetConfigFlags(flags);
    InitWindow(dfc::WINDOW_WIDTH, dfc::WINDOW_HEIGHT, "DemoFrameworkCPP");
    // If fullscreen flag not honored on some platforms, ensure toggle
    if (dfc::START_FULLSCREEN && !IsWindowFullscreen()) ToggleFullscreen();
    SetTargetFPS(dfc::TARGET_FPS);

    DemoApp app;
    app.Register({"Cellular Automata", [](){ return new CellularAutomataDemo(); }});
    app.Register({"Feedback Chars", [](){ return new FeedbackCharsDemo(); }});
    app.Register({"Feedback Sample", [](){ return new FeedbackSampleDemo(); }});
    app.Register({"Verlet Particles 1", [](){ return new VerletParticlesDemo1(); }});
    app.Register({"Verlet Particles 2", [](){ return new VerletParticlesDemo2(); }});
    app.Register({"Verlet Particles 3", [](){ return new VerletParticlesDemo3(); }});
    app.Register({"Verlet Particles 4", [](){ return new VerletParticlesDemo4(); }});
    app.Register({"Verlet Particles 5", [](){ return new VerletParticlesDemo5(); }});
    app.Register({"Verlet Particles 6", [](){ return new VerletParticlesDemo6(); }});
    app.Register({"Verlet Particles 7", [](){ return new VerletParticlesDemo7(); }});
    app.Register({"Verlet Cells 1", [](){ return new VerletCellsDemo1(); }});
    app.Register({"Verlet Cells 2", [](){ return new VerletCellsDemo2(); }});
    app.Register({"Kalidascope", [](){ return new Kalidascope(); }});
    app.Register({"Kalida Verlet", [](){ return new KalidaVerletDemo(); }});
    app.Register({"Meta Balls 1", [](){ return new MetaBalls1(); }});
    app.Register({"Meta Balls 2", [](){ return new MetaBalls2(); }});
    app.Register({"Meta Balls 3", [](){ return new MetaBalls3(); }});
    app.Run();

    CloseWindow();
    return 0;
}
