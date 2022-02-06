var Particle = function (_settings) {

    this.vector = null;
    this.initialVectorState = null;
    this.emitVelocity = null;
    this.emitAlpha = null;
    this.emitScale = null;
    this.emitRotation = null;
    this.filterVal = null;
    this.filterFunc = null;
    this.vectorManager = null;
    this.hyperValueManager = null;

    if (_settings != null)
        this.init(_settings);
}

Particle.prototype.maxFrames = 0;
Particle.prototype.frame = 0;
Particle.prototype.scale = 0;

Particle.prototype.init = function (_settings) {

    this.vectorManager = _settings.vectorManager;
    this.hyperValueManager = _settings.hyperValueManager;

    this.vector = this.vectorManager.getResource(
        {
            x: _settings.x,
            y: _settings.y,
            bounce: _settings.bounce,
            friction: _settings.friction,
            mass: 1,
            angle: _settings.angle,
            length: 0
        });

    this.initialVectorState = this.vectorManager.getResource(
        {
            x: _settings.x,
            y: _settings.y,
            bounce: _settings.bounce,
            friction: _settings.friction,
            mass: 1,
            angle: _settings.angle,
            length: 0
        });

    this.maxFrames = _settings.maxFrames;
    this.emitVelocity = _settings.emitVelocity;
    this.emitAlpha = _settings.emitAlpha;
    this.emitScale = _settings.emitScale;
    this.filterVal = _settings.filterVal;
    this.filterFunc = _settings.filterFunc;
    this.emitRotation = _settings.emitRotation;
    this.scale = _settings.scale || 1;
    this.status = 0;
    this.frame = 0;
}

Particle.prototype.cleanup = function () {

    this.vectorManager.killResource(this.vector);
    this.vectorManager.killResource(this.initialVectorState);
    this.hyperValueManager.killResource(this.emitVelocity);
    this.hyperValueManager.killResource(this.emitAlpha);
    this.hyperValueManager.killResource(this.emitScale);
    this.hyperValueManager.killResource(this.emitRotation);
    this.hyperValueManager.killResource(this.filterVal);
}

Particle.prototype.changeScale = function (newScale) {

    this.scale = newScale;

    if (this.emitVelocity)
        this.emitVelocity.changeScale(this.scale);

    if (this.emitAlpha)
        this.emitAlpha.changeScale(this.scale);

    if (this.emitScale)
        this.emitScale.changeScale(this.scale);

    if (this.emitRotation)
        this.emitRotation.changeScale(this.scale);

    if (this.filterVal)
        this.filterVal.changeScale(this.scale);
}

Particle.prototype.update = function (_gravity) {

    this.frame++;
    this.vector.velocity = this.emitVelocity.getFrameValue(this.frame);
    this.vector.updatePolar();

    if (_gravity != 0)
        this.vector.y += (this.vector.vY += (this.frame * _gravity));
}

Particle.prototype.draw = function (_ctx, _image) {

    var imageScale = this.emitScale.getFrameValue(this.frame);
    var newWidth = Math.floor(_image.width * imageScale);
    var newHeight = Math.floor(_image.height * imageScale);

    _ctx.save();
    _ctx.globalAlpha = this.emitAlpha.getFrameValue(this.frame);

    _ctx.translate(this.vector.x + (Math.floor(_image.height / 2) - (imageScale * Math.floor(_image.height / 2))),
        this.vector.y + (Math.floor(_image.width / 2) - (imageScale * Math.floor(_image.width / 2))));

    _ctx.translate(Math.floor(newWidth / 2),
        Math.floor(newHeight / 2));

    _ctx.rotate((this.emitRotation.getFrameValue(this.frame) / 360));

    _ctx.drawImage(_image, Math.floor(newWidth / 2) * -1, Math.floor(newHeight / 2) * -1, newWidth, newHeight);

    _ctx.restore();

}

Particle.prototype.reset = function () {

    this.vector = this.initialVectorState;
    this.emitVelocity.reset();
    this.emitAlpha.reset();
    this.emitScale.reset();
    this.emitRotation.reset();
    this.filterVal.reset();
}

Particle.prototype.jumpToFrame = function (_frameNumber) {

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