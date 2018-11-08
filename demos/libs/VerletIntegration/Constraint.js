let Constraint = function(options) {

    // particle1, particle2, newStiffness, newTolerance, doesCollide, objID, extraData

    // initialize
    this.ends = {
        startParticle: options.startParticle,
        endParticle: options.endParticle
    };

    this.data = options.data || {};
    this.rest = this.ends.startParticle.vector.getSubtractedFrom(this.ends.endParticle.vector).magnitude();
    this.stiffness = options.stiffness || 1;
    this.tolerance = options.tolerance || 9999;
    this.collides = options.collides || false;
    this.objectID = options.objectID || null;
}