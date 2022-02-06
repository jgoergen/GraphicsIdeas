var RandomRange = function (_lowNumber, _highNumber) {

    this.lowNumber = _lowNumber;
    this.highNumber = _highNumber;

    this.getRandom = function () {

        if (this.lowNumber == this.highNumber)
            return this.lowNumber;

        return ((Math.random() * (this.highNumber - this.lowNumber)) + this.lowNumber);
    }

    this.getRandomInt = function () {

        return Math.floor(this.getRandom());
    }
}