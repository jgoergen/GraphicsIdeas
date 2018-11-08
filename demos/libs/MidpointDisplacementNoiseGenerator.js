let MidpointDisplacementNoiseGenerator = function(mapDimension, roughness, unitSize, blockSize) {

    // initialize
    this.map = [];
    this.mapDimension = mapDimension || 256;
    this.roughness = roughness || 5;
    this.unitSize = unitSize || 1;   
    this.blockSize = blockSize || 2;
};

MidpointDisplacementNoiseGenerator.prototype.generate = function () {

    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = this.mapDimension * this.blockSize;
    canvas.height = this.mapDimension * this.blockSize;

    this.generateNoise();

    var canvasData = ctx.getImageData(0, 0, this.mapDimension, this.mapDimension),
        x = 0,
        y = 0,
        r = 0,
        g = 0,
        b = 0,
        gamma = 500,
        colorFill = 0;

    for (x = 0; x <= this.mapDimension; x += this.unitSize) {

        for (y = 0; y <= this.mapDimension; y += this.unitSize) {

            colorFill = Math.floor(this.map[x][y] * 250);
            ctx.fillStyle = "rgb(" + colorFill + "," +  colorFill + "," + colorFill + ")";
            ctx.fillRect (x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
    }

    return canvas;
};

MidpointDisplacementNoiseGenerator.prototype.generateNoise = function () {

    // gen map array
    for(var x = 0; x < this.mapDimension + 1; x++)
        for(var y = 0; y < this.mapDimension + 1; y++)
        this.map[x] = [];

    // presetup map data
    var x = this.mapDimension,
        y = this.mapDimension,
        tr,
        tl,
        t,
        br,
        bl,
        b,
        r,
        l,
        center;

    // top left
    this.map[0][0] = Math.random(1.0);
    tl = this.map[0][0];

    // bottom left
    this.map[0][this.mapDimension] = Math.random(1.0);
    bl = this.map[0][this.mapDimension];

    // top right
    this.map[this.mapDimension][0] = Math.random(1.0);
    tr = this.map[this.mapDimension][0];

    // bottom right
    this.map[this.mapDimension][this.mapDimension] = Math.random(1.0);
    br = this.map[this.mapDimension][this.mapDimension]

    // Center
    this.map[this.mapDimension / 2][this.mapDimension / 2] = this.map[0][0] + this.map[0][this.mapDimension] + this.map[this.mapDimension][0] + this.map[this.mapDimension][this.mapDimension] / 4;
    this.map[this.mapDimension / 2][this.mapDimension / 2] = this.normalize(this.map[this.mapDimension / 2][this.mapDimension / 2]);
    center = this.map[this.mapDimension / 2][this.mapDimension / 2];

    this.map[this.mapDimension / 2][this.mapDimension] = center / 3;
    this.map[this.mapDimension / 2][0] = center / 3;
    this.map[this.mapDimension][this.mapDimension / 2] = center / 3;
    this.map[0][this.mapDimension / 2] = center / 3;

    // Call displacment 
    this.midpointDisplacment(this.mapDimension);
};

// Workhorse of the terrain generation.
MidpointDisplacementNoiseGenerator.prototype.midpointDisplacment = function (dimension) {

    var newDimension = dimension / 2,
        top,
        topRight,
        topLeft,
        bottom,
        bottomLeft,
        bottomRight,
        right,
        left,
        center,
        i,
        j;

    if (newDimension > this.unitSize) {

        for (i = newDimension; i <= this.mapDimension; i += newDimension){

            for(j = newDimension; j <= this.mapDimension; j += newDimension){

                x = i - (newDimension / 2);
                y = j - (newDimension / 2);

                topLeft = this.map[i - newDimension][j - newDimension]; 
                topRight = this.map[i][j - newDimension];
                bottomLeft = this.map[i - newDimension][j];
                bottomRight = this.map[i][j];

                // Center
                this.map[x][y] = (topLeft + topRight + bottomLeft + bottomRight) / 4 + this.displace(dimension);
                this.map[x][y] = this.normalize(this.map[x][y]);
                center = this.map[x][y];    

                // Top
                if(j - (newDimension * 2) + (newDimension / 2) > 0)
                    this.map[x][j - newDimension] = (topLeft + topRight + center + this.map[x][j - dimension + (newDimension / 2)]) / 4 + this.displace(dimension);
                else
                    this.map[x][j - newDimension] = (topLeft + topRight + center) / 3 + this.displace(dimension);

                    this.map[x][j - newDimension] = this.normalize(this.map[x][j - newDimension]);

                // Bottom
                if (j + (newDimension / 2) < this.mapDimension)
                    this.map[x][j] = (bottomLeft + bottomRight + center + this.map[x][j + (newDimension / 2)]) / 4 + this.displace(dimension);
                else
                    this.map[x][j] = (bottomLeft + bottomRight + center) / 3 + this.displace(dimension);

                this.map[x][j] = this.normalize(this.map[x][j]);

                //Right
                if (i + (newDimension / 2) < this.mapDimension)
                    this.map[i][y] = (topRight + bottomRight + center + this.map[i + (newDimension / 2)][y]) / 4 + this.displace(dimension);
                else
                    this.map[i][y] = (topRight + bottomRight + center) / 3 + this.displace(dimension);

                this.map[i][y] = this.normalize(this.map[i][y]);

                // Left
                if (i - (newDimension * 2) + (newDimension / 2) > 0)
                    this.map[i - newDimension][y] = (topLeft + bottomLeft + center + this.map[i - dimension + (newDimension / 2)][y]) / 4 + this.displace(dimension);
                else
                    this.map[i - newDimension][y] = (topLeft + bottomLeft + center) / 3 + this.displace(dimension);                    

                this.map[i - newDimension][y] = this.normalize(this.map[i - newDimension][y]);
            }
        }

        this.midpointDisplacment(newDimension);
    }
};

// Normalize the value to make sure its within bounds
MidpointDisplacementNoiseGenerator.prototype.normalize = function (value) {

    if( value > 1)
        value = 1;
    else if(value < 0)
        value = 0;

    return value;
};

// Random function to offset the center
MidpointDisplacementNoiseGenerator.prototype.displace = function (num) {

    var max = num / (this.mapDimension + this.mapDimension) * this.roughness;
    return (Math.random(1.0) - 0.5) * max;
};