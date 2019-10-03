var MathHelperFunctions = {

    Quantize: function(value, interval) {

        return Math.round(value / interval) * interval;
    },

    IndexToXY: function (index, width) {

        return [
            Math.floor(index / width),
            index % width
        ];
    },

    XYToIndex: function (x, y, width) {

        return x * width + y;
    },

    GetRandom: function (_low, _high) {

        if (_low == _high)
            return _low;

        return ((Math.random() * (_high - _low)) + _low);
    },

    GetRandomInt: function (_low, _high) {

        if (_low == _high)
            return _low;

        return Math.floor((Math.random() * (_high - _low)) + _low);
    },

    WrapVal: function(val, lowerLimit, upperLimit) {

        while(val < lowerLimit || val > upperLimit) {

            if (val <= lowerLimit)
                val += (upperLimit - lowerLimit);

            if (val >= upperLimit)
                val -= (upperLimit - lowerLimit);
        }

        return val;
    },

    GetBearingBetweenPositions: function(x, y, x2, y2) {

        var dLon = MathHelperFunctions.DegToRad(y2 - y);

        var dPhi =
            Math.log(
                Math.tan(
                    MathHelperFunctions.DegToRad(x2) / 2 + Math.PI / 4) / Math.tan(degToRad(x) / 2 + Math.PI / 4));

        if (Math.abs(dLon) > Math.PI)
            dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);

        return radToBearing(Math.atan2(dLon, dPhi));
    },

    DegToRad: function(degrees) {

        return degrees * (Math.PI / 180)
    },

    RadToDeg: function(radians) {

        return radians * 180 / Math.PI;
    },

    RadToBearing: function(radians) {

        return (MathHelperFunctions.RadToDeg(radians) + 360) % 360;
    },

    RotatePoint: function(centerX, centerY, x, y, angleDegrees) {

        var radians = (Math.PI / 180) * angleDegrees,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - centerX)) + (sin * (y - centerY)) + centerX,
            ny = (cos * (y - centerY)) - (sin * (x - centerX)) + centerY;

        return [nx, ny];
    },

    Map: function(value, fromStart, fromEnd, toStart, toEnd) {

        return (value - fromStart) / (fromEnd - fromStart) * (toEnd - toStart) + toStart;
    }
};