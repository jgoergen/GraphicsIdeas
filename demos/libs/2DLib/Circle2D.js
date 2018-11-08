let Circle2D = function(vect2D, rad) {

    // initialize
    this.vector = vect2D || new Vector2D();
    this.radius = rad || 0;
}

Circle2D.prototype.isPointInside = function(x, y) {

    return this.vector.distanceTo(new Vector2D(x, y)) < this.radius;
}

Circle2D.prototype.isVect2DInside = function(vect2D) {

    return this.vector.distanceTo(vect2D) < this.radius;
}

Circle2D.prototype.isCircleIntersecting = function(circle2D) {

    let distance = this.vector.distanceTo(circle2D.vector);
    return distance <= (this.radius + circle2D.radius); 
}

Circle2D.prototype.isCircleInside = function(circle2D) {

    let distance = this.vector.distanceTo(circle2D.vector);

    if (circle2D.radius >= this.radius && distance <= (circle2D.radius - this.radius))
        return true; // circle 1 inside circle 2
    else if (this.radius >= circle2D.radius && distance <= (this.radius - circle2D.radius))
        return true; // circle 2 inside circle 1
    else
        return false;
}

Circle2D.prototype.copy = function() {

    return new Circle2D(this.vector.copy(), this.radius);
}

Circle2D.prototype.toString = function() {

    return this.vector.toString() + ", r: " + this.radius;
}