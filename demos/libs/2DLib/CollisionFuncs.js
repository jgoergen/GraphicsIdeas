let CollisionFuncs = {

    RayCrossesLine: function(lineStartVector, lineEndVector, rayPositionVector, rayDirectionVector) {

        var x1 = lineStartVector.x;
        var y1 = lineStartVector.y;
        var x2 = lineEndVector.x;
        var y2 = lineEndVector.y;
        var x3 = rayPositionVector.x;
        var y3 = rayPositionVector.y;
        var x4 = x3 + rayDirectionVector.x;
        var y4 = y3 + rayDirectionVector.y;

        var denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (denominator === 0) {

            return null;
        }

        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

        if (t > 0 && t < 1 && u > 0) {

            return new Vector2D(
                x1 + t * (x2 - x1),
                y1 + t * (y2 - y1));

        } else {

            return null;
        }
    },

    LineCrossesLine: function(line1StartVector, line1EndVector, line2StartVector, line2EndVector) {

        var x1 = line1StartVector.x;
        var y1 = line1StartVector.y;
        var x2 = line1EndVector.x;
        var y2 = line1EndVector.y;
        var x3 = line2StartVector.x;
        var y3 = line2StartVector.y;
        var x4 = line2EndVector.x;
        var y4 = line2EndVector.y;

        var denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (denominator === 0) {

            return null;
        }

        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

        if (t > 0 && t < 1 && u > 0 && u < 1) {

            return new Vector2D(
                x1 + t * (x2 - x1),
                y1 + t * (y2 - y1));

        } else {

            return null;
        }
    },

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