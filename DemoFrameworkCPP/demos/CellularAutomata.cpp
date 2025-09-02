#include "CellularAutomata.hpp"
#include "raylib.h"
#include <random>

static bool rebuild = true;

void CellularAutomataDemo::OnConfigure(DemoCtx &cx)
{
    cx.vs.Add(VB::Create("CELL_SIZE").Range(2, 8).Integer());
    cx.vs.Add(VB::Create("CELL_FADE").Range(1.0f, 1.0f));
    cx.vs.Add(VB::Create("CELL_DENSITY").Range(1, 6).Integer());
}

void CellularAutomataDemo::OnInit(DemoCtx &cx)
{
    grid.clear();
    rebuild = true;
    // cache variable refs
    v.cellSize.p = cx.vs.Get("CELL_SIZE");
    v.cellFade.p = cx.vs.Get("CELL_FADE");
    v.cellDensity.p = cx.vs.Get("CELL_DENSITY");
}

void CellularAutomataDemo::OnShutdown(DemoCtx &cx)
{
    (void)cx; // unused

    grid.clear();
}

int CellularAutomataDemo::NeighborCount(int x, int y) const
{
    int count = 0;

    for (int dy = -1; dy <= 1; ++dy)
    {
        for (int dx = -1; dx <= 1; ++dx)
        {
            if (dx == 0 && dy == 0)
            {
                continue;
            }

            int nx = (x + dx + cellsX) % cellsX;
            int ny = (y + dy + cellsY) % cellsY;
            const Cell &c = grid[Idx(nx, ny)];
            count += (phase == 0 ? c.c : c.n);
        }
    }

    return count;
}

void CellularAutomataDemo::Step()
{
    for (int y = 0; y < cellsY; ++y)
    {
        for (int x = 0; x < cellsX; ++x)
        {
            Cell &cell = grid[Idx(x, y)];
            int state = (phase == 0 ? cell.c : cell.n);
            int neighbors = NeighborCount(x, y);
            int newState = 0;

            if (state == 1 && neighbors < 2)
            {
                newState = 0;
            }
            else if (state == 1 && (neighbors == 2 || neighbors == 3))
            {
                newState = 1;
            }
            else if (state == 1 && neighbors > 3)
            {
                newState = 0;
            }
            else if (state == 0 && neighbors == 3)
            {
                newState = 1;
            }
            else
            {
                newState = state;
            }

            if (phase == 0)
            {
                cell.n = (unsigned char)newState;
            }
            else
            {
                cell.c = (unsigned char)newState;
            }

            cell.u = (cell.c != cell.n);
        }
    }

    phase = 1 - phase;
}

void CellularAutomataDemo::OnUpdate(DemoCtx &cx)
{
    if (grid.empty() || rebuild)
    {
        rebuild = false;
        int cellSize = (int)v.cellSize.val();

        if (cellSize <= 0)
        {
            cellSize = 1;
        }

        cellsX = GetScreenWidth() / cellSize;
        cellsY = GetScreenHeight() / cellSize;
        grid.resize(cellsX * cellsY);
        int density = (int)v.cellDensity.val();
        std::uniform_int_distribution<int> dist(0, density);

        for (auto &c : grid)
        {
            c.c = c.n = (dist(cx.r) == 0 ? 0 : 1);
            c.u = 1;
        }
    }

    Step();
}

void CellularAutomataDemo::OnDraw(DemoCtx &cx)
{
    (void)cx; // currently unused aside from variable refs

    if (grid.empty())
    {
        return;
    }

    int cellSize = (int)v.cellSize.val();
    float fade = v.cellFade.val();

    DrawRectangle(
        0,
        0,
        GetScreenWidth(),
        GetScreenHeight(),
        Fade(RAYWHITE, fade));

    for (int y = 0; y < cellsY; ++y)
    {
        for (int x = 0; x < cellsX; ++x)
        {
            const Cell &cell = grid[Idx(x, y)];
            int state = (phase == 0 ? cell.c : cell.n);

            if (state == 1)
            {
                DrawRectangle(x * cellSize, y * cellSize, cellSize, cellSize, BLACK);
            }
        }
    }
}
