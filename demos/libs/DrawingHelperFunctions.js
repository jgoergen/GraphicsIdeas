var DrawingHelperFunctions = {

    Circle: function (_ctx, _x, _y, _radius, _fillColor, _borderThickness, _borderColor) {

        _ctx.beginPath();
        _ctx.arc(_x, _y, _radius, 0, 2 * Math.PI, false);
        _ctx.fillStyle = _fillColor;
        _ctx.fill();
        _ctx.lineWidth = _borderThickness;
        _ctx.strokeStyle = _borderColor;
        _ctx.stroke();
    }
};