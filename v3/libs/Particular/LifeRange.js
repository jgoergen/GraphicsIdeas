var LifeRange = function (_startNumber, _endNumber, _frames) {

    this.frames = _frames;
    this.startNumber = _startNumber || null;
    this.endNumber = _endNumber || null;

    this.frame = 0;

    this.getNextValue = function () {

        if (this.frame > this.frames)
            return this.highNumber;

        var returnVal = ((this.endNumber - this.startNumber) * (this.frame / this.frames)) + this.startNumber;
        this.frame++;

        return returnVal;
    }

    this.getFrameValue = function (_frame) {

        if (_frame > this.frames)
            return this.highNumber;

        var returnVal = ((this.endNumber - this.startNumber) * (_frame / this.frames)) + this.startNumber;

        //console.log("frame: " + _frame + " start: " + this.startNumber + " end: " + this.endNumber + " returning: " + returnVal);

        return returnVal;
    }

    this.reset = function () {

        this.frame = 0;
    }
}