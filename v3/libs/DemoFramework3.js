/* eslint-disable */
var DemoFramework = function (initialSettings) {

    var thisRef = this;

    thisRef.FPS = 60;
    thisRef.waitForAnimationFrame = true;
    thisRef.ctx = undefined;
    thisRef.canvas = undefined;
    thisRef.isMouseDown = false;
    thisRef.isSecondaryMouseDown = false;
    thisRef.now = undefined;
    thisRef.then = Date.now();
    thisRef.interval = 1000 / thisRef.FPS;
    thisRef.delta = 0;
    thisRef.lastX = undefined;
    thisRef.lastY = undefined;
    thisRef.canvasOffsetX = undefined;
    thisRef.canvasOffsetY = undefined;
    thisRef.stage = undefined;
    thisRef.passParams = {};
    thisRef.updateIntervalID = 0;
    thisRef.lastTime = 0;
    thisRef.date = undefined;
    thisRef.elapsed = 0;
    thisRef.canvasRect = undefined;

    // ThreeJS Stuff
    thisRef.scene = undefined;
    thisRef.camera = undefined;
    thisRef.controls = undefined;
    thisRef.renderer = undefined;

    thisRef.initialize = function () {

        if (initialSettings.type === "threejs") {

            if (!window.hasOwnProperty("THREE")) {
                alert("Attempting to init three.js failed, is it included?");
                return;
            }

            thisRef.scene = new THREE.Scene();
            thisRef.camera = new THREE.PerspectiveCamera(75, initialSettings.width / initialSettings.height, 0.1, 1000);
            thisRef.renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(initialSettings.width, initialSettings.height);

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
                renderer: thisRef.renderer,
                elapsed: 0,
                delta: 0
            };

        } else if (initialSettings.type === "pixijs") {

            if (!window.hasOwnProperty("pixijs")) {
                alert("Attempting to init pixijs failed, is it included?");
                return;
            }

            let app = new PIXI.Application({
                width: initialSettings.width,
                height: initialSettings.height,
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
                stage: app.stage,
                elapsed: 0,
                delta: 0
            };

        } else if (initialSettings.type === "none") {

            thisRef.stage = document.querySelector("body");
            thisRef.passParams = {
                elapsed: 0,
                delta: 0
            };

        } else {

            thisRef.canvas =
                document
                    .getElementById(
                        "canvas");

            thisRef.canvas.width = initialSettings.width;
            thisRef.canvas.height = initialSettings.height;
            thisRef.canvasOffsetX = thisRef.canvas.offsetLeft;
            thisRef.canvasOffsetY = thisRef.canvas.offsetTop;
            thisRef.ctx = canvas.getContext("2d");

            thisRef.stage = thisRef.canvas;

            thisRef.passParams = {
                canvas: thisRef.canvas,
                ctx: thisRef.ctx,
                elapsed: 0,
                delta: 0
            };
        }

        if (!initialSettings.allowContextMenu) {

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

        document
            .addEventListener(
                "keydown",
                function (e) { thisRef.keyDownHandler(e); },
                false);

        document
            .addEventListener(
                "keyup",
                function (e) { thisRef.keyUpHandler(e); },
                false);

        document
            .addEventListener(
                "keypress",
                function (e) { thisRef.keyPressHandler(e); },
                false);

        /* todo: make optional
                thisRef.stage
                    .addEventListener(
                        "wheel",
                        function (e) { thisRef.mouseWheelHandler(e); },
                        false);
        */

        // does the device support tilt events?
        if (initialSettings.deviceOrientationEvent) {

            window
                .addEventListener(
                    "deviceorientation",
                    function (e) { thisRef.tiltHandler(e); },
                    false);

        } else if (initialSettings.deviceMotionEvent) {

            window
                .addEventListener(
                    "devicemotion",
                    function (e) { thisRef.tiltHandler(thisRef.passParams, e); },
                    false);
        }


        // prepare settings
        if (initialSettings.hasOwnProperty("values")) {

            thisRef.initSettings(initialSettings.values);
        }

        thisRef.initConsoleFeatures(thisRef.passParams);
        thisRef.lastTime = new Date();
        thisRef.elapsed = Math.random() * 10000;

        new DFEditor(thisRef.passParams.values, "editor");

        thisRef.doInit(thisRef.passParams);
    };

    thisRef.initConsoleFeatures = function (params) {
        console.log("==========================");
        console.log("Demo Framework Initialized");
        console.log("==========================");
        console.log("DF.Restart()");
        console.log("DF.FullRestart()");
        console.log("DF.SetFPS(60)");
        console.log("DF.Values");

        window.DF = { Values: {} };

        window.DF = {
            FullRestart: () => {
                clearInterval(thisRef.updateIntervalID);
                cancelAnimationFrame(thisRef.updateIntervalID);
                thisRef.initSettings(initialSettings.values);
                thisRef.doInit(params);

                Object.keys(params.values).forEach(
                    function (key) {
                        params.values[key].Locked = false;
                        params.values[key].Regenerate();
                    });
            },
            Restart: () => {
                thisRef.doInit(params);
                clearInterval(thisRef.updateIntervalID);
                cancelAnimationFrame(thisRef.updateIntervalID);
            },
            SetFPS: thisRef.setFPS,
            Values: params.values
        };
    }

    thisRef.doInit = function (params) {

        initialSettings.init(params)
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

                    thisRef.updateIntervalID = requestAnimationFrame(() => thisRef.run());
                });
    }

    thisRef.setFPS = function (fps) {

        thisRef.FPS = fps;
        thisRef.interval = 1000 / fps;
    };

    thisRef.initSettings = function (settingsOverrides) {

        thisRef.passParams.values = {};

        const entries = Object.entries(settingsOverrides);
        const sortedEntries = entries.sort((a, b) => a[1].Index - b[1].Index);

        sortedEntries
            .forEach(([key, override]) => {
                console.log(key);
                const settingOverride =
                    typeof override === "function" ?
                        thisRef.setupSettingOverride(override(thisRef.passParams.values), thisRef.passParams.values) :
                        thisRef.setupSettingOverride(override, thisRef.passParams.values);

                thisRef.passParams.values[key] = settingOverride;
            });
    };

    thisRef.setupSettingOverride = function (settingOverride, allValues) {

        if (!settingOverride.hasOwnProperty("Index")) {
            settingOverride.Index = 999;
        }

        if (!settingOverride.hasOwnProperty("Generator")) {

            if (settingOverride.hasOwnProperty("Min") && settingOverride.hasOwnProperty("Max")) {

                settingOverride.Generator =
                    () => {
                        const maxVal =
                            typeof settingOverride.Max === "function" ?
                                settingOverride.Max(allValues) :
                                settingOverride.Max;

                        const minVal =
                            typeof settingOverride.Min === "function" ?
                                settingOverride.Min(allValues) :
                                settingOverride.Min;

                        return ((Math.random() * (maxVal - minVal)) + minVal)
                    };

            } else if (settingOverride.hasOwnProperty("Array")) {

                settingOverride.Generator = () => (settingOverride.Array[Math.floor(Math.random() * settingOverride.Array.length)]);
            }
        }

        if (!settingOverride.hasOwnProperty("Regenerate")) {

            settingOverride.Regenerate = () => (settingOverride.TargetValue = settingOverride.Generator());
        }

        if (!settingOverride.hasOwnProperty("Update")) {

            if (settingOverride.hasOwnProperty("TransitionFrames")) {

                settingOverride.Update = () => {
                    if (!settingOverride.Locked) {
                        settingOverride.Value += (settingOverride.TargetValue - settingOverride.Value) / settingOverride.TransitionFrames;

                        if (settingOverride.Floored) {
                            settingOverride.Value = Math.floor(settingOverride.Value);
                        }
                        else if (settingOverride.Ceiled) {
                            settingOverride.Value = Math.ceil(settingOverride.Value);
                        }

                        return settingOverride;
                    }
                };

            } else {

                settingOverride.Update = () => {
                    if (!settingOverride.Locked) {
                        if (settingOverride.Floored) {
                            settingOverride.Value = Math.floor(settingOverride.TargetValue);
                        }
                        else if (settingOverride.Ceiled) {
                            settingOverride.Value = Math.ceil(settingOverride.TargetValue);
                        }
                        else {
                            settingOverride.Value = settingOverride.TargetValue;
                        }

                        return settingOverride;
                    }
                }
            }
        }

        if (!settingOverride.hasOwnProperty("Value")) {

            settingOverride.Regenerate();
            settingOverride.Value = settingOverride.TargetValue;

            if (settingOverride.Floored) {
                settingOverride.Value = Math.floor(settingOverride.Value);
            }
            else if (settingOverride.Ceiled) {
                settingOverride.Value = Math.ceil(settingOverride.Value);
            }

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

        if (!settingOverride.hasOwnProperty("Locked")) {

            settingOverride.Locked = false;
        }

        if (!settingOverride.hasOwnProperty("Floored")) {

            settingOverride.Floored = false;
        }

        if (!settingOverride.hasOwnProperty("Ceiled")) {

            settingOverride.Ceiled = false;
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
        if (e.gamma && e.beta && e.alpha && initialSettings.hasOwnProperty("tilt"))
            initialSettings.tilt(thisRef.passParams, { gamma: e.gamma, beta: e.beta, alpha: e.alpha });
    };

    thisRef.touchStartHanlder = function (e) {
        const bodyRect = document.body.getBoundingClientRect();
        const elemRect = e.currentTarget.getBoundingClientRect();

        thisRef.canvasRect = {
            top: elemRect.top - bodyRect.top,
            left: elemRect.left - bodyRect.left,
            right: elemRect.left + elemRect.width,
            bottom: elemRect.top + elemRect.height,
            height: elemRect.height,
            width: elemRect.width,
            x: elemRect.left - bodyRect.left,
            y: elemRect.top - bodyRect.top
        }
        if (e.touches.length == 1 && initialSettings.hasOwnProperty("mouseDown"))
            initialSettings.mouseDown(thisRef.passParams, { x: e.touches[0].pageX - thisRef.canvasOffsetX, y: e.touches[0].pageY - thisRef.canvasOffsetY }, thisRef.canvasRect);
        else if (e.touches.length == 2 && initialSettings.hasOwnProperty("secondaryMouseDown"))
            initialSettings.secondaryMouseDown(thisRef.passParams, { x: e.touches[0].pageX - thisRef.canvasOffsetX, y: e.touches[0].pageY - thisRef.canvasOffsetY }, thisRef.canvasRect);
    };

    thisRef.touchEndHanlder = function (e) {

        const x = e.touches[0].pageX * thisRef.stage.width / thisRef.stage.clientWidth;
        const y = e.touches[0].pageY * thisRef.stage.height / thisRef.stage.clientHeight;
        if (e.touches.length == 0 && initialSettings.hasOwnProperty("mouseUp"))
            initialSettings.mouseUp(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);
        else if (e.touches.length == 1 && initialSettings.hasOwnProperty("secondaryMouseUp"))
            initialSettings.secondaryMouseUp(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);

        thisRef.lastX = undefined;
        thisRef.lastY = undefined;
    };

    thisRef.touchMoveHanlder = function (e) {

        var steps =
            thisRef.interpolateMove(
                e.touches[0].pageX - thisRef.canvasOffsetX,
                e.touches[0].pageY - thisRef.canvasOffsetY);

        for (var i = 0; i < steps.length; i++) {

            if (e.touches.length == 0 && initialSettings.hasOwnProperty("mouseMove"))
                initialSettings.mouseMove(thisRef.passParams, steps[i], thisRef.canvasRect, false);
            else if (e.touches.length == 1 && initialSettings.hasOwnProperty("mouseMove"))
                initialSettings / mouseMove(thisRef.passParams, steps[i], thisRef.canvasRect, true);
            else if (e.touches.length == 2 && initialSettings.hasOwnProperty("secondaryMouseMove"))
                initialSettings.secondaryMouseMove(thisRef.passParams, thisRef.canvasRect, steps[i]);
        }
    };

    thisRef.mouseDownHandler = function (e) {

        const bodyRect = document.body.getBoundingClientRect();
        const elemRect = e.currentTarget.getBoundingClientRect();
        thisRef.canvasRect = {
            top: elemRect.top - bodyRect.top,
            left: elemRect.left - bodyRect.left,
            right: elemRect.left + elemRect.width,
            bottom: elemRect.top + elemRect.height,
            height: elemRect.height,
            width: elemRect.width,
            x: elemRect.left - bodyRect.left,
            y: elemRect.top - bodyRect.top
        };
        const x = e.offsetX * thisRef.stage.width / thisRef.stage.clientWidth;
        const y = e.offsetY * thisRef.stage.height / thisRef.stage.clientHeight;
        if ((e.which === 3 || e.button === 2)) {

            thisRef.isSecondaryMouseDown = true;

            if (initialSettings.hasOwnProperty("secondaryMouseDown"))
                initialSettings.secondaryMouseDown(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);

        } else {

            thisRef.isMouseDown = true;

            if (initialSettings.hasOwnProperty("mouseDown"))
                initialSettings.mouseDown(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);
        }
    };

    thisRef.mouseUpHandler = function (e) {

        const x = e.offsetX * thisRef.stage.width / thisRef.stage.clientWidth;
        const y = e.offsetY * thisRef.stage.height / thisRef.stage.clientHeight;
        if ((e.which === 3 || e.button === 2)) {

            thisRef.isSecondaryMouseDown = false;

            if (initialSettings.hasOwnProperty("secondaryMouseUp"))
                initialSettings.secondaryMouseUp(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);

        } else {

            thisRef.isMouseDown = false;

            if (initialSettings.hasOwnProperty("mouseUp"))
                initialSettings.mouseUp(thisRef.passParams, { x: x, y: y }, thisRef.canvasRect);
        }

        thisRef.lastX = undefined;
        thisRef.lastY = undefined;
    };
    thisRef.mouseWheelHandler = function (e) {
        e.preventDefault();
        if (initialSettings.hasOwnProperty("mouseScroll")) {
            initialSettings.mouseScroll(thisRef.passParams, e.deltaY, thisRef.canvasRect);
        }
    };

    thisRef.mouseMoveHandler = function (e) {

        var steps =
            thisRef.interpolateMove(
                e.offsetX,
                e.offsetY);

        for (var i = 0; i < steps.length; i++) {

            if (!thisRef.isMouseDown && !thisRef.isSecondaryMouseDown) {

                if (initialSettings.hasOwnProperty("mouseMove"))
                    initialSettings.mouseMove(thisRef.passParams, steps[i], thisRef.canvasRect, false);

            } else if (thisRef.isMouseDown) {

                if (initialSettings.hasOwnProperty("mouseMove"))
                    initialSettings.mouseMove(thisRef.passParams, steps[i], thisRef.canvasRect, true);

            } else if (thisRef.isSecondaryMouseDown) {

                if (initialSettings.hasOwnProperty("secondaryMouseMove"))
                    initialSettings.secondaryMouseMove(thisRef.passParams, thisRef.canvasRect, steps[i]);
            }
        }
    };

    thisRef.keyUpHandler = function (e) {

        if (initialSettings.hasOwnProperty("keyUp"))
            initialSettings.keyUp(thisRef.passParams, e.code);
    };

    thisRef.keyDownHandler = function (e) {

        if (initialSettings.hasOwnProperty("keyDown"))
            initialSettings.keyDown(thisRef.passParams, e.code);
    };

    thisRef.keyPressHandler = function (e) {

        if (initialSettings.hasOwnProperty("keyPress"))
            initialSettings.keyPress(thisRef.passParams, e.code);
    };

    thisRef.run = function () {

        thisRef.date = new Date();
        thisRef.elapsed += thisRef.date - thisRef.lastTime;
        thisRef.lastTime = thisRef.date;
        thisRef.now = Date.now();

        var delta = thisRef.now - thisRef.then;

        if (delta > thisRef.interval) {

            thisRef.then = thisRef.now;
            thisRef.passParams.elapsed = thisRef.elapsed;
            thisRef.passParams.delta = delta = delta;

            if (thisRef.passParams.values) {
                Object.keys(thisRef.passParams.values).forEach(
                    key => thisRef.passParams.values[key].Update()
                );
            }

            initialSettings.update(thisRef.passParams);
        }

        thisRef.updateIntervalID = requestAnimationFrame(() => thisRef.run());
    };

    thisRef.initialize();
};
// export default DemoFramework;
