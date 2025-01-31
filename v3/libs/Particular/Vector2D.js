var Vector = function (_settings) {

    if (_settings != null)
        this.init(_settings);
}

Vector.prototype.x = 0;
Vector.prototype.y = 0;
Vector.prototype.vX = 0;
Vector.prototype.vY = 0;
Vector.prototype.bounce = 0;
Vector.prototype.friction = 0;
Vector.prototype.mass = 0;
Vector.prototype.angle = 0;
Vector.prototype.velocity = 0;

Vector.prototype.init = function (_settings) {

    this.x = _settings.x || 0;
    this.y = _settings.y || 0;

    this.vX = _settings.vX || 0;
    this.vY = _settings.vY || 0;

    this.bounce = _settings.bounce || 0.99;
    this.friction = _settings.friction || 0.99;
    this.mass = _settings.mass || 1;
    this.angle = _settings.angle || 0;
    this.velocity = _settings.velocity || 0;
}

Vector.prototype.cleanup = function () {

}

Vector.prototype.update = function () {

    this.x += this.vX;
    this.y += this.vY;

    this.vX *= this.friction;
    this.vY *= this.friction;
}

Vector.prototype.updatePolar = function () {

    this.vX = this.velocity * Math.cos(this.angle);
    this.vY = this.velocity * Math.sin(this.angle);

    this.x += this.vX;
    this.y += this.vY;

    this.velocity *= this.friction;
}

Vector.prototype.getLength = function () {

    return Math.sqrt(this.vX * this.vX + this.vY * this.vY);
}

Vector.prototype.setLength = function (_length) {

    var angle = this.getAngle();

    this.vX = _length * Math.cos(angle);
    this.vY = _length * Math.sin(angle);
}

Vector.prototype.getAngle = function () {

    return Math.atan2(vy, vx);
}

Vector.prototype.setAngle = function (_angle) {

    var length = this.getLength();

    this.vX = length * Math.cos(_angle);
    this.vY = length * Math.sin(_angle);
}

Vector.prototype.getRightNormal = function () {

    var normalized = this.getNormalized();

    return {
        x: (normalized.y * -1),
        y: (normalized.x)
    }
}

Vector.prototype.getLeftNormal = function () {

    var normalized = this.getNormalized();

    return {
        x: (normalized.y),
        y: (normalized.x * -1)
    }
}

Vector.prototype.getNormalized = function () {

    var length = this.getLength();

    if (length > 0) {

        return {
            x: (this.vX / length),
            y: (this.vY / length)
        }
    } else {

        return {
            x: 0,
            y: 0
        }
    }
}