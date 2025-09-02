#pragma once
#include "BaseDemo.hpp"
#include <vector>

class CellularAutomataDemo : public BaseDemo
{
public:
    std::string Name() const override { return "Cellular Automata"; }
    void OnConfigure(DemoCtx &cx) override;
    void OnInit(DemoCtx &cx) override;
    void OnUpdate(DemoCtx &cx) override;
    void OnDraw(DemoCtx &cx) override;
    void OnShutdown(DemoCtx &cx) override;

private:
    int cellsX = 0;
    int cellsY = 0;
    int phase = 0; // double buffering on cell state

    struct Cell
    {
        unsigned char c;
        unsigned char n;
        unsigned char u;
    };
    std::vector<Cell> grid; // size cellsX * cellsY

    inline int Idx(int x, int y) const { return y * cellsX + x; }
    int NeighborCount(int x, int y) const;
    void Step();
    // Cached variable refs for quick access (populated during OnInit)
    struct Vars
    {
        VarRef cellSize, cellFade, cellDensity;
    } v;
};
