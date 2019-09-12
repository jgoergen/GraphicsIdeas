(function () {

    var FPS = 60;
    var waitForAnimationFrame = true;

    var thisRef = this;
    this.ctx = undefined;
    this.canvas = undefined;
    this.isMouseDown = false;
    this.isSecondaryMouseDown = false;
    this.now = undefined;
    this.then = Date.now();
    this.interval = 1000 / FPS;
    this.delta;
    this.lastX = undefined;
    this.lastY = undefined;
    this.canvasOffsetX = undefined;
    this.canvasOffsetY = undefined;
    this.settings = {};

    this.initialize = function () {

        document.oncontextmenu = function(e) {

            e.preventDefault();
            e.stopPropagation();
        }

        this.canvas =
            document
                .getElementById(
                    "canvas");

        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.canvasOffsetX = this.canvas.offsetLeft;
        this.canvasOffsetY = this.canvas.offsetTop;
        this.ctx = canvas.getContext("2d");

        if (('ontouchstart' in window || 'onmsgesturechange' in window)) {

            this.canvas
                .addEventListener(
                    "touchstart",
                    function (e) { thisRef.touchStartHanlder(e); },
                    false);

            this.canvas
                .addEventListener(
                    "touchmove",
                    function (e) { thisRef.touchMoveHanlder(e); },
                    false);

            this.canvas
                .addEventListener(
                    "touchend",
                    function (e) { thisRef.touchEndHanlder(e); },
                    false);
        }

        this.canvas
            .addEventListener(
                "mousemove",
                function (e) { thisRef.mouseMoveHandler(e); },
                false);

        this.canvas
            .addEventListener(
                "mousedown",
                function (e) { thisRef.mouseDownHandler(e); },
                false);

        this.canvas
            .addEventListener(
                "mouseup",
                function (e) { thisRef.mouseUpHandler(e); },
                false);

        // does the device support tilt events?
        if (window.DeviceOrientationEvent) {

            window
                .addEventListener(
                    "deviceorientation",
                    function (e) { thisRef.tiltHandler(e); },
                    false);

        } else if (window.DeviceMotionEvent) {

            window
                .addEventListener(
                    "devicemotion",
                    function (e) { thisRef.tiltHandler(e); },
                    false);
        }

        init(this.ctx)
            .then(
                function (options) {

                    if (options && options.hasOwnProperty("fps")) {

                        if (options.fps === -1) {

                            waitForAnimationFrame = false;
                            setInterval(function () { update(this.ctx, this.canvas); }, 0);
                            return;

                        } else {

                            this.FPS = options.fps;
                            this.interval = 1000 / options.fps;
                        }
                    }

                    if (options && options.hasOwnProperty("settings")) {

                        this.settings = this.initSettings(options.settings);

                        // Todo: this needs an actual interface!
                        window.settings = this.settings;
                    }

                    requestAnimationFrame(this.run);
                });
    };

    this.initSettings = function(settingsOverrides) {

        var result = {};

        Object.keys(settingsOverrides).forEach(
            function (key) {

                result[key] = this.setupSettingOverride(settingsOverrides[key]);
            });

        return result;
    }

    this.setupSettingOverride = function(settingOverride) {

        if (!settingOverride.hasOwnProperty("Generator") && settingOverride.hasOwnProperty("Min") && settingOverride.hasOwnProperty("Max")) {

            settingOverride.Generator = function() { return (Math.random() * (this.Max - this.Min)) + this.Min; };
        }

        if (!settingOverride.hasOwnProperty("Regenerate")) {

            settingOverride.Regenerate = function() { this.TargetValue = this.Generator(); };
        }

        if (!settingOverride.hasOwnProperty("Update")) {

            if (settingOverride.hasOwnProperty("TransitionFrames")) {

                settingOverride.Update = function() { this.Value += (this.TargetValue - this.Value) / this.TransitionFrames; };

            } else {

                settingOverride.Update = function() { this.Value = this.TargetValue; }
            }
        }

        settingOverride.Regenerate();
        settingOverride.Value = settingOverride.TargetValue;
        settingOverride.valueOf = function() { return this.Value; }
        return settingOverride;
    }

    this.interpolateMove = function (x, y) {

        // fix canvas scaling
        x = x * this.canvas.width / this.canvas.clientWidth;
        y = y * this.canvas.height / this.canvas.clientHeight;

        var result = [];

        if (!this.lastX) {

            this.lastX = x;
            this.lastY = y;
        }

        var distance = Math.sqrt((x - lastX) * (x - lastX) + (y - lastY) * (y - lastY));
        var steps = distance / 4;
        var intervalX = (x - lastX) / steps;
        var intervalY = (y - lastY) / steps;

        for (var step = 0; step < steps; step++) {

            x = lastX + (step * intervalX);
            y = lastY + (step * intervalY);
            result.push({ x: x, y: y, speed: distance });
        }

        this.lastX = x;
        this.lastY = y;

        return result;
    }

    this.tiltHandler = function (e) {

        // browser compatability
        if (!e.gamma && !e.beta) {

            if (e.acceleration && e.acceleration.x && e.acceleration.y) {

                e.gamma = e.acceleration.x * 2;
                e.beta = e.acceleration.y * 2;

            } else if (e.x && e.y) {

                e.gamma = -(e.x * (180 / Math.PI));
                e.beta = -(e.y * (180 / Math.PI));
            }
        }

        // if we end up with any tilt values, send them along
        if (e.gamma && e.beta && e.alpha && window.hasOwnProperty("tilt"))
            tilt({ gamma: e.gamma, beta: e.beta, alpha: e.alpha });
    }

    this.touchStartHanlder = function (e) {

        if (e.touches.length == 1 && window.hasOwnProperty("mouseDown"))
            mouseDown({ x: e.touches[0].pageX - this.canvasOffsetX, y: e.touches[0].pageY - this.canvasOffsetY });
        else if (e.touches.length == 2 && window.hasOwnProperty("secondaryMouseDown"))
            secondaryMouseDown({ x: e.touches[0].pageX - this.canvasOffsetX, y: e.touches[0].pageY - this.canvasOffsetY });
    }

    this.touchEndHanlder = function (e) {

        if (e.touches.length == 0 && window.hasOwnProperty("mouseUp"))
            mouseUp();
        else if (e.touches.length == 1 && window.hasOwnProperty("secondaryMouseUp"))
            secondaryMouseUp();

        this.lastX = undefined;
        this.lastY = undefined;
    }

    this.touchMoveHanlder = function (e) {

        var steps =
            this.interpolateMove(
                e.touches[0].pageX - this.canvasOffsetX,
                e.touches[0].pageY - this.canvasOffsetY);

        for (var i = 0; i < steps.length; i++) {

            if (e.touches.length == 0 && window.hasOwnProperty("mouseMove"))
                mouseMove(steps[i], false);
            else if (e.touches.length == 1 && window.hasOwnProperty("mouseMove"))
                mouseMove(steps[i], true);
            else if (e.touches.length == 2 && window.hasOwnProperty("secondaryMouseMove"))
                secondaryMouseMove(steps[i]);
        }
    }

    this.mouseDownHandler = function (e) {

        if ((e.which === 3 || e.button === 2)) {

            isSecondaryMouseDown = true;

            if (window.hasOwnProperty("secondaryMouseDown"))
                secondaryMouseDown(e);

        } else {

            isMouseDown = true;

            if (window.hasOwnProperty("mouseDown"))
                mouseDown(e);
        }
    }

    this.mouseUpHandler = function (e) {

        if ((e.which === 3 || e.button === 2)) {

            isSecondaryMouseDown = false;

            if (window.hasOwnProperty("secondaryMouseUp"))
                secondaryMouseUp(e);

        } else {

            isMouseDown = false;

            if (window.hasOwnProperty("mouseUp"))
                mouseUp(e);
        }

        this.lastX = undefined;
        this.lastY = undefined;
    }

    this.mouseMoveHandler = function (e) {

        var steps =
            this.interpolateMove(
                e.offsetX,
                e.offsetY);

        for (var i = 0; i < steps.length; i++) {

            if (!isMouseDown && !isSecondaryMouseDown) {

                if (window.hasOwnProperty("mouseMove"))
                    mouseMove(steps[i], false);

            } else if (isMouseDown) {

                if (window.hasOwnProperty("mouseMove"))
                    mouseMove(steps[i], true);

            } else if (isSecondaryMouseDown) {

                if (window.hasOwnProperty("secondaryMouseMove"))
                    secondaryMouseMove(steps[i]);
            }
        }
    }

    this.run = function () {

        now = Date.now();
        delta = now - then;

        if (delta > interval) {

            then = now - (delta % interval);

            Object.keys(this.settings).forEach(
                function (key) {

                    this.settings[key].Update();
                });

            update(this.ctx, this.canvas);
        }

        requestAnimationFrame(this.run);
    }

    window.onload = this.initialize;
})();