const values = {
    CELL_SIZE: {
        Min: 0,
        Max: 20,
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
        Value: 0
    },
    CELL_DENSITY: {
        Min: 1,
        Max: 11,
        TransitionFrames: 10,
        Ceiled: true
    },
    CELL_LIFE: {
        Min: 20,
        Max: 70,
        TransitionFrames: 10,
        Ceiled: true
    },
    R_CHANGE: {
        Min: 0,
        Max: 3,
        TransitionFrames: 10,
    },
    G_CHANGE: {
        Min: 0,
        Max: 3,
        TransitionFrames: 10,
    },
    B_CHANGE: {
        Min: 0,
        Max: 3,
        TransitionFrames: 1,
    }
};

/////////////////////////////////////////////////////////

var map = null;
var phase = 0;
var blackPixel = null;
var whitePixel = null;

var rLower = Math.floor(Math.random() * 100);
var rUpper = Math.floor(Math.random() * (200 - rLower)) + 50;
var rVal = rLower + Math.floor(Math.random() * rUpper);
var r = rVal;

var gLower = Math.floor(Math.random() * 100);
var gUpper = Math.floor(Math.random() * (205 - gLower)) + 50;
var gVal = rLower + Math.floor(Math.random() * gUpper);
var g = gVal;

var bLower = Math.floor(Math.random() * 100);
var bUpper = Math.floor(Math.random() * (205 - bLower)) + 50;
var bVal = rLower + Math.floor(Math.random() * bUpper);
var b = bVal;

const init = async p => {
    p.ctx.lineWidth = 1;
    map = generateMap(p);
    p.ctx.fillStyle = "rgba(" + rLower + "," + gLower + "," + bLower + ",1)";
    p.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    new DFEditor(p.values, "editor");
}

const update = p => {
    // colors
    rVal += p.values.R_CHANGE.Value;
    if (rVal > rUpper || rVal < rLower) {
        p.values.R_CHANGE.Value *= -1;
    }

    gVal += p.values.G_CHANGE.Value;
    if (gVal > gUpper || gVal < gLower) {
        p.values.G_CHANGE.Value *= -1;
    }

    bVal += p.values.B_CHANGE.Value;
    if (bVal > bUpper || bVal < bLower) {
        p.values.B_CHANGE.Value *= -1;
    }

    r = Math.floor(rVal);
    g = Math.floor(gVal);
    b = Math.floor(bVal);

    // run step
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[0].length; x++) {
            if (map[y][x].u) {
                if (phase == 0) {
                    map[y][x].n = checkCell(x, y, p);
                }
                else {
                    map[y][x].c = checkCell(x, y, p);
                }
            }
        }
    }

    phase = (phase == 0 ? 1 : 0);
}

function generateMap(p) {
    var tempMap = new Array();

    for (var y = 0; y < p.values.CELLS_Y.Value; y++) {
        var row = new Array();

        for (var x = 0; x < p.values.CELLS_X.Value; x++) {
            var state = (Math.floor(Math.random() * p.values.CELL_DENSITY.Value) == 0) ? 0 : 1;
            row.push({ c: state, n: state, a: Math.floor(Math.random() * p.values.CELL_LIFE.Value), u: state == 1, t: null, b: null, l: null, r: null, tl: null, tr: null, bl: null, br: null });
        }

        tempMap.push(row);
    }

    for (var y = 0; y < p.values.CELLS_Y.Value; y++) {
        var row = new Array();

        for (var x = 0; x < p.values.CELLS_X.Value; x++) {
            topCell = y - 1;

            if (topCell < 0) {
                topCell = p.values.CELLS_Y.Value - 1;
            }

            left = x - 1;

            if (left < 0) {
                left = p.values.CELLS_X.Value - 1;
            }

            bottom = y + 1;

            if (bottom >= p.values.CELLS_Y.Value) {
                bottom = 0;
            }

            right = x + 1;

            if (right >= p.values.CELLS_X.Value) {
                right = 0;
            }

            var cell = tempMap[y][x];
            cell.t = tempMap[topCell][x];
            cell.b = tempMap[bottom][x];
            cell.r = tempMap[y][right];
            cell.l = tempMap[y][left];
            cell.tl = tempMap[topCell][left];
            cell.tr = tempMap[topCell][right];
            cell.bl = tempMap[bottom][left];
            cell.br = tempMap[bottom][right];
        }
    }

    return tempMap;
}

var topCell, left, right, bottom, neighbors, state, newState;

function checkCell(_x, _y, p) {
    var cell = map[_y][_x];
    var state =
        phase == 0 ?
            cell.c :
            cell.n;

    neighbors = 0;

    if (phase == 0) {
        neighbors =
            cell.tl.c +
            cell.t.c +
            cell.tr.c +
            cell.l.c +
            cell.r.c +
            cell.bl.c +
            cell.b.c +
            cell.br.c;
    }
    else {
        neighbors =
            cell.tl.n +
            cell.t.n +
            cell.tr.n +
            cell.l.n +
            cell.r.n +
            cell.bl.n +
            cell.b.n +
            cell.br.n;
    }

    newState = 0;

    /*
    Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    Any live cell with two or three live neighbours lives on to the next generation.
    Any live cell with more than three live neighbours dies, as if by overcrowding.
    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    */

    if (state == 1 && neighbors < 2) {
        newState = 0;
        setupUpdates(cell);
    }
    else if (state == 1 && (neighbors == 2 || neighbors == 3)) {
        newState = 1;
    }
    else if (state == 1 && neighbors > 3) {
        newState = 0;
        setupUpdates(cell);
    }
    else if (state == 0 && neighbors == 3) {
        newState = 1;
        setupUpdates(cell);
    }
    else if (state == 0 && neighbors > 4) {
        newState = 1;
        setupUpdates(cell);
    }
    else {
        cell.u = false;
    }

    if (cell.a <= 0) {
        cell.a = Math.floor(Math.random() * p.values.CELL_LIFE.Value);
        newState = 0;
        setupUpdates(cell);
    }

    if (state == newState == 1) {
        cell.a--;
    }

    if (newState == 1) {
        p.ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",1)";
    }
    else {
        p.ctx.fillStyle = "rgba(" + rLower + "," + gLower + "," + bLower + "," + p.values.CELL_FADE.Value + ")";
    }

    p.ctx.fillRect(_x * p.values.CELL_SIZE.Value, _y * p.values.CELL_SIZE.Value, p.values.CELL_SIZE.Value, p.values.CELL_SIZE.Value);

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

function mouseDown(p, e) {

    map = generateMap(p);
}

new DemoFramework(
    {
        fps: FPS,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        values,
        init,
        update,
        mouseDown
    });