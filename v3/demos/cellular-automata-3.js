const values = {
    CELL_SIZE: {
        Min: 0,
        Max: 5,
        TransitionFrames: 1,
        Ceiled: true
    },
    CELLS_X: (v) => ({
        Min: 0,
        Max: Math.floor(CANVAS_WIDTH / v.CELL_SIZE.Value),
        TransitionFrames: 1,
        Ceiled: true
    }),
    CELLS_Y: (v) => ({
        Min: 0,
        Max: Math.floor(CANVAS_HEIGHT / v.CELL_SIZE.Value),
        TransitionFrames: 1,
        Ceiled: true
    }),
    CELL_FADE: {
        Min: 0,
        Max: 0.5,
        TransitionFrames: 10
    },
    CELL_DENSITY: {
        Min: 0,
        Max: 2,
        TransitionFrames: 1
    }
};

/////////////////////////////////////////////////////////

var map = null;
var phase = 0;
var blackPixel = null;
var whitePixel = null;
var cellTop, cellLeft, cellRight, cellBottom, neighbors, state, newState;

const init = async p => {
    p.ctx.lineWidth = 1;
    map = generateMap(p);
    new DFEditor(p.values, "editor");
}

const update = p => {
    //ctx.clearRect(0, 0, CELLS_X * CELL_SIZE, CELLS_Y * CELL_SIZE);
    p.ctx.fillStyle = "rgba(255,255,255," + p.values.CELL_FADE.Value + ")";
    p.ctx.fillRect(0, 0, p.values.CELLS_X.Value * p.values.CELL_SIZE.Value, p.values.CELLS_Y.Value * p.values.CELL_SIZE.Value);
    p.ctx.fillStyle = "rgba(0,0,0,1)";

    // run step
    for (var y = 0; y < map.length; y++)
        for (var x = 0; x < map[0].length; x++)
            if (map[y][x].u)
                if (phase == 0)
                    map[y][x].n = checkCell(p, x, y);
                else
                    map[y][x].c = checkCell(p, x, y);

    phase = (phase == 0 ? 1 : 0);
}

const generateMap = (p) => {
    var tempMap = new Array();

    for (var y = 0; y < p.values.CELLS_Y.Value; y++) {
        var row = new Array();

        for (var x = 0; x < p.values.CELLS_X.Value; x++) {
            var state = (Math.floor(Math.random() * p.values.CELL_DENSITY.Value) == 0) ? 0 : 1;
            row.push({ c: state, n: state, u: state == 1, t: null, b: null, l: null, r: null, tl: null, tr: null, bl: null, br: null });
        }

        tempMap.push(row);
    }

    for (var y = 0; y < p.values.CELLS_Y.Value; y++) {

        var row = new Array();

        for (var x = 0; x < p.values.CELLS_X.Value; x++) {

            cellTop = y - 1;

            if (cellTop < 0) {
                cellTop = p.values.CELLS_Y.Value - 1;
            }

            cellLeft = x - 1;

            if (cellLeft < 0) {
                cellLeft = p.values.CELLS_X.Value - 1;
            }

            cellBottom = y + 1;

            if (cellBottom >= p.values.CELLS_Y.Value) {
                cellBottom = 0;
            }

            cellRight = x + 1;

            if (cellRight >= p.values.CELLS_X.Value) {
                cellRight = 0;
            }

            var cell = tempMap[y][x];
            cell.t = tempMap[cellTop][x];
            cell.b = tempMap[cellBottom][x];
            cell.r = tempMap[y][cellRight];
            cell.l = tempMap[y][cellLeft];
            cell.tl = tempMap[cellTop][cellLeft];
            cell.tr = tempMap[cellTop][cellRight];
            cell.bl = tempMap[cellBottom][cellLeft];
            cell.br = tempMap[cellBottom][cellRight];
        }
    }

    return tempMap;
}

function checkCell(p, _x, _y) {

    var cell = map[_y][_x];
    var state =
        phase == 0 ?
            cell.c :
            cell.n;

    neighbors = 0;

    if (phase == 0)
        neighbors =
            cell.tl.c +
            cell.t.c +
            cell.tr.c +
            cell.l.c +
            cell.r.c +
            cell.bl.c +
            cell.b.c +
            cell.br.c;
    else
        neighbors =
            cell.tl.n +
            cell.t.n +
            cell.tr.n +
            cell.l.n +
            cell.r.n +
            cell.bl.n +
            cell.b.n +
            cell.br.n;

    newState = 0;

    /*
    Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    Any live cell with two or three live neighbours lives on to the next generation.
    Any live cell with more than three live neighbours dies, as if by overcrowding.
    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    */

    if (state == 1 && neighbors < 2) {
        newState = 0;
    }
    else if (state == 1 && (neighbors == 2 || neighbors == 3)) {
        newState = 1;
        setupUpdates(cell);

    } else if (state == 1 && neighbors > 3) {
        newState = 0;
    }
    else if (state == 0 && neighbors == 3) {
        newState = 1;
    }
    else {
        if (Math.random() < 0.01) {
            newState = 1;
        }
    }

    if (newState != state) {
        setupUpdates(cell);
    }
    else {
        p.ctx.u = false;
    }

    if (newState == 1) {
        p.ctx.fillRect(_x * p.values.CELL_SIZE.Value, _y * p.values.CELL_SIZE.Value, p.values.CELL_SIZE.Value, p.values.CELL_SIZE.Value);
    }

    return newState;
}

function setupUpdates(cell) {

    cell.u = true;
    cell.tl.u = true;
    cell.t.u = true;
    cell.tr.u = true;
    cell.l.u = true;
    cell.r.u = true;
    cell.bl.u = true;
    cell.b.u = true;
    cell.br.u = true;
}

new DemoFramework(
    {
        fps: FPS,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        values,
        init,
        update,
        mouseDown: (p) => map = generateMap(p)
    });
