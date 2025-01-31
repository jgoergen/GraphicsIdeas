var EasingFunctions = {
    Sin2InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 2))) + _startValue);
    },

    Sin5InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 5))) + _startValue);
    },

    Sin10InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 10))) + _startValue);
    },

    Cos2InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 2))) + _startValue);
    },

    Cos5InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 5))) + _startValue);
    },

    Cos10InterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 10))) + _startValue);
    },

    LinearInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return ((_endValue - _startValue) * (_frame / _maxFrames)) + _startValue;
    },

    EaseInQuadInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame + _startValue;
    },

    EaseInQuadInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
        return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame + _startValue;
    },

    EaseOutQuadInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutQuad: function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; 
        return -(_endValue - _startValue) * (_frame /= _maxFrames) * (_frame - 2) + _startValue;
    },

    EaseInOutQuadInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInOutQuad: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; },
        if ((_frame /= _maxFrames / 2) < 1)
            return (_endValue - _startValue) / 2 * _frame * _frame + _startValue;
        return -(_endValue - _startValue) / 2 * ((--_frame) * (_frame - 2) - 1) + _startValue;
    },

    EaseInCubicInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInCubic: function (x, t, b, c, d) { return c*(t/=d)*t*t + b; },
        return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame + _startValue;
    },

    EaseOutCubicInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutCubic: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t + 1) + b; },
        return (_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame + 1) + _startValue;
    },

    EaseInOutCubicInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInOutCubic: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t + b; return c/2*((t-=2)*t*t + 2) + b; },
        if ((_frame /= _maxFrames / 2) < 1)
            return (_endValue - _startValue) / 2 * _frame * _frame * _frame + _startValue;
        return (_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame + 2) + _startValue;
    },

    EaseInQuartInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInQuart: function (x, t, b, c, d) { return c*(t/=d)*t*t*t + b; },
        return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame * _frame + _startValue;
    },

    EaseOutQuartInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutQuart: function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; },
        return -(_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame * _frame - 1) + _startValue;
    },

    EaseInOutQuartInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInOutQuart: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b; },
        if ((_frame /= _maxFrames / 2) < 1)
            return (_endValue - _startValue) / 2 * _frame * _frame * _frame * _frame + _startValue;
        return -(_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame * _frame - 2) + _startValue;
    },

    EaseInQuintInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInQuint: function (x, t, b, c, d) { return c*(t/=d)*t*t*t*t + b; },
        return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame * _frame * _frame + _startValue;
    },

    EaseOutQuintInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutQuint: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t*t*t + 1) + b; },
        return (_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame * _frame * _frame + 1) + _startValue;
    },

    EaseInOutQuintInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInOutQuint: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b; return c/2*((t-=2)*t*t*t*t + 2) + b; },
        if ((_frame /= _maxFrames / 2) < 1)
            return (_endValue - _startValue) / 2 * _frame * _frame * _frame * _frame * _frame + _startValue;
        return (_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame * _frame * _frame + 2) + _startValue;
    },

    EaseInSineInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInSine: function (x, t, b, c, d) { return -c * Math.cos(t/d * (Math.PI/2)) + c + b; },
        return -(_endValue - _startValue) * Math.cos(_frame / _maxFrames * (Math.PI / 2)) + (_endValue - _startValue) + _startValue;
    },

    EaseOutSineInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutSine: function (x, t, b, c, d) { return c * Math.sin(t/d * (Math.PI/2)) + b; },
        return (_endValue - _startValue) * Math.sin(_frame / _maxFrames * (Math.PI / 2)) + _startValue;
    },

    EaseInOutSineInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInOutSine: function (x, t, b, c, d) { return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b; },
        return -(_endValue - _startValue) / 2 * (Math.cos(Math.PI * _frame / _maxFrames) - 1) + _startValue;
    },

    EaseInExpoInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInExpo: function (x, t, b, c, d) { return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b; },
        return (_frame == 0) ?
            _startValue :
            (_endValue - _startValue) * Math.pow(2, 10 * (_frame / _maxFrames - 1)) + _startValue;
    },

    EaseOutExpoInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutExpo: function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; },
        return (_frame == _maxFrames) ?
            _startValue + (_endValue - _startValue) :
            (_endValue - _startValue) * (-Math.pow(2, -10 * _frame / _maxFrames) + 1) + _startValue;
    },

    EaseInOutExpoInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        if (_frame == 0)
            return _startValue;
        if (_frame == _maxFrames)
            return _startValue + (_endValue - _startValue);
        if ((_frame /= _maxFrames / 2) < 1)
            return (_endValue - _startValue) / 2 * Math.pow(2, 10 * (_frame - 1)) + _startValue;
        return (_endValue - _startValue) / 2 * (-Math.pow(2, -10 * --_frame) + 2) + _startValue;
    },

    EaseInCircInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeInCirc: function (x, t, b, c, d) { return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b; },
        return -(_endValue - _startValue) * (Math.sqrt(1 - (_frame /= _maxFrames) * _frame) - 1) + _startValue;
    },

    EaseOutCircInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        // easeOutCirc: function (x, t, b, c, d) { return c * Math.sqrt(1 - (t=t/d-1)*t) + b; },
        return (_endValue - _startValue) * Math.sqrt(1 - (_frame = _frame / _maxFrames - 1) * _frame) + _startValue;
    },

    EaseInOutCircInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        if ((_frame /= _maxFrames / 2) < 1)
            return -(_endValue - _startValue) / 2 * (Math.sqrt(1 - _frame * _frame) - 1) + _startValue;
        return (_endValue - _startValue) / 2 * (Math.sqrt(1 - (_frame -= 2) * _frame) + 1) + _startValue;
    },

    EaseInElasticInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        var s = 1.70158;
        var p = 0;
        var a = (_endValue - _startValue);

        if (_frame == 0)
            return _startValue;

        if ((_frame /= _maxFrames) == 1)
            return _startValue + (_endValue - _startValue);

        if (!p)
            p = _maxFrames * .3;

        if (a < Math.abs((_endValue - _startValue))) {

            a = (_endValue - _startValue);
            var s = p / 4;
        } else {

            var s = p / (2 * Math.PI) * Math.asin((_endValue - _startValue) / a);
        }

        return -(a * Math.pow(2, 10 * (_frame -= 1)) * Math.sin((_frame * _maxFrames - s) * (2 * Math.PI) / p)) + _startValue;
    },

    EaseOutElasticInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        var s = 1.70158;
        var p = 0;
        var a = (_endValue - _startValue);

        if (_frame == 0)
            return _startValue;

        if ((_frame /= _maxFrames) == 1)
            return _startValue + (_endValue - _startValue);

        if (!p)
            p = _maxFrames * .3;

        if (a < Math.abs((_endValue - _startValue))) {

            a = (_endValue - _startValue);
            var s = p / 4;
        } else {

            var s = p / (2 * Math.PI) * Math.asin((_endValue - _startValue) / a);
        }

        return a * Math.pow(2, -10 * _frame) * Math.sin((_frame * _maxFrames - s) * (2 * Math.PI) / p) + (_endValue - _startValue) + _startValue;
    },

    EaseInOutElasticInterpolationFunc: function (_frame, _maxFrames, _startValue, _endValue) {

        // t: current time, b: begInnIng value, c: change In value, d: duration
        var s = 1.70158;
        var p = 0;
        var a = (_endValue - _startValue);

        if (_frame == 0)
            return _startValue;

        if ((_frame /= _maxFrames / 2) == 2)
            return _startValue + (_endValue - _startValue);

        if (!p)
            p = _maxFrames * (.3 * 1.5);

        if (a < Math.abs((_endValue - _startValue))) {

            a = (_endValue - _startValue);
            var s = p / 4;
        } else {

            var s = p / (2 * Math.PI) * Math.asin((_endValue - _startValue) / a);
        }

        if (_frame < 1)
            return -.5 * (a * Math.pow(2, 10 * (_frame -= 1)) * Math.sin((_frame * _maxFrames - s) * (2 * Math.PI) / p)) + _startValue;

        return a * Math.pow(2, -10 * (_frame -= 1)) * Math.sin((_frame * _maxFrames - s) * (2 * Math.PI) / p) * .5 + (_endValue - _startValue) + _startValue;
    }
}