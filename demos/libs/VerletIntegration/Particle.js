let Particle = function(options) {

    // initialize
    this.vector = options.vector || new Vector2D();
    this.lastVector = this.vector.copy();
    this.mass = options.mass || 1;
    this.pinnedTo = options.pinnedTo || null;
    this.collides = options.collides || false;
    this.objectID = options.objectID || null;
    this.data = options.data || {};
    this.radius = options.radius || 0;
}

Particle.prototype.toString = function() {

    return this.vector.toString();
}