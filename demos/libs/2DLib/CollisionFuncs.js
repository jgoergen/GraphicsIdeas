let CollisionFuncs = {

    PointAndCircle: function() {

    },

    CircleAndCircle: function() {

    },

    PointCrossesLine: function(pointVect, lineStartVect, lineEndVect) {

        return CollisionFuncs.CircleCrossesLine(
            pointVect, 
            5,
            lineStartVect, 
            lineEndVect);
    },
    
    // https://stackoverflow.com/questions/37224912/circle-line-segment-collision
    // maybe try this instead? https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm

    CircleCrossesLine: function(pointVect, circleRadius, lineStartVect, lineEndVect) {
        
        let v1 = lineEndVect.getSubtractedFrom(lineStartVect);
        let v2 = lineStartVect.getSubtractedFrom(pointVect);

        let b = v1.dotProduct(v2);
        let c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circleRadius * circleRadius));
        
        // no intercept
        if(isNaN(d))
            return false;
            
        // these represent the unit distance of point one and two on the line
        let u1 = (b - d) / c;
        let u2 = (b + d) / c;

        if((u1 <= 1 && u1 >= 0))
            return true;

        if ((u2 <= 1 && u2 >= 0))
            return true;
            
        return false;
    },

    LineAndLine: function() {
        
    }
};