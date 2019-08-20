var MathHelperFunctions = {

    IndexToXY: function (index, width) {

        return [
            Math.floor(index / width),
            index % width
        ];
    },

    XYToIndex: function (x, y, width) {

        return x * width + y;
    },

    WrapVal: function(val, lowerLimit, upperLimit) {

        while(val < lowerLimit || val > upperLimit) {

            if (val <= lowerLimit)
                val += upperLimit;

            if (val >= upperLimit)
                val -= upperLimit;
        }

        return val;
    }
};