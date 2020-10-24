// all from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
var ColorFunctions = {
    HSVtoRGB: function (h, s, v) {
        // 0-1, 0-1, 0-1 -> 0-255, 0-255, 0-255
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },
    RGBtoHSV: function (r, g, b) {
        // 0-255, 0-255, 0-255 -> 0-1, 0-1, 0-1
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    },
    HSVtoHSL: function (h, s, v) {
        // all 0-1
        var _h = h,
            _s = s * v,
            _l = (2 - s) * v;
        _s /= (_l <= 1) ? _l : 2 - _l;
        _l /= 2;

        return {
            h: _h,
            s: _s,
            l: _l
        };
    },
    HSLtoHSV: function (h, s, l) {
        // all 0-1
        var _h = h,
            _s,
            _v;

        l *= 2;
        s *= (l <= 1) ? l : 2 - l;
        _v = (l + s) / 2;
        _s = (2 * s) / (l + s);

        return {
            h: _h,
            s: _s,
            v: _v
        };
    }
}