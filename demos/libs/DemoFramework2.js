var DemoFramework = function () {

    var thisRef = this;

    this.FPS = 60;
    this.waitForAnimationFrame = true;
    thisRef.ctx = undefined;
    thisRef.canvas = undefined;
    thisRef.isMouseDown = false;
    thisRef.isSecondaryMouseDown = false;
    thisRef.now = undefined;
    thisRef.then = Date.now();
    thisRef.interval = 1000 / FPS;
    thisRef.delta;
    thisRef.lastX = undefined;
    thisRef.lastY = undefined;
    thisRef.canvasOffsetX = undefined;
    thisRef.canvasOffsetY = undefined;
    thisRef.stage = undefined;
    thisRef.passParams = {};
    thisRef.updateIntervalID = 0;

    // ThreeJS Stuff
    thisRef.scene = undefined;
    thisRef.camera = undefined;
    thisRef.controls = undefined;
    thisRef.renderer = undefined;

    thisRef.initialize = function () {

        if (window.TYPE === "threejs") {

            thisRef.scene = new THREE.Scene();
            thisRef.camera = new THREE.PerspectiveCamera(75, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000);
            thisRef.renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

            thisRef.controls = new THREE.TrackballControls(camera);
            thisRef.controls.rotateSpeed = 1.0;
            thisRef.controls.zoomSpeed = 1.2;
            thisRef.controls.panSpeed = 0.8;
            thisRef.controls.noZoom = false;
            thisRef.controls.noPan = false;
            thisRef.controls.staticMoving = true;
            thisRef.controls.dynamicDampingFactor = 0.3;

            thisRef.stage = thisRef.renderer.domElement;
            document.body.appendChild(thisRef.stage);

            thisRef.passParams = {
                scene: thisRef.scene,
                camera: thisRef.camera,
                renderer: thisRef.renderer
            };

        } else if (window.TYPE === "pixijs") {

            let app = new PIXI.Application({
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                antialias: true,
                transparent: false,
                resolution: 1
            }
            );

            app.renderer.autoResize = true;
            document.body.appendChild(app.view);
            thisRef.stage = app.view;

            thisRef.passParams = {
                app: app,
                stage: app.stage
            };

        } else if (window.TYPE === "none") {

            thisRef.stage = document.querySelector("body");
            thisRef.passParams = {};

        } else {

            thisRef.canvas =
                document
                    .getElementById(
                        "canvas");

            thisRef.canvas.width = CANVAS_WIDTH;
            thisRef.canvas.height = CANVAS_HEIGHT;
            thisRef.canvasOffsetX = thisRef.canvas.offsetLeft;
            thisRef.canvasOffsetY = thisRef.canvas.offsetTop;
            thisRef.ctx = canvas.getContext("2d");

            thisRef.stage = thisRef.canvas;

            thisRef.passParams = {
                canvas: thisRef.canvas,
                ctx: thisRef.ctx
            };
        }

        if (!window.AllowContextMenu) {

            document.oncontextmenu = function (e) {

                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (('ontouchstart' in window || 'onmsgesturechange' in window)) {

            thisRef.stage
                .addEventListener(
                    "touchstart",
                    function (e) { thisRef.touchStartHanlder(e); },
                    false);

            thisRef.stage
                .addEventListener(
                    "touchmove",
                    function (e) { thisRef.touchMoveHanlder(e); },
                    false);

            thisRef.stage
                .addEventListener(
                    "touchend",
                    function (e) { thisRef.touchEndHanlder(e); },
                    false);
        }

        thisRef.stage
            .addEventListener(
                "mousemove",
                function (e) { thisRef.mouseMoveHandler(e); },
                false);

        thisRef.stage
            .addEventListener(
                "mousedown",
                function (e) { thisRef.mouseDownHandler(e); },
                false);

        thisRef.stage
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

        // prepare settings
        if (window.hasOwnProperty("SETTINGS_PACKAGE")) {

            thisRef.initSettings(window.SETTINGS_PACKAGE);
        }

        thisRef.doInit(thisRef.passParams);
    };

    thisRef.doInit = function (params) {

        init(params)
            .then(
                function (options) {
                    if (options && options.hasOwnProperty("fps")) {

                        if (options.fps === -1) {

                            waitForAnimationFrame = false;
                            thisRef.updateIntervalID = setInterval(function () { update(params); }, 0);
                            return;

                        } else {

                            thisRef.setFPS(options.fps);
                        }
                    }


                    if (window.ConsoleFeatures && !window.DF) {

                        console.log("==========================");
                        console.log("Demo Framework Initialized");
                        console.log("==========================");
                        console.log("DF.Restart()");
                        console.log("DF.FullRestart()");
                        console.log("DF.SetFPS(60)");

                        window.DF = {
                            FullRestart: () => {
                                clearInterval(thisRef.updateIntervalID);
                                cancelAnimationFrame(thisRef.updateIntervalID);
                                thisRef.initSettings(window.SETTINGS_PACKAGE);
                                thisRef.doInit(params);

                                Object.keys(window.settings).forEach(
                                    function (key) {

                                        window.settings[key].Regenerate();
                                    });
                            },
                            Restart: () => {
                                thisRef.doInit(params);
                                clearInterval(thisRef.updateIntervalID);
                                cancelAnimationFrame(thisRef.updateIntervalID);
                            },
                            SetFPS: thisRef.setFPS
                        };
                    }

                    thisRef.updateIntervalID = requestAnimationFrame(() => thisRef.run());
                });
    }

    thisRef.setFPS = function (fps) {

        thisRef.FPS = fps;
        thisRef.interval = 1000 / fps;
    };

    thisRef.initSettings = function (settingsOverrides) {

        window.settings = {};
        Object.keys(settingsOverrides).forEach(
            function (key) {
                var settingOverride = thisRef.setupSettingOverride(settingsOverrides[key]);
                window.settings[key] = settingOverride;
            });
    };

    thisRef.setupSettingOverride = function (settingOverride) {

        if (!settingOverride.hasOwnProperty("Generator")) {

            if (settingOverride.hasOwnProperty("Min") && settingOverride.hasOwnProperty("Max")) {

                settingOverride.Generator = function () { return (Math.random() * (this.Max - this.Min)) + this.Min; };

            } else if (settingOverride.hasOwnProperty("Array")) {

                settingOverride.Generator = function () { return this.Array[Math.floor(Math.random() * this.Array.length)]; };
            }
        }

        if (!settingOverride.hasOwnProperty("Regenerate")) {

            settingOverride.Regenerate = function () { this.TargetValue = this.Generator(); return this; };
        }

        if (!settingOverride.hasOwnProperty("Update")) {

            if (settingOverride.hasOwnProperty("TransitionFrames")) {

                settingOverride.Update = function () { this.Value += (this.TargetValue - this.Value) / this.TransitionFrames; return this; };

            } else {

                settingOverride.Update = function () { this.Value = this.TargetValue; return this; }
            }
        }

        if (!settingOverride.hasOwnProperty("Value")) {

            settingOverride.Regenerate();
            settingOverride.Value = settingOverride.TargetValue;

        } else {

            settingOverride.TargetValue = settingOverride.Value;
        }

        if (!settingOverride.hasOwnProperty("Min")) {

            settingOverride.Min = settingOverride.Value;
        }

        if (!settingOverride.hasOwnProperty("Max")) {

            settingOverride.Max = settingOverride.Value;
        }

        if (!settingOverride.hasOwnProperty("TransitionFrames")) {

            settingOverride.TransitionFrames = 10;
        }

        return settingOverride;
    };

    thisRef.interpolateMove = function (x, y) {

        // fix canvas scaling
        x = x * thisRef.stage.width / thisRef.stage.clientWidth;
        y = y * thisRef.stage.height / thisRef.stage.clientHeight;

        var result = [];

        if (!thisRef.lastX) {

            thisRef.lastX = x;
            thisRef.lastY = y;
        }

        var distance = Math.sqrt((x - thisRef.lastX) * (x - thisRef.lastX) + (y - thisRef.lastY) * (y - thisRef.lastY));
        var steps = distance / 4;
        var intervalX = (x - thisRef.lastX) / steps;
        var intervalY = (y - thisRef.lastY) / steps;

        for (var step = 0; step < steps; step++) {

            x = thisRef.lastX + (step * intervalX);
            y = thisRef.lastY + (step * intervalY);
            result.push({ x: x, y: y, speed: distance });
        }

        thisRef.lastX = x;
        thisRef.lastY = y;

        return result;
    };

    thisRef.tiltHandler = function (e) {

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
    };

    thisRef.touchStartHanlder = function (e) {

        if (e.touches.length == 1 && window.hasOwnProperty("mouseDown"))
            mouseDown({ x: e.touches[0].pageX - thisRef.canvasOffsetX, y: e.touches[0].pageY - thisRef.canvasOffsetY });
        else if (e.touches.length == 2 && window.hasOwnProperty("secondaryMouseDown"))
            secondaryMouseDown({ x: e.touches[0].pageX - thisRef.canvasOffsetX, y: e.touches[0].pageY - thisRef.canvasOffsetY });
    };

    thisRef.touchEndHanlder = function (e) {

        if (e.touches.length == 0 && window.hasOwnProperty("mouseUp"))
            mouseUp();
        else if (e.touches.length == 1 && window.hasOwnProperty("secondaryMouseUp"))
            secondaryMouseUp();

        thisRef.lastX = undefined;
        thisRef.lastY = undefined;
    };

    thisRef.touchMoveHanlder = function (e) {

        var steps =
            thisRef.interpolateMove(
                e.touches[0].pageX - thisRef.canvasOffsetX,
                e.touches[0].pageY - thisRef.canvasOffsetY);

        for (var i = 0; i < steps.length; i++) {

            if (e.touches.length == 0 && window.hasOwnProperty("mouseMove"))
                mouseMove(steps[i], false);
            else if (e.touches.length == 1 && window.hasOwnProperty("mouseMove"))
                mouseMove(steps[i], true);
            else if (e.touches.length == 2 && window.hasOwnProperty("secondaryMouseMove"))
                secondaryMouseMove(steps[i]);
        }
    };

    thisRef.mouseDownHandler = function (e) {

        if ((e.which === 3 || e.button === 2)) {

            isSecondaryMouseDown = true;

            if (window.hasOwnProperty("secondaryMouseDown"))
                secondaryMouseDown(e);

        } else {

            isMouseDown = true;

            if (window.hasOwnProperty("mouseDown"))
                mouseDown(e);
        }
    };

    thisRef.mouseUpHandler = function (e) {

        if ((e.which === 3 || e.button === 2)) {

            isSecondaryMouseDown = false;

            if (window.hasOwnProperty("secondaryMouseUp"))
                secondaryMouseUp(e);

        } else {

            isMouseDown = false;

            if (window.hasOwnProperty("mouseUp"))
                mouseUp(e);
        }

        thisRef.lastX = undefined;
        thisRef.lastY = undefined;
    };

    thisRef.mouseMoveHandler = function (e) {

        var steps =
            thisRef.interpolateMove(
                e.offsetX,
                e.offsetY);

        for (var i = 0; i < steps.length; i++) {

            if (!thisRef.isMouseDown && !thisRef.isSecondaryMouseDown) {

                if (window.hasOwnProperty("mouseMove"))
                    mouseMove(steps[i], false);

            } else if (thisRef.isMouseDown) {

                if (window.hasOwnProperty("mouseMove"))
                    mouseMove(steps[i], true);

            } else if (thisRef.isSecondaryMouseDown) {

                if (window.hasOwnProperty("secondaryMouseMove"))
                    secondaryMouseMove(steps[i]);
            }
        }
    };

    thisRef.run = function () {

        thisRef.now = Date.now();
        var delta = thisRef.now - thisRef.then;

        if (delta > thisRef.interval) {

            thisRef.then = thisRef.now;

            if (window.settings) {
                Object.keys(window.settings).forEach(
                    function (key) {

                        window.settings[key].Update();
                    });
            }

            update(thisRef.passParams);
        }

        thisRef.updateIntervalID = requestAnimationFrame(() => thisRef.run());
    };

    thisRef.initialize();
};

window.onload = () => new DemoFramework();