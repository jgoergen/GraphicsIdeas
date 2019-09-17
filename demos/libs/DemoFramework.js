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
    this.passParams = {};
    this.stage = undefined;

    // ThreeJS Stuff
    this.scene = undefined;
    this.camera = undefined;
    this.controls = undefined;
    this.renderer = undefined;

    this.initialize = function () {

        if (window.THREEJS === true) {

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera( 75, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000 );
            this.renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

            this.controls = new THREE.TrackballControls( camera );
            this.controls.rotateSpeed = 1.0;
            this.controls.zoomSpeed = 1.2;
            this.controls.panSpeed = 0.8;
            this.controls.noZoom = false;
            this.controls.noPan = false;
            this.controls.staticMoving = true;
            this.controls.dynamicDampingFactor = 0.3;

            this.stage = this.renderer.domElement;
            document.body.appendChild( this.stage );

            this.passParams = {
                scene: this.scene,
                camera: this.camera,
                renderer: this.renderer
            };

        } else {

            this.canvas =
                document
                    .getElementById(
                        "canvas");

            this.canvas.width = CANVAS_WIDTH;
            this.canvas.height = CANVAS_HEIGHT;
            this.canvasOffsetX = this.canvas.offsetLeft;
            this.canvasOffsetY = this.canvas.offsetTop;
            this.ctx = canvas.getContext("2d");

            this.stage = this.canvas;

            this.passParams = {
                canvas: this.canvas,
                ctx: this.ctx
            };
        }

        if (('ontouchstart' in window || 'onmsgesturechange' in window)) {

            this.stage.addEventListener(
                "touchstart",
                function (e) { thisRef.touchStartHanlder(e); },
                false);

            this.stage.addEventListener(
                "touchmove",
                function (e) { thisRef.touchMoveHanlder(e); },
                false);

            this.stage.addEventListener(
                "touchend",
                function (e) { thisRef.touchEndHanlder(e); },
                false);
        }

        this.stage.addEventListener(
            "mousemove",
            function (e) { thisRef.mouseMoveHandler(e); },
            false);

        this.stage.addEventListener(
            "mousedown",
            function (e) { thisRef.mouseDownHandler(e); },
            false);

        this.stage.addEventListener(
            "mouseup",
            function (e) { thisRef.mouseUpHandler(e); },
            false);

        // does the device support tilt events?
        if (window.DeviceOrientationEvent) {

            window.addEventListener(
                "deviceorientation",
                function (e) { thisRef.tiltHandler(e); },
                false);

        } else if (window.DeviceMotionEvent) {

            window.addEventListener(
                "devicemotion",
                function (e) { thisRef.tiltHandler(e); },
                false);
        }

        init(this.passParams)
        .then(
            function (fpsOverride) {

                if (fpsOverride) {

                    if (fpsOverride === -1) {

                        waitForAnimationFrame = false;
                        setInterval(function() { update(this.passParams);}, 0);
                        return;

                    } else {

                        this.FPS = fpsOverride;
                        this.interval = 1000 / fpsOverride;
                    }
                }

                requestAnimationFrame(this.run);
            });
    };

    this.interpolateMove = function (x, y) {

        // fix canvas scaling
        x = x * this.stage.width / this.stage.clientWidth;
        y = y * this.stage.height / this.stage.clientHeight;

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

        if (e.touches.length == 1)
            mouseDown({ x: e.touches[0].pageX - this.canvasOffsetX, y: e.touches[0].pageY - this.canvasOffsetY });
        else if (e.touches.length == 2)
            secondaryMouseDown({ x: e.touches[0].pageX - this.canvasOffsetX, y: e.touches[0].pageY - this.canvasOffsetY });
    }

    this.touchEndHanlder = function (e) {

        if (e.touches.length == 0)
            mouseUp();
        else if (e.touches.length == 1)
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

            if (e.touches.length == 0)
                mouseMove(steps[i], false);
            else if (e.touches.length == 1)
                mouseMove(steps[i], true);
            else if (e.touches.length == 2)
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
            update(this.passParams);
        }

        requestAnimationFrame(this.run);
    }

    window.onload = this.initialize;
})();