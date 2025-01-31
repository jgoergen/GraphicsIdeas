var HyperValue = function (_settings) {

    this.playbackType = null;
    this.playbackFunc = null;

    this.originalStartNumber = 0;
    this.originalEndNumber = 0;
    this.originalFrames = 0;
    this.originalInterpolation = 0;
    this.originalPlayback = 0;
    this.scale = 1;
    this.startNumber = 0;
    this.endNumber = 0;
    this.maxFrames = 0;
    this.unscaledMaxFrames = 0;
    this.interpolation = 0;
    this.interpolationFunc = 0;
    this.frame = 0;

    if (_settings != null)
        this.init(_settings);
}

HyperValue.prototype.init = function (_settings) {

    this.scale =
        _settings.scale || 1;

    this.originalStartNumber =
        _settings.startNumber;

    this.originalEndNumber =
        _settings.endNumber;

    this.originalFrames =
        _settings.frames;

    this.originalInterpolation =
        _settings.interpolation;

    this.originalPlayback =
        _settings.playbackType;

    this.unscaledMaxFrames = this.startNumber = this.endNumber = this.maxFrames = this.interpolation = this.interpolationFunc = this.playbackType = this.playbackFunc = this.frame = null;

    if (!window.hasOwnProperty("MathHelperFunctions") ||
        MathHelperFunctions == undefined)
        alert("MathHelperFunctions.js is required!");

    this.startNumber =
        parseFloat(
            this.originalStartNumber);

    this.endNumber =
        parseFloat(
            this.originalEndNumber);

    this.unscaledMaxFrames =
        this.maxFrames =
        parseFloat(
            this.originalFrames);

    if (this.originalStartNumber.toString().indexOf(",") > -1)
        if (this.originalStartNumber.toString().split(",").length == 2)
            this.startNumber = MathHelperFunctions.GetRandom(parseFloat(this.originalStartNumber.toString().split(",")[0]), parseFloat(this.originalStartNumber.toString().split(",")[1]));

    if (this.originalEndNumber.toString().indexOf(",") > -1)
        if (this.originalEndNumber.toString().split(",").length == 2)
            this.endNumber = MathHelperFunctions.GetRandom(parseFloat(this.originalEndNumber.toString().split(",")[0]), parseFloat(this.originalEndNumber.toString().split(",")[1]));

    if (this.originalFrames.toString().indexOf(",") > -1)
        if (this.originalFrames.toString().split(",").length == 2)
            this.unscaledMaxFrames = MathHelperFunctions.GetRandomInt(parseInt(this.originalFrames.toString().split(",")[0]), parseInt(this.originalFrames.toString().split(",")[1]));

    this.maxFrames = this.unscaledMaxFrames * this.scale;

    switch (this.originalInterpolation) {

        case "linear":
        default:
            this.interpolation = "linear";
            this.interpolationFunc = this.linearInterpolationFunc;
            break;

        case "easeInQuad":
            this.interpolation = "easeInQuad";
            this.interpolationFunc = this.easeInQuadInterpolationFunc;
            break;

        case "easeOutQuad":
            this.interpolation = "easeOutQuad";
            this.interpolationFunc = this.easeOutQuadInterpolationFunc;
            break;

        case "easeInOutQuad":
            this.interpolation = "easeInOutQuad";
            this.interpolationFunc = this.easeInOutQuadInterpolationFunc;
            break;

        case "easeInCubic":
            this.interpolation = "easeInCubic";
            this.interpolationFunc = this.easeInCubicInterpolationFunc;
            break;

        case "easeOutCubic":
            this.interpolation = "easeOutCubic";
            this.interpolationFunc = this.easeOutCubicInterpolationFunc;
            break;

        case "easeInOutCubic":
            this.interpolation = "easeInOutCubic";
            this.interpolationFunc = this.easeInOutCubicInterpolationFunc;
            break;

        case "easeInQuart":
            this.interpolation = "easeInQuart";
            this.interpolationFunc = this.easeInQuartInterpolationFunc;
            break;

        case "easeOutQuart":
            this.interpolation = "easeOutQuart";
            this.interpolationFunc = this.easeOutQuartInterpolationFunc;
            break;

        case "easeInOutQuart":
            this.interpolation = "easeInOutQuart";
            this.interpolationFunc = this.easeInOutQuartInterpolationFunc;
            break;

        case "easeInQuint":
            this.interpolation = "easeInQuint";
            this.interpolationFunc = this.easeInQuintInterpolationFunc;
            break;

        case "easeOutQuint":
            this.interpolation = "easeOutQuint";
            this.interpolationFunc = this.easeOutQuintInterpolationFunc;
            break;

        case "easeInOutQuint":
            this.interpolation = "easeInOutQuint";
            this.interpolationFunc = this.easeInOutQuintInterpolationFunc;
            break;

        case "easeInSine":
            this.interpolation = "easeInSine";
            this.interpolationFunc = this.easeInSineInterpolationFunc;
            break;

        case "easeOutSine":
            this.interpolation = "easeOutSine";
            this.interpolationFunc = this.easeOutSineInterpolationFunc;
            break;

        case "easeInOut":
            this.interpolation = "easeInOut";
            this.interpolationFunc = this.easeInOutSineInterpolationFunc;
            break;

        case "easeInExpo":
            this.interpolation = "easeInExpo";
            this.interpolationFunc = this.easeInExpoInterpolationFunc;
            break;

        case "easeOutExpo":
            this.interpolation = "easeOutExpo";
            this.interpolationFunc = this.easeOutExpoInterpolationFunc;
            break;

        case "easeInOutExpo":
            this.interpolation = "easeInOutExpo";
            this.interpolationFunc = this.easeInOutExpoInterpolationFunc;
            break;

        case "easeInCirc":
            this.interpolation = "easeInCirc";
            this.interpolationFunc = this.easeInCircInterpolationFunc;
            break;

        case "easeOutCirc":
            this.interpolation = "easeOutCirc";
            this.interpolationFunc = this.easeOutCircInterpolationFunc;
            break;

        case "easeInOutCirc":
            this.interpolation = "easeInOutCirc";
            this.interpolationFunc = this.easeInOutCircInterpolationFunc;
            break;

        case "easeInElastic":
            this.interpolation = "easeInElastic";
            this.interpolationFunc = this.easeInElasticInterpolationFunc;
            break;

        case "easeOutElastic":
            this.interpolation = "easeOutElastic";
            this.interpolationFunc = this.easeOutElasticInterpolationFunc;
            break;

        case "easeInOutElastic":
            this.interpolation = "easeInOutElastic";
            this.interpolationFunc = this.easeInOutElasticInterpolationFunc;
            break;

        case "sin2":
            this.interpolation = "sin2";
            this.interpolationFunc = this.sin2InterpolationFunc;
            break;

        case "cos2":
            this.interpolation = "cos2";
            this.interpolationFunc = this.cos2InterpolationFunc;
            break;

        case "sin5":
            this.interpolation = "sin5";
            this.interpolationFunc = this.sin5InterpolationFunc;
            break;

        case "cos5":
            this.interpolation = "cos5";
            this.interpolationFunc = this.cos5InterpolationFunc;
            break;

        case "sin10":
            this.interpolation = "sin10";
            this.interpolationFunc = this.sin10InterpolationFunc;
            break;

        case "cos10":
            this.interpolation = "cos10";
            this.interpolationFunc = this.cos10InterpolationFunc;
            break;
    }

    switch (this.originalPlayback) {

        case "loopForward":
            this.playbackType = "loopForward";
            this.playbackFunc = this.loopForwardPlaybackFunc;
            break;

        case "clampForward":
        default:
            this.playbackType = "clampForward";
            this.playbackFunc = this.clampForwardPlaybackFunc;
            break;

        case "loopBackward":
            this.playbackType = "loopBackward";
            this.playbackFunc = this.loopBackwardPlaybackFunc;
            break;

        case "clampBackward":
            this.playbackType = "clampBackward";
            this.playbackFunc = this.clampBackwardPlaybackFunc;
            break;

        case "bounce":
            this.playbackType = "bounce";
            this.playbackFunc = this.bouncePlaybackFunc;
            break;

        case "randomFrame":
            this.playbackType = "randomFrame";
            this.playbackFunc = this.randomFramePlaybackFunc;
            break;

        case "randomLoop":
            this.playbackType = "randomLoop";
            this.playbackFunc = this.randomLoopPlaybackFunc;
            break;
    }
}

HyperValue.prototype.cleanup = function () {

}

HyperValue.prototype.changeScale = function (newScale) {

    this.scale =
        newScale;

    this.maxFrames =
        this.unscaledMaxFrames * this.scale;
}

HyperValue.prototype.getNextValue = function () {

    this.frame++;
    return this.playbackFunc(this.frame, this.maxFrames);
}

HyperValue.prototype.getFrameValue = function (_frame) {

    return this.playbackFunc(_frame, this.maxFrames);
}

// INTERPOLATION FUNCTIONS ////////////////////////////////////////////////////////////////////////
HyperValue.prototype.sin2InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 2))) + _startValue);
}

HyperValue.prototype.sin5InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 5))) + _startValue);
}

HyperValue.prototype.sin10InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.sin((_frame / _maxFrames) * 10))) + _startValue);
}

HyperValue.prototype.cos2InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 2))) + _startValue);
}

HyperValue.prototype.cos5InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 5))) + _startValue);
}

HyperValue.prototype.cos10InterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (((_endValue - _startValue) * (Math.cos((_frame / _maxFrames) * 10))) + _startValue);
}

HyperValue.prototype.linearInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return ((_endValue - _startValue) * (_frame / _maxFrames)) + _startValue;
}

HyperValue.prototype.easeInQuadInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame + _startValue;
}

HyperValue.prototype.easeInQuadInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
    return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame + _startValue;
}

HyperValue.prototype.easeOutQuadInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutQuad: function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; 
    return -(_endValue - _startValue) * (_frame /= _maxFrames) * (_frame - 2) + _startValue;
}

HyperValue.prototype.easeInOutQuadInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInOutQuad: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; },
    if ((_frame /= _maxFrames / 2) < 1)
        return (_endValue - _startValue) / 2 * _frame * _frame + _startValue;
    return -(_endValue - _startValue) / 2 * ((--_frame) * (_frame - 2) - 1) + _startValue;
}

HyperValue.prototype.easeInCubicInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInCubic: function (x, t, b, c, d) { return c*(t/=d)*t*t + b; },
    return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame + _startValue;
}

HyperValue.prototype.easeOutCubicInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutCubic: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t + 1) + b; },
    return (_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame + 1) + _startValue;
}

HyperValue.prototype.easeInOutCubicInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInOutCubic: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t + b; return c/2*((t-=2)*t*t + 2) + b; },
    if ((_frame /= _maxFrames / 2) < 1)
        return (_endValue - _startValue) / 2 * _frame * _frame * _frame + _startValue;
    return (_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame + 2) + _startValue;
}

HyperValue.prototype.easeInQuartInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInQuart: function (x, t, b, c, d) { return c*(t/=d)*t*t*t + b; },
    return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame * _frame + _startValue;
}

HyperValue.prototype.easeOutQuartInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutQuart: function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; },
    return -(_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame * _frame - 1) + _startValue;
}

HyperValue.prototype.easeInOutQuartInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInOutQuart: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b; },
    if ((_frame /= _maxFrames / 2) < 1)
        return (_endValue - _startValue) / 2 * _frame * _frame * _frame * _frame + _startValue;
    return -(_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame * _frame - 2) + _startValue;
}

HyperValue.prototype.easeInQuintInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInQuint: function (x, t, b, c, d) { return c*(t/=d)*t*t*t*t + b; },
    return (_endValue - _startValue) * (_frame /= _maxFrames) * _frame * _frame * _frame * _frame + _startValue;
}

HyperValue.prototype.easeOutQuintInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutQuint: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t*t*t + 1) + b; },
    return (_endValue - _startValue) * ((_frame = _frame / _maxFrames - 1) * _frame * _frame * _frame * _frame + 1) + _startValue;
}

HyperValue.prototype.easeInOutQuintInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInOutQuint: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b; return c/2*((t-=2)*t*t*t*t + 2) + b; },
    if ((_frame /= _maxFrames / 2) < 1)
        return (_endValue - _startValue) / 2 * _frame * _frame * _frame * _frame * _frame + _startValue;
    return (_endValue - _startValue) / 2 * ((_frame -= 2) * _frame * _frame * _frame * _frame + 2) + _startValue;
}

HyperValue.prototype.easeInSineInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInSine: function (x, t, b, c, d) { return -c * Math.cos(t/d * (Math.PI/2)) + c + b; },
    return -(_endValue - _startValue) * Math.cos(_frame / _maxFrames * (Math.PI / 2)) + (_endValue - _startValue) + _startValue;
}

HyperValue.prototype.easeOutSineInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutSine: function (x, t, b, c, d) { return c * Math.sin(t/d * (Math.PI/2)) + b; },
    return (_endValue - _startValue) * Math.sin(_frame / _maxFrames * (Math.PI / 2)) + _startValue;
}

HyperValue.prototype.easeInOutSineInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInOutSine: function (x, t, b, c, d) { return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b; },
    return -(_endValue - _startValue) / 2 * (Math.cos(Math.PI * _frame / _maxFrames) - 1) + _startValue;
}

HyperValue.prototype.easeInExpoInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInExpo: function (x, t, b, c, d) { return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b; },
    return (_frame == 0) ?
        _startValue :
        (_endValue - _startValue) * Math.pow(2, 10 * (_frame / _maxFrames - 1)) + _startValue;
}

HyperValue.prototype.easeOutExpoInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutExpo: function (x, t, b, c, d) { return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; },
    return (_frame == _maxFrames) ?
        _startValue + (_endValue - _startValue) :
        (_endValue - _startValue) * (-Math.pow(2, -10 * _frame / _maxFrames) + 1) + _startValue;
}

HyperValue.prototype.easeInOutExpoInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    if (_frame == 0)
        return _startValue;
    if (_frame == _maxFrames)
        return _startValue + (_endValue - _startValue);
    if ((_frame /= _maxFrames / 2) < 1)
        return (_endValue - _startValue) / 2 * Math.pow(2, 10 * (_frame - 1)) + _startValue;
    return (_endValue - _startValue) / 2 * (-Math.pow(2, -10 * --_frame) + 2) + _startValue;
}

HyperValue.prototype.easeInCircInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeInCirc: function (x, t, b, c, d) { return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b; },
    return -(_endValue - _startValue) * (Math.sqrt(1 - (_frame /= _maxFrames) * _frame) - 1) + _startValue;
}

HyperValue.prototype.easeOutCircInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    // easeOutCirc: function (x, t, b, c, d) { return c * Math.sqrt(1 - (t=t/d-1)*t) + b; },
    return (_endValue - _startValue) * Math.sqrt(1 - (_frame = _frame / _maxFrames - 1) * _frame) + _startValue;
}

HyperValue.prototype.easeInOutCircInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

    // t: current time, b: begInnIng value, c: change In value, d: duration
    if ((_frame /= _maxFrames / 2) < 1)
        return -(_endValue - _startValue) / 2 * (Math.sqrt(1 - _frame * _frame) - 1) + _startValue;
    return (_endValue - _startValue) / 2 * (Math.sqrt(1 - (_frame -= 2) * _frame) + 1) + _startValue;
}

HyperValue.prototype.easeInElasticInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

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
}

HyperValue.prototype.easeOutElasticInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

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
}

HyperValue.prototype.easeInOutElasticInterpolationFunc = function (_frame, _maxFrames, _startValue, _endValue) {

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

// PLAYBACK FUNCTIONS /////////////////////////////////////////////////////////////////////////////
HyperValue.prototype.loopForwardPlaybackFunc = function (_frame, _maxFrames) {

    while (_frame > _maxFrames)
        _frame -= _maxFrames;

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.clampForwardPlaybackFunc = function (_frame, _maxFrames) {

    if (_frame > _maxFrames)
        _frame = _maxFrames;

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.loopBackwardPlaybackFunc = function (_frame, _maxFrames) {

    while (_frame > _maxFrames)
        _frame -= _maxFrames;

    _frame = (_maxFrames - _frame);

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.clampBackwardPlaybackFunc = function (_frame, _maxFrames) {

    if (_frame > _maxFrames)
        _frame = _maxFrames;

    _frame = (_maxFrames - _frame);

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.bouncePlaybackFunc = function (_frame, _maxFrames) {

    var direction = 0;

    while (_frame > _maxFrames) {

        direction = (direction == 0 ? 1 : 0);
        _frame -= _maxFrames;
    }

    if (direction == 1)
        _frame = (_maxFrames - _frame);

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.randomFramePlaybackFunc = function (_frame, _maxFrames) {

    _frame = Math.floor(Math.random() * _maxFrames);

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.randomLoopPlaybackFunc = function (_frame, _maxFrames) {

    while (_frame > _maxFrames) {

        if (this.originalStartNumber.toString().indexOf(",") > -1)
            if (this.originalStartNumber.toString().split(",").length == 2)
                this.startNumber = MathHelperFunctions.GetRandom(parseFloat(this.originalStartNumber.toString().split(",")[0]), parseFloat(this.originalStartNumber.toString().split(",")[1]));

        if (this.originalEndNumber.toString().indexOf(",") > -1)
            if (this.originalEndNumber.toString().split(",").length == 2)
                this.endNumber = MathHelperFunctions.GetRandom(parseFloat(this.originalEndNumber.toString().split(",")[0]), parseFloat(this.originalEndNumber.toString().split(",")[1]));

        _frame -= _maxFrames;
    }

    return this.interpolationFunc(_frame, _maxFrames, this.startNumber, this.endNumber);
}

HyperValue.prototype.reset = function () {

    this.frame = 0;
}

HyperValue.prototype.getCopy = function () {

    return new HyperValue({
        startNumber: this.originalStartNumber,
        endNumber: this.originalEndNumber,
        frames: this.originalFrames,
        scale: this.scale,
        interpolation: this.originalInterpolation,
        playbackType: this.originalPlayback
    });
}