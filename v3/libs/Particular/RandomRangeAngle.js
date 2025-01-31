var RandomRangeAngle = function (_lowNumber, _highNumber) {

    this.lowNumber = _lowNumber;
    this.highNumber = _highNumber;
}

RandomRangeAngle.prototype.lowNumber = 0;
RandomRangeAngle.prototype.highNumber = 0;

RandomRangeAngle.prototype.getRandom = function () {

    if (this.lowNumber == this.highNumber)
        return this.lowNumber;

    return ((Math.random() * (this.highNumber - this.lowNumber)) + this.lowNumber);
}

RandomRangeAngle.prototype.getRandomInt = function () {

    return Math.floor(this.getRandom());
}