let Vector2D = function(posX, posY) {

    // initialize
    this.NORMAL_TOLERANCE = 0.0001;
    this.x = posX || 0;
    this.y = posY || 0;
}

Vector2D.prototype.magnitude = function() {
        
    return Math.sqrt(
        this.x * this.x + 
        this.y * this.y);
}

Vector2D.prototype.setMagnitude = function(magnitude) {

    let direction = this.direction(); 
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
};

Vector2D.prototype.length = function() {

    return this.magnitude();
}

Vector2D.prototype.setLength = function(length) {

    this.setMagnitude(length);
}

Vector2D.prototype.distanceTo = function(vector2D) {
    
    return Math.sqrt(
        (vector2D.x - this.x) * 
        (vector2D.x - this.x) + 
        (vector2D.y - this.y) * 
        (vector2D.y - this.y));
}

Vector2D.prototype.normalize = function() {

    let mag = this.magnitude();
    
    if (mag <= this.NORMAL_TOLERANCE) 
    mag = 1;
    
    this.x /= mag;
    this.y /= mag;
    
    if (Math.abs(this.x) < this.NORMAL_TOLERANCE) 
        this.x = 0;

    if (Math.abs(this.y) < this.NORMAL_TOLERANCE) 
        this.y = 0;
}

Vector2D.prototype.getNormalized = function() {

    let mag = this.magnitude();
    
    if (mag <= this.NORMAL_TOLERANCE) 
        mag = 1;
    
    let x = this.x / mag;
    let y = this.y / mag;
    
    if (Math.abs(x) < this.NORMAL_TOLERANCE) 
        this.x = 0;

    if (Math.abs(y) < this.NORMAL_TOLERANCE) 
        this.y = 0;

    return new Vector(
        this.x / this.magnitude(), 
        this.y / this.magnitude());
}

Vector2D.prototype.getAddedTo = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        return new Vector2D(
            this.x + vect2DOrNumber,
            this.y + vect2DOrNumber);
        
    } else {

        return new Vector2D(
            this.x + vect2DOrNumber.x,
            this.y + vect2DOrNumber.y);
    }
}

Vector2D.prototype.getSubtractedFrom = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        return new Vector2D(
            this.x - vect2DOrNumber,
            this.y - vect2DOrNumber);
        
    } else {

        return new Vector2D(
            this.x - vect2DOrNumber.x,
            this.y - vect2DOrNumber.y);
    }
}

Vector2D.prototype.getMultipliedBy = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        return new Vector2D(
            this.x * vect2DOrNumber,
            this.y * vect2DOrNumber);
        
    } else {

        return new Vector2D(
            this.x * vect2DOrNumber.x,
            this.y * vect2DOrNumber.y);
    }
}

Vector2D.prototype.getDividedBy = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        return new Vector2D(
            this.x / vect2DOrNumber,
            this.y / vect2DOrNumber);
        
    } else {

        return new Vector2D(
            this.x / vect2DOrNumber.x,
            this.y / vect2DOrNumber.y);
    }
}

Vector2D.prototype.addTo = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        this.x += vect2DOrNumber;
        this.y += vect2DOrNumber;
        
    } else {

        this.x += vect2DOrNumber.x;
        this.y += vect2DOrNumber.y;
    }
}

Vector2D.prototype.subtractBy = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        this.x -= vect2DOrNumber;
        this.y -= vect2DOrNumber;
        
    } else {

        this.x -= vect2DOrNumber.x;
        this.y -= vect2DOrNumber.y;
    }
}

Vector2D.prototype.multiplyBy = function(vect2DOrNumber) {

    if (typeof vect2DOrNumber === "number") {

        this.x *= vect2DOrNumber;
        this.y *= vect2DOrNumber;
        
    } else {

        this.x *= vect2DOrNumber.x;
        this.y *= vect2DOrNumber.y;
    }
}

Vector2D.prototype.divideBy = function(num) {

    if (typeof vect2DOrNumber === "number") {

        this.x /= vect2DOrNumber;
        this.y /= vect2DOrNumber;
        
    } else {

        this.x /= vect2DOrNumber.x;
        this.y /= vect2DOrNumber.y;
    }
}

Vector2D.prototype.dotProduct = function(vect2D) {

    return this.x * vect2D.x + 
        this.y * vect2D.y;
}

Vector2D.prototype.crossProduct = function(vect2D) {

    return this.x * vect2D.y - 
        vect2D.x * this.y;
}

Vector2D.prototype.reverse = function() {
    
   this.x *= -1;
   this.y *= -1;
}

Vector2D.prototype.getReverse = function() {
    
    return new Vector2D(
        this.x * -1,
        this.y * -1);
}

Vector2D.prototype.direction = function() { // radians

    return Math.atan2(
        this.y, 
        this.x);
};

Vector2D.prototype.setDirection = function(angle) { // radians

    let magnitude = this.magnitude();

    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
};

Vector2D.prototype.clamp = function(minVect2D, maxVect2D) {

    // limit minimum

    if (minVect2D) {

        if (this.x < minVect2D.x)
            this.x = minVect2D.x;

        if (this.y < minVect2D.y)
            this.y = minVect2D.y;
    }
    
    // limit maximum
    
    if (maxVect2D) {
        
        if (this.x > maxVect2D.x)
            this.x = maxVect2D.x;

        if (this.y > maxVect2D.y)
            this.y = maxVect2D.y;
    }
}

Vector2D.prototype.toString = function() {
    
    return "x:" + this.x + ", y:" + this.y;
}

Vector2D.prototype.copy = function() {

    return new Vector2D(
        this.x,
        this.y);
}

/*
bool tri2d::inTriangle(vec2d pt) {
    float AB = (pt.y-p1.y)*(p2.x-p1.x) - (pt.x-p1.x)*(p2.y-p1.y);
    float CA = (pt.y-p3.y)*(p1.x-p3.x) - (pt.x-p3.x)*(p1.y-p3.y);
    float BC = (pt.y-p2.y)*(p3.x-p2.x) - (pt.x-p2.x)*(p3.y-p2.y);

    if (AB*BC>0.f && BC*CA>0.f)
        return true;
    return false;    
}
*/