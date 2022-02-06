var ParticleSystem = function (_settings) {

    this.PRM = null;
    this.VRM = null;
    this.HVRM = null;
    this.settings = _settings;
    this.emitWait = 0;

    this.init = function () {

        if (this.PRM != null)
            this.PRM.cleanup();

        if (this.VRM != null)
            this.VRM.cleanup();

        if (this.HVRM != null)
            this.HVRM.cleanup();

        this.baseX = this.settings.baseX;
        this.baseY = this.settings.baseY;
        this.maxFrames = this.settings.maxFrames;
        this.image = this.settings.image;
        this.images = this.settings.images;
        this.emitRate = this.settings.emitRate;
        this.emitAngleRange = this.settings.emitAngleRange;
        this.emitVelocitySettings = this.settings.emitVelocitySettings;
        this.emitAlphaSettings = this.settings.emitAlphaSettings;
        this.emitScaleSettings = this.settings.emitScaleSettings;
        this.emitRotationSettings = this.settings.emitRotationSettings;
        this.particleUpdateRate = this.settings.particleUpdateRate;
        this.particleSequenceFrames = this.settings.particleSequenceFrames;
        this.particleSequenceDuration = this.settings.particleSequenceDuration;
        this.particleSequenceFrameWidth = this.settings.particleSequenceFrameWidth,
            this.particleSequenceFrameHeight = this.settings.particleSequenceFrameHeight,
            this.maxWidth = this.settings.stageWidth;
        this.maxHeight = this.settings.stageHeight;
        this.gravity = this.settings.gravity;
        this.emitAngleOffset = 0;
        this.emitDistanceOffset = 0;
        this.emitterFrames = this.settings.emitterFrames;
        this.tintColor = this.settings.tintColor;
        this.tintAmount = this.settings.tintAmount;
        this.emitEvery = this.settings.emitEvery;
        this.width = this.image.width;
        this.height = this.image.height;
        this.active = true;
        this.frame = 0;
        this.scale = this.settings.scale || 1;

        if (this.particleSequenceFrameWidth && this.particleSequenceFrameHeight) {

            this.width = parseInt(this.particleSequenceFrameWidth);
            this.height = parseInt(this.particleSequenceFrameHeight);
        }

        this.PRM = new ResourceManager(Particle, 100, true, 5);
        this.VRM = new ResourceManager(Vector, 200, true, 10);
        this.HVRM = new ResourceManager(HyperValue, 600, true, 60);

        this.lastEmitTime = new Date().getTime();
        this.lastParticleUpdateTime = new Date().getTime();
    }

    this.runStep = function (_x, _y) {

        if (this.emitterFrames == null || this.emitterFrames == undefined || this.emitterFrames == 0 || typeof this.emitterFrames != "number")
            return;

        this.update(_x, _y);
    }

    this.runFull = function (_x, _y) {


        if (this.emitterFrames == null || this.emitterFrames == undefined || this.emitterFrames == 0 || typeof this.emitterFrames != "number")
            return;

        this.init();

        for (var i = 0; i < this.emitterFrames; i++)
            this.update(_x, _y);
    }

    this.update = function (_centerX, _centerY) {

        if (!this.active)
            return;

        this.frame++;

        if (_centerX != null && _centerX != undefined && typeof _centerX == "number")
            this.baseX = _centerX;

        if (_centerY != null && _centerY != undefined && typeof _centerY == "number")
            this.baseY = _centerY;

        this.emitWait++;

        if (this.emitWait > this.emitEvery) {
            this.PRM.createResource(this.createNewParticleSettings(_centerX, _centerY));
            this.emitWait = 0;
        }


        var particle = null;

        for (var i = 0; i < this.PRM.activeResources.length; i++) {

            particle = this.PRM.activeResources[i];

            particle.update(this.gravity);

            // check if this particle has left the stage
            if (particle.vector.x < (this.width * -2) || particle.vector.x > this.maxWidth + (this.width * 2) ||
                particle.vector.y < (this.height * -2) || particle.vector.y > this.maxHeight + (this.height * 2)) {

                this.PRM.killResource(particle);
            }
        }
    }

    this.changeScale = function (newScale) {

        this.scale = this.settings.scale = newScale;
        this.emitVelocitySettings.scale = this.scale;
        this.emitAlphaSettings.scale = this.scale;
        this.emitScaleSettings.scale = this.scale;
        this.emitRotationSettings.scale = this.scale;

        for (var i = 0; i < this.PRM.activeResources.length; i++)
            this.PRM.activeResources[i].changeScale(this.scale);

        for (var i = 0; i < this.PRM.inactiveResources.length; i++)
            this.PRM.inactiveResources[i].changeScale(this.scale);
    }

    this.getImage = function (_frame) {

        if (this.images == null)
            return this.image;

        while (_frame > (this.particleSequenceFrames * this.particleSequenceDuration))
            _frame -= (this.particleSequenceFrames * this.particleSequenceDuration);

        return this.images[Math.ceil(_frame / this.particleSequenceDuration) - 1];
    }

    this.draw = function (_ctx) {

        if (!this.active)
            return;

        for (var i = 0; i < this.PRM.activeResources.length; i++)
            this.PRM.activeResources[i].draw(_ctx, this.getImage(this.PRM.activeResources[i].frame));
    }

    this.createNewParticleSettings = function () {

        var emitAngle = (this.emitAngleRange.getRandom() * (Math.PI / 180)) + this.emitAngleOffset;

        return {
            vectorManager: this.VRM,
            hyperValueManager: this.HVRM,
            x: this.baseX - (this.width / 2),
            y: this.baseY - (this.height / 2),
            angle: emitAngle,
            bounce: 0.9,
            friction: 0.9,
            scale: this.scale,
            maxFrames: this.maxFrames,
            emitVelocity: this.HVRM.getResource(this.emitVelocitySettings),
            emitAlpha: this.HVRM.getResource(this.emitAlphaSettings),
            emitScale: this.HVRM.getResource(this.emitScaleSettings),
            emitRotation: this.HVRM.getResource(this.emitRotationSettings)
        }
    }

    this.init();
}