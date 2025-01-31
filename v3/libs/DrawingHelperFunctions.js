var DrawingHelperFunctions = {

    Circle: function (_ctx, _x, _y, _radius, _fillColor, _borderThickness, _borderColor) {

        if (_fillColor)
            _ctx.fillStyle = _fillColor;

        if (_borderThickness)
            _ctx.lineWidth = _borderThickness;

        if (_borderColor)
            _ctx.strokeStyle = _borderColor;

        _ctx.beginPath();
        _ctx.arc(_x, _y, _radius, 0, 2 * Math.PI, false);
        _ctx.fill();

        if (_borderThickness)
            _ctx.stroke();
    },

    SunburstPixelPattern: function (ctx, splits, center, x, y, pixelSize) {

        for (var i = 0; i < splits; i++) {

            var rads = (Math.PI / 180) * ((360 / splits) * i);
            var cos = Math.cos(rads);
            var sin = Math.sin(rads);
            ctx.fillRect((cos * (x - center)) + (sin * (y - center)) + center, (cos * (y - center)) - (sin * (x - center)) + center, pixelSize, pixelSize);
            /*
                        ctx.beginPath();
                        ctx.moveTo((cos * (oldX - center)) + (sin * (oldY - center)) + center, (cos * (oldY - center)) - (sin * (oldX - center)) + center);
                        ctx.lineTo((cos * (x - center)) + (sin * (y - center)) + center, (cos * (y - center)) - (sin * (x - center)) + center);
                        ctx.stroke();
                        */
        }
    },

    interpolatePoints: function (p1, p2, amount) {
        return {
            x: p1.x + ((p2.x - p1.x) * amount),
            y: p1.y + ((p2.y - p1.y) * amount)
        };
    },

    interpolateMultiplePoints: function (amount, ...points) {
        var interpolationSegmentLengths = (1 / points.length) + 0.01;
        var pSeg1 = Math.floor(amount / interpolationSegmentLengths);
        var pSeg2 = pSeg1 === (points.length - 1) ? 0 : pSeg1 + 1;

        while (amount > interpolationSegmentLengths) {
            amount -= interpolationSegmentLengths;
        }

        var segAmount = amount / interpolationSegmentLengths;

        return {
            x: points[pSeg1].x + ((points[pSeg2].x - points[pSeg1].x) * segAmount),
            y: points[pSeg1].y + ((points[pSeg2].y - points[pSeg1].y) * segAmount)
        };
    },

    SunburstLinePattern: function (ctx, splits, center, x, y, x2, y2, pixelSize) {

        for (var i = 0; i < splits; i++) {

            var rads = (Math.PI / 180) * ((360 / splits) * i);
            var cos = Math.cos(rads);
            var sin = Math.sin(rads);

            ctx.beginPath();
            ctx.moveTo((cos * (x - center)) + (sin * (y - center)) + center, (cos * (y - center)) - (sin * (x - center)) + center);
            ctx.lineTo((cos * (x2 - center)) + (sin * (y2 - center)) + center, (cos * (y2 - center)) - (sin * (x2 - center)) + center);
            ctx.stroke();
        }
    },

    MirrorPixel: function (ctx, x, y, canvasWidth, canvasHeight, pixelSize, mirrorX, mirrorY) {

        ctx.fillRect(
            !mirrorX ?
                (x * pixelSize) + pixelSize :
                canvasWidth - (x * pixelSize),
            !mirrorY ?
                (y * pixelSize) + pixelSize :
                canvasHeight - (y * pixelSize),
            pixelSize,
            pixelSize);
    },

    BreakLineIntoSteps: function (x1, y1, x2, y2, steps) {
        var intervalX = (x2 - x1) / steps;
        var intervalY = (y2 - y1) / steps;
        var positions = [];

        // spawn intermediary particles to form a chain
        for (var step = 0; step < steps; step++) {

            var stepPos = undefined;

            if (step == steps)
                stepPos = [x2, y2];
            else
                stepPos = [x1 + (step * intervalX), y1 + (step * intervalY)];

            positions.push(stepPos);
        }

        return positions;
    },

    GetImageDataFromURL: function (url, callback, newWidth = null, newHeight = null) {

        var img = document.createElement("img");
        img.onload = function () { callback(DrawingHelperFunctions.GetImageDataFromIMG(this, newWidth, newHeight)); }
        img.crossOrigin = "Anonymous";
        img.src = url;
    },

    GetImageDataFromIMG: function (_img, _newWidth, _newHeight) {

        var canvas = document.createElement('canvas');
        canvas.width = _newWidth || _img.width;
        canvas.height = _newHeight || _img.height;

        var context = canvas.getContext('2d');
        context.drawImage(_img, 0, 0, _img.width, _img.height, 0, 0, canvas.width, canvas.height);

        return context.getImageData(0, 0, canvas.width, canvas.height);
    },

    GetIMGFromImageData: function (_imageData) {

        var canvas = document.createElement('canvas');
        canvas.width = _imageData.width;
        canvas.height = _imageData.height;

        var context = canvas.getContext('2d');
        context.putImageData(_imageData, 0, 0);

        var img = new Image();
        img.src = canvas.toDataURL();

        return img;
    },

    GetPixelDataFromImageData: function (imageData, x, y) {

        var index = y * (imageData.width * 4) + x * 4;

        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]];
    },

    ReplaceImageDataPixel: function (imageData, x, y, r, g, b, a) {

        var index = y * (imageData.width * 4) + x * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    },

    ModifyImageDataPixel: function (imageData, x, y, r, g, b, a) {

        var index = y * (imageData.width * 4) + x * 4;
        imageData.data[index] += r;
        imageData.data[index + 1] += g;
        imageData.data[index + 2] += b;
        imageData.data[index + 3] += a;
    },

    CopyImageData: function (ctx, src) {
        var dst = ctx.createImageData(src.width, src.height);
        dst.data.set(src.data);
        return dst;
    },

    GreyScaleImageData: function (imageData) {

        var pixelData = undefined;
        var average = 0;

        for (var x = 1; x < imageData.width - 1; x++) {

            for (var y = 1; y < imageData.height - 1; y++) {

                pixelData =
                    DrawingHelperFunctions.GetPixelDataFromImageData(
                        imageData,
                        x,
                        y);

                average = (pixelData[0] + pixelData[1] + pixelData[2]) / 3;

                DrawingHelperFunctions.ReplaceImageDataPixel(
                    imageData,
                    x,
                    y,
                    average,
                    average,
                    average,
                    pixelData[3]);
            }
        }

        return imageData;
    },

    ReduceImageDataColors: function (imageData, reductionFactor, useDithering) {

        const { width, height } = imageData;
        const dhFuncs = DrawingHelperFunctions;

        for (let x = 1; x < width - 1; x++) {

            for (let y = 1; y < height - 1; y++) {

                const pixelData = dhFuncs.GetPixelDataFromImageData(imageData, x, y);
                const reducedPixelData = dhFuncs.ReduceColor(pixelData[0], pixelData[1], pixelData[2], reductionFactor);

                dhFuncs.ReplaceImageDataPixel(
                    imageData,
                    x,
                    y,
                    reducedPixelData[0],
                    reducedPixelData[1],
                    reducedPixelData[2],
                    pixelData[3]
                );

                if (useDithering) {

                    // floyd-steinberg dithering
                    const [rDiff, gDiff, bDiff] = [reducedPixelData[3], reducedPixelData[4], reducedPixelData[5]];
                    const ditheringFactors = [
                        { dx: 1, dy: 0, factor: 7 / 16 },
                        { dx: -1, dy: 1, factor: 3 / 16 },
                        { dx: 0, dy: 1, factor: 5 / 16 },
                        { dx: 1, dy: 1, factor: 1 / 16 },
                    ];

                    for (const { dx, dy, factor } of ditheringFactors) {
                        dhFuncs.ModifyImageDataPixel(
                            imageData,
                            x + dx,
                            y + dy,
                            rDiff * factor,
                            gDiff * factor,
                            bDiff * factor,
                            0
                        );
                    }
                }
            }
        }

        return imageData;
    },

    ReduceColor: function (r, g, b, factor) {

        var newR = Math.round(factor * r / 255) * (255 / factor);
        var newG = Math.round(factor * g / 255) * (255 / factor);
        var newB = Math.round(factor * b / 255) * (255 / factor);

        return [
            newR,
            newG,
            newB,
            r - newR,
            g - newG,
            b - newB];
    },

    MakeColorTransparent: function (_image, _color) {

        return DrawingHelperFunctions.ReplaceImageColor(_image, _color, { r: 0, g: 0, b: 0 });
    },

    ReplaceImageColor: function (_image, _color, _replacementColor) {

        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = _image.width;
        tmpCanvas.height = _image.height;
        var tmpCTX = tmpCanvas.getContext('2d');

        tmpCTX.drawImage(_image, 0, 0);
        var imgData = tmpCTX.getImageData(0, 0, _image.width, _image.height);
        var pixels = imgData.data;

        for (var i = 0, len = pixels.length; i < len; i += 4) {

            var r = pixels[i],
                g = pixels[i + 1],
                b = pixels[i + 2],
                a = pixels[i + 3];

            if (r == _color.r && g == _color.g && b == _color.b) {

                if (_color.a && a == _color.a)
                    continue;

                pixels[i] = _replacementColor.r;
                pixels[i + 1] = _replacementColor.g;
                pixels[i + 2] = _replacementColor.b;
                pixels[i + 3] = _replacementColor.a;
            }
        }

        tmpCTX.putImageData(imgData, 0, 0);
        return tmpCanvas;
    },

    TintImage: function (_image, _color, _amount) {

        // create offscreen buffer, 
        buffer = document.createElement('canvas');
        buffer.width = _image.width;
        buffer.height = _image.height;

        buffer2 = document.createElement('canvas');
        buffer2.width = _image.width;
        buffer2.height = _image.height;

        bx = buffer.getContext('2d');
        bx2 = buffer2.getContext('2d');

        bx.fillStyle = _color;
        bx.fillRect(0, 0, buffer.width, buffer.height);

        bx.globalCompositeOperation = "destination-atop";
        bx.drawImage(_image, 0, 0);

        bx2.drawImage(_image, 0, 0);
        bx2.globalAlpha = _amount;
        bx2.drawImage(buffer, 0, 0);

        return buffer2.toDataURL();
    },

    Brighten: function (pixels, adjustment) {

        var d = pixels.data;
        adjustment = Math.floor(adjustment);

        for (var i = 0; i < d.length; i += 4) {

            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }

        return pixels;
    },

    SuperFastBlur: function (imageData, width, height, radius, iterations) {

        // pulled from: http://www.quasimondo.com/BoxBlurForCanvas/FastBlurDemo.html

        if (isNaN(iterations))
            iterations = 1;

        if (iterations > 3)
            iterations = 3;

        if (iterations < 1)
            iterations = 1;

        radius = Math.floor(radius);

        var pixels = imageData.data;
        var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw, idx, pa;
        var wm = width - 1;
        var hm = height - 1;
        var wh = width * height;
        var rad1 = radius + 1;

        var mul_sum = DrawingHelperFunctions.sfb_mul_table[radius];
        var shg_sum = DrawingHelperFunctions.sfb_shg_table[radius];

        var r = [];
        var g = [];
        var b = [];
        var a = [];

        var vmin = [];
        var vmax = [];

        while (iterations-- > 0) {

            yw = yi = 0;

            for (y = 0; y < height; y++) {

                rsum = pixels[yw] * rad1;
                gsum = pixels[yw + 1] * rad1;
                bsum = pixels[yw + 2] * rad1;
                asum = pixels[yw + 3] * rad1;


                for (i = 1; i <= radius; i++) {

                    p = yw + (((i > wm ? wm : i)) << 2);
                    rsum += pixels[p++];
                    gsum += pixels[p++];
                    bsum += pixels[p++];
                    asum += pixels[p]
                }

                for (x = 0; x < width; x++) {

                    r[yi] = rsum;
                    g[yi] = gsum;
                    b[yi] = bsum;
                    a[yi] = asum;

                    if (y == 0) {

                        vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
                        vmax[x] = ((p = x - radius) > 0 ? p << 2 : 0);
                    }

                    p1 = yw + vmin[x];
                    p2 = yw + vmax[x];

                    rsum += pixels[p1++] - pixels[p2++];
                    gsum += pixels[p1++] - pixels[p2++];
                    bsum += pixels[p1++] - pixels[p2++];
                    asum += pixels[p1] - pixels[p2];

                    yi++;
                }

                yw += (width << 2);
            }

            for (x = 0; x < width; x++) {

                yp = x;
                rsum = r[yp] * rad1;
                gsum = g[yp] * rad1;
                bsum = b[yp] * rad1;
                asum = a[yp] * rad1;

                for (i = 1; i <= radius; i++) {

                    yp += (i > hm ? 0 : width);
                    rsum += r[yp];
                    gsum += g[yp];
                    bsum += b[yp];
                    asum += a[yp];
                }

                yi = x << 2;

                for (y = 0; y < height; y++) {

                    pixels[yi + 3] = pa = (asum * mul_sum) >>> shg_sum;

                    if (pa > 0) {

                        pa = 255 / pa;
                        pixels[yi] = ((rsum * mul_sum) >>> shg_sum) * pa;
                        pixels[yi + 1] = ((gsum * mul_sum) >>> shg_sum) * pa;
                        pixels[yi + 2] = ((bsum * mul_sum) >>> shg_sum) * pa;

                    } else {

                        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                    }

                    if (x == 0) {

                        vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
                        vmax[y] = ((p = y - radius) > 0 ? p * width : 0);
                    }

                    p1 = x + vmin[y];
                    p2 = x + vmax[y];

                    rsum += r[p1] - r[p2];
                    gsum += g[p1] - g[p2];
                    bsum += b[p1] - b[p2];
                    asum += a[p1] - a[p2];

                    yi += width << 2;
                }
            }
        }

        return imageData;
    },

    sfb_mul_table: [
        1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238,
        219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127,
        243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231,
        224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129,
        251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163,
        5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111,
        219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163,
        161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250,
        247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199,
        197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161,
        5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66,
        131, 65, 129, 1],

    sfb_shg_table: [
        0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19,
        18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18,
        21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21,
        21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22,
        23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21,
        24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24,
        24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25,
        24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25,
        25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25,
        24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18],

    sbb_mul_table: [
        512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
        454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
        482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
        437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
        497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
        320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
        446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
        329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
        505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
        399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
        324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
        268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
        451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
        385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
        332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
        289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259],

    sbb_shg_table: [
        9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24],

    BlurStack: function () {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    },

    StackBoxBlur: function (imageData, width, height, radius, iterations) {
        if (isNaN(iterations)) iterations = 1;
        if (iterations > 3) iterations = 3;
        if (iterations < 1) iterations = 1;

        radius = Math.floor(radius);

        var pixels = imageData.data;

        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
            r_out_sum, g_out_sum, b_out_sum, a_out_sum,
            r_in_sum, g_in_sum, b_in_sum, a_in_sum,
            pr, pg, pb, pa, rbs;

        var div = radius + radius + 1;
        var w4 = width << 2;
        var widthMinus1 = width - 1;
        var heightMinus1 = height - 1;
        var radiusPlus1 = radius + 1;

        var stackStart = new DrawingHelperFunctions.BlurStack();

        var stack = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new DrawingHelperFunctions.BlurStack();
            if (i == radiusPlus1) var stackEnd = stack;
        }
        stack.next = stackStart;
        var stackIn = null;

        var mul_sum = DrawingHelperFunctions.sbb_mul_table[radius];
        var shg_sum = DrawingHelperFunctions.sbb_shg_table[radius];
        while (iterations-- > 0) {
            yw = yi = 0;
            for (y = height; --y > -1;) {
                r_sum = radiusPlus1 * (pr = pixels[yi]);
                g_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                b_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                a_sum = radiusPlus1 * (pa = pixels[yi + 3]);

                stack = stackStart;

                for (i = radiusPlus1; --i > -1;) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack.a = pa;
                    stack = stack.next;
                }

                for (i = 1; i < radiusPlus1; i++) {
                    p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                    r_sum += (stack.r = pixels[p]);
                    g_sum += (stack.g = pixels[p + 1]);
                    b_sum += (stack.b = pixels[p + 2]);
                    a_sum += (stack.a = pixels[p + 3]);

                    stack = stack.next;
                }

                stackIn = stackStart;
                for (x = 0; x < width; x++) {
                    pixels[yi++] = (r_sum * mul_sum) >>> shg_sum;
                    pixels[yi++] = (g_sum * mul_sum) >>> shg_sum;
                    pixels[yi++] = (b_sum * mul_sum) >>> shg_sum;
                    pixels[yi++] = (a_sum * mul_sum) >>> shg_sum;

                    p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

                    r_sum -= stackIn.r - (stackIn.r = pixels[p]);
                    g_sum -= stackIn.g - (stackIn.g = pixels[p + 1]);
                    b_sum -= stackIn.b - (stackIn.b = pixels[p + 2]);
                    a_sum -= stackIn.a - (stackIn.a = pixels[p + 3]);

                    stackIn = stackIn.next;

                }
                yw += width;
            }


            for (x = 0; x < width; x++) {
                yi = x << 2;

                r_sum = radiusPlus1 * (pr = pixels[yi]);
                g_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                b_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                a_sum = radiusPlus1 * (pa = pixels[yi + 3]);

                stack = stackStart;

                for (i = 0; i < radiusPlus1; i++) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack.a = pa;
                    stack = stack.next;
                }

                yp = width;

                for (i = 1; i <= radius; i++) {
                    yi = (yp + x) << 2;

                    r_sum += (stack.r = pixels[yi]);
                    g_sum += (stack.g = pixels[yi + 1]);
                    b_sum += (stack.b = pixels[yi + 2]);
                    a_sum += (stack.a = pixels[yi + 3]);

                    stack = stack.next;

                    if (i < heightMinus1) {
                        yp += width;
                    }
                }

                yi = x;
                stackIn = stackStart;
                for (y = 0; y < height; y++) {
                    p = yi << 2;
                    pixels[p + 3] = pa = (a_sum * mul_sum) >>> shg_sum;
                    if (pa > 0) {
                        pa = 255 / pa;
                        pixels[p] = ((r_sum * mul_sum) >>> shg_sum) * pa;
                        pixels[p + 1] = ((g_sum * mul_sum) >>> shg_sum) * pa;
                        pixels[p + 2] = ((b_sum * mul_sum) >>> shg_sum) * pa;
                    } else {
                        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0
                    }

                    p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

                    r_sum -= stackIn.r - (stackIn.r = pixels[p]);
                    g_sum -= stackIn.g - (stackIn.g = pixels[p + 1]);
                    b_sum -= stackIn.b - (stackIn.b = pixels[p + 2]);
                    a_sum -= stackIn.a - (stackIn.a = pixels[p + 3]);

                    stackIn = stackIn.next;

                    yi += width;
                }
            }
        }

        return imageData;
    }
};