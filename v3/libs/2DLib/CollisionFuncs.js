let CollisionFuncs = {

    PointAndCircle: function () {

    },

    CircleAndCircle: function () {

    },

    CircleCrossesLine: function (pointVect, circleRadius, lineStartVect, lineEndVect) {

        // https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
        d = lineEndVect.getSubtractedFromVector(lineStartVect);
        f = lineStartVect.getSubtractedFromVector(pointVect);
        a = d.dotProduct(d);
        b = 2 * f.dotProduct(d);
        discriminant = b * b - 4 * a * (f.dotProduct(f) - circleRadius * circleRadius);

        if (discriminant < 0) {

            return false;

        } else {

            discriminant = Math.sqrt(discriminant);
            t1 = (-b - discriminant) / (2 * a);
            t2 = (-b + discriminant) / (2 * a);

            if (t1 >= 0 && t1 <= 1)
                return true;

            if (t2 >= 0 && t2 <= 1)
                return true;

            return false;
        }
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