let Line2D = function (vect2DA, vect2DB) {

    // initialize
    this.ends = {
        startVect2D: vect2DA || new Vector2D(),
        endVect2D: vect2DB || new Vector2D()
    };
};

Line2D.prototype.length = function() {

    return Math.Sqrt(
        Math.Pow(this.ends.startVect2D.X - this.ends.endVect2D.X, 2) +
        Math.Pow(this.ends.startVect2D.Y - this.ends.endVect2D.Y, 2));
};

Line2D.prototype.setLength = function() {

    // TODO
    throw "setLength not implimented";
};

Line2D.prototype.leftNormal = function() {

    let dx = this.ends.endVect2D.x - this.ends.startVect2D.x;
    let dy = this.ends.endVect2D.y - this.ends.startVect2D.y;
    return new Vector2D(dy * -1, dx);
};

Line2D.prototype.rightNormal = function() {

    let dx = this.ends.endVect2D.x - this.ends.startVect2D.x;
    let dy = this.ends.endVect2D.y - this.ends.startVect2D.y;
    return new Vector2D(dy, dx * -1);
};

Line2D.prototype.crossProduct = function(vect2D) {

    return (
        (this.ends.endVect2D.X - this.ends.startVect2D.X) * (vect2D.y - this.ends.startVect2D.Y) -
        (this.ends.endVect2D.Y - this.ends.startVect2D.Y) * (vect2D.x - this.ends.startVect2D.X));
};

Line2D.prototype.isVect2DColinear = function(vect2D, tolerance) {

    if (!tolerance)
        tolerance = 0;

    return Math.abs(this.crossProduct(vect2D)) < tolerance;
};

Line2D.prototype.isVect2DToTheLeft = function(vect2D) {

    return this.crossProduct(vect2D) > 0;
};

Line2D.prototype.isVect2DToTheRight = function(vect2D) {

    return this.crossProduct(vect2D) < 0;
};

Line2D.prototype.direction = function() {

    // radians
    return Math.PI + Math.atan2(this.ends.endVect2D.x + this.ends.startVect2D.x, this.ends.endVect2D.y - this.ends.startVect2D.y);
};

Line2D.prototype.setDirection = function() {

    // TODO:
    throw "setLength not implimented";
};

Line2D.prototype.clamp = function(minVect2D, maxVect2D) {

    this.ends.startVect2D.clamp(minVect2D, maxVect2D);
    this.ends.endVect2D.clamp(minVect2D, maxVect2D);
};

// https://stackoverflow.com/questions/37224912/circle-line-segment-collision
// maybe try this instead? https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm

Line2D.prototype.CircleIntersects = function (vect2D, radius) {

    if (!radius)
        radius = 1;

    let v1 = this.endVect2D.getSubtractedFromVector(lineStartVect);
    let v2 = this.startVect2D.getSubtractedFromVector(vect2D);

    let b = v1.dotProduct(v2);
    let c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - radius * radius));

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
}

Line2D.prototype.GetCircleCollision = function(vect2D, radius) {

    // todo: shouldn't this take the circle radius into account?

    if (!radius)
        radius = 1;

    let lineDirection = this.startVect2D.getSubtractedFromVector(this.endVect2D).normalize();
    let pointToStart = vect2D.getSubtractedFromVector(this.startVect2D);
    let dot = pointToStart.dotProduct(lineDirection);
    let nearestPointOnLine = this.startVect2D.getAddedToScalar(lineDirection.getMultipliedByScalar(dot));
    let collisionVector = vect2D.getSubtractedFromVector(nearestPointOnLine).normalize();

    let t;

    if (Math.abs(this.startVect2D.x - this.endVect2D.x) > Math.abs(this.startVect2D.y - this.endVect2D.y))
        t = (vect2D.x - collisionVector.x - this.startVect2D.x) / (this.endVect2D.x - this.startVect2D.x);
    else
        t = (vect2D.y - collisionVector.y - this.startVect2D.y) / (this.endVect2D.y - this.startVect2D.y);

    let lambda = 1 / (t * t + (1 - t) * (1 - t));

    return {
        pointCollisionVector: collisionVector.getMultipliedByScalar(0.5),
        lineStartCollisionVector: collisionVector.getMultipliedByScalar(1 - t).multiplyByScalar(0.5).multiplyByScalar(lambda),
        lineEndCollisionVector: collisionVector.getMultipliedByScalar(t).multiplyByScalar(0.5).multiplyByScalar(lambda)
    };
};

Line2D.prototype.copy = function() {

    return new Line2D(
        this.ends.startVect2D.copy(), 
        this.ends.endVect2D.copy());
};

Line2D.prototype.toString = function() {

    return "start: " + this.ends.startVect2D.toString() + ", end: " + this.ends.endVect2D.toString();
};

/*
    // http://ericleong.me/research/circle-line/
    function closestPointOnIntersection (vect2D) {

        let A1 = ends.endParticle.vector.position.y - ends.startParticle.vector.position.y; 
        let B1 = ends.startParticle.vector.position.x - ends.endParticle.vector.position.x; 

        let C1 = 
            (ends.endParticle.vector.position.y - ends.startParticle.vector.position.y) * 
            ends.startParticle.vector.position.x + 
            (ends.startParticle.vector.position.x - ends.endParticle.vector.position.x) * 
            ends.startParticle.vector.position.y; 

        let C2 = -B1 * vect2D.position.x + A1 * vect2D.position.y; 
        let det = (A1 * A1) - (-B1 * B1); 
        let cx = 0; 
        let cy = 0; 

        if(det != 0) {

            cx = ((A1 * C1 - B1 * C2) / det); 
            cy = ((A1 * C2 - -B1 * C1) / det); 

        } else { 

            cx = vect2D.position.x; 
            cy = vect2D.position.y; 
        } 

        return new Vector2D(cx, cy);
    }
*/