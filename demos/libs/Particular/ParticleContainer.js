var ParticleContainer = function (_settings) {

    this.particleSystems = null;
    this.particleSystemExtraData = null;
    this.emitAngleRange = null;
    this.maxSystems = 10;
    this.emitEvery = 0;
    this.lastEmit = 0;
    this.hyperValueManager = null;
    this.baseX = 0;
    this.baseY = 0;
    this.stageWidth = 0;
    this.stageHeight = 0;
    this.settings = null;
    this.particleSettings = null;

    if (_settings != null)
        this.init(_settings);
}

ParticleContainer.prototype.maxFrames = 0;
ParticleContainer.prototype.frame = 0;

ParticleContainer.prototype.init = function (_settings) {

    this.settings = _settings;

    this.baseX = _settings.baseX;
    this.baseY = _settings.baseY;
    this.hyperValueManager = new ResourceManager(HyperValue, 600, true, 60);
    this.particleSystemExtraData = new Array();
    this.emitAngleRange = new RandomRangeAngle(_settings.emitAngleRange.low, _settings.emitAngleRange.high);
    this.maxFrames = _settings.maxFrames;
    this.status = 0;
    this.frame = 0;
    this.stageWidth = _settings.stageWidth;
    this.stageHeight = _settings.stageHeight;
    this.emitEvery = _settings.emitEvery;

    // prepare the max number of particles to be used.
    this.maxSystems = _settings.maxSystems;
    this.particleSettings = _settings.particleSettings;

    var baseImage = new Image();
    baseImage.src = _settings.baseImageDirectory + this.particleSettings.particleImagePath;
    baseImage.onload = this.setupParticleSystems();
}

ParticleContainer.prototype.setupParticleSystems = function () {

    this.particleSystems = new Array();
    this.particleSystemExtraData = new Array();

    for (var i = 0; i < this.maxSystems; i++) {

        this.particleSystems.push(this.generateNewParticleSystem(this.particleSettings));
        this.particleSystemExtraData.push(
            {
                x: 0,
                y: 0,
                emitVelocityRange: this.hyperValueManager.getResource(this.settings.emitVelocitySettings),
                angle: 0
            });
    }
}

ParticleContainer.prototype.generateNewParticleSystem = function (_settings, _image) {

    var emitAngleRange = new RandomRange(_settings.emitAngleRange.low, _settings.emitAngleRange.high);
    var emitVelocitySettings = _settings.emitVelocitySettings;
    var emitAlphaSettings = _settings.emitAlphaSettings;
    var emitScaleSettings = _settings.emitScaleSettings;
    var emitRotationSettings = _settings.emitRotationSettings;
    var filterValSettings = _settings.filterValSettings;
    var filterFunc = _settings.filterFunc;

    var baseImage = new Image();
    baseImage.src = baseImageDirectory + _settings.particleImagePath;

    var tintColor = _settings.tintColor;
    var tintAmount = _settings.tintAmount;

    if (parseFloat(tintAmount) > 0)
        baseImage.src = ImageUtilities.tintImage(baseImage, tintColor, parseFloat(tintAmount));

    var particleSequenceFrameWidth = _settings.particleSequenceFrameWidth;
    var particleSequenceFrameHeight = _settings.particleSequenceFrameHeight;
    var particleSequenceFrames = _settings.particleSequenceFrames;
    var particleSequenceDuration = _settings.particleSequenceDuration;
    var particleSequenceBGReplace = _settings.particleSequenceBGReplace;

    var baseSettings = {
        tintColor: _settings.tintColor,
        tintAmount: _settings.tintAmount,
        gravity: _settings.gravity,
        baseX: _settings.baseX,
        baseY: _settings.baseY,
        maxFrames: _settings.maxFrames,
        particleImagePath: _settings.particleImagePath,
        particleSequenceFrameWidth: particleSequenceFrameWidth,
        particleSequenceFrameHeight: particleSequenceFrameHeight,
        particleSequenceFrames: particleSequenceFrames,
        particleSequenceDuration: particleSequenceDuration,
        particleSequenceBGReplace: particleSequenceBGReplace,
        image: baseImage,
        emitRate: _settings.emitRate,
        emitAngleRange: emitAngleRange,
        emitVelocitySettings: emitVelocitySettings,
        filterValSettings: filterValSettings,
        filterFunc: filterFunc,
        emitAlphaSettings: emitAlphaSettings,
        emitScaleSettings: emitScaleSettings,
        emitRotationSettings: emitRotationSettings,
        particleUpdateRate: _settings.particleUpdateRate,
        stageWidth: _settings.stageWidth,
        stageHeight: _settings.stageHeight,
        emitterFrames: _settings.emitterFrames,
        emitEvery: _settings.emitEvery
    }

    var newParticleSystem = new ParticleSystem(baseSettings);
    newParticleSystem.active = false;

    return newParticleSystem;
}

ParticleContainer.prototype.cleanup = function () {

    this.vectorManager.killResource(this.vector);
    this.vectorManager.killResource(this.initialVectorState);
    this.hyperValueManager.killResource(this.emitVelocityRange);
    this.hyperValueManager.killResource(this.emitRotationRange);
}

ParticleContainer.prototype.runFull = function () {

    this.reset();

    for (var o = 0; o < 110; o++)
        this.update();
}

ParticleContainer.prototype.draw = function (ctx) {

    for (var i = 0; i < this.particleSystems.length; i++)
        this.particleSystems[i].draw(ctx);
}

ParticleContainer.prototype.update = function () {

    this.frame++;

    if (this.frame > (this.lastEmit + this.emitEvery)) {

        this.lastEmit = this.frame;

        // find an open, or the oldest particle and reset it

        var newSystemIndex = -1;

        for (var i = 0; i < this.particleSystems.length; i++) {

            if (this.particleSystems[i].active == false) {

                newSystemIndex = i;
                break;
            }
        }

        // find the oldest and replace it

        if (newSystemIndex == -1) {

            var oldestFrames = 0;

            for (var i = 0; i < this.particleSystems.length; i++) {

                if (this.particleSystems[i].frame > oldestFrames) {

                    newSystemIndex = i;
                    oldestFrames = this.particleSystems[i].frame;
                }
            }
        }

        this.particleSystemExtraData[newSystemIndex] =
        {
            x: this.baseX,
            y: this.baseY,
            angle: this.emitAngleRange.getRandom(),
            emitVelocityRange: this.hyperValueManager.getResource(this.settings.emitVelocitySettings)
        };

        this.particleSystemExtraData[newSystemIndex].emitVelocityRange.reset();

        this.particleSystems[newSystemIndex].init();
    }

    // update all particles

    for (var i = 0; i < this.particleSystems.length; i++) {

        if (this.particleSystems[i].active == true) {

            var velocity = this.particleSystemExtraData[i].emitVelocityRange.getFrameValue(this.frame);

            // update extra data
            var vX = velocity * Math.cos(this.particleSystemExtraData[i].angle);
            var vY = velocity * Math.sin(this.particleSystemExtraData[i].angle);

            this.particleSystemExtraData[i].x += vX;
            this.particleSystemExtraData[i].y += vY;

            this.particleSystems[i].runStep(this.particleSystemExtraData[i].x, this.particleSystemExtraData[i].y);
        }
    }
}

ParticleContainer.prototype.reset = function () {

    for (var i = 0; i < this.particleSystems.length; i++) {

        this.particleSystems[i].init();
        this.particleSystems[i].active = false;
    }

    this.frame = 0;
}

ParticleContainer.prototype.jumpToFrame = function (_frameNumber) {

    if (_frameNumber > this.frame) {

        var updatesLeft = (_frameNumber - this.frame);

        for (var i = 0; i < updatesLeft; i++)
            this.update();

    } else {

        this.reset();
        this.frame = 0;

        for (var i = 0; i < _frameNumber; i++)
            this.update();
    }
}