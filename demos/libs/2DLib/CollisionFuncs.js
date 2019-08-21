let CollisionFuncs = {

    PointAndCircle: function () {

    },

    CircleAndCircle: function () {

    },

    // https://stackoverflow.com/questions/37224912/circle-line-segment-collision
    // maybe try this instead? https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm

    CircleCrossesLine: function (pointVect, circleRadius, lineStartVect, lineEndVect) {

        if (!circleRadius)
            circleRadius = 1;

        let v1 = lineEndVect.getSubtractedFromVector(lineStartVect);
        let v2 = lineStartVect.getSubtractedFromVector(pointVect);

        let b = v1.dotProduct(v2);
        let c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circleRadius * circleRadius));

        // no intercept
        if (isNaN(d))
            return false;

        // these represent the unit distance of point one and two on the line
        let u1 = (b - d) / c;
        let u2 = (b + d) / c;

        if ((u1 <= 1 && u1 >= 0))
            return true;

        if ((u2 <= 1 && u2 >= 0))
            return true;

        return false;
    },

    GetCircleCrossingLineCollision: function (circleVector2D, circleRadius, lineStartVector, lineEndVector) {

        if (!circleRadius)
            circleRadius = 1;

        // todo: shouldn't this take the circle radius into account?

        let lineDirection = lineStartVector.getSubtractedFromVector(lineEndVector).normalize();
        let pointToStart = circleVector2D.getSubtractedFromVector(lineStartVector);
        let dot = pointToStart.dotProduct(lineDirection);
        let nearestPointOnLine = lineStartVector.getAddedToVector(lineDirection.getMultipliedByScalar(dot));
        let collisionVector = circleVector2D.getSubtractedFromVector(nearestPointOnLine).normalize();

        let t;

        if (Math.abs(lineStartVector.x - lineEndVector.x) > Math.abs(lineStartVector.y - lineEndVector.y))
            t = (circleVector2D.x - collisionVector.x - lineStartVector.x) / (lineEndVector.x - lineStartVector.x);
        else
            t = (circleVector2D.y - collisionVector.y - lineStartVector.y) / (lineEndVector.y - lineStartVector.y);

        let lambda = 1 / (t * t + (1 - t) * (1 - t));

        return {
            pointCollisionVector: collisionVector.getMultipliedByScalar(0.5),
            lineStartCollisionVector: collisionVector.getMultipliedByScalar(1 - t).multiplyByScalar(0.5).multiplyByScalar(lambda),
            lineEndCollisionVector: collisionVector.getMultipliedByScalar(t).multiplyByScalar(0.5).multiplyByScalar(lambda)
        };
    }
};