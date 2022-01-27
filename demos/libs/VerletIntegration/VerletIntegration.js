let VerletIntegration = function (options) {

    this.iterations = 2;
    this.particles;
    this.effectors;
    this.constraints;
    this.bodies;
    this.gravity;
    this.paused;
    this.stageMinVect;
    this.stageMaxVect;
    this.speedLimitMinVect;
    this.speedLimitMaxVect;
    this.constraintSnapCallback;
    this.useMass = false;
    this.stageFriction = 0;
    this.markCollides = false;
    this.maxCollideCound = 20;

    this.init = function (options) {

        this.particles = [];
        this.effectors = [];
        this.paused = false;
        this.gravity = new Vector2D(0, 0.005);
        this.constraints = [];
        this.bodies = [];
        this.stageMinVect = new Vector2D(10, 10);
        this.stageMaxVect = new Vector2D(790, 490);
        this.speedLimitMinVect = new Vector2D(-4, -4);
        this.speedLimitMaxVect = new Vector2D(4, 4);
        this.stageFriction = 0.001;
        this.markCollides = false;
        this.maxCollideCound = 20;

        if (options) {

            if (options.markCollides)
                this.markCollides = options.markCollides;

            if (options.maxCollideCound)
                this.maxCollideCound = options.maxCollideCound;

            if (options.iterations)
                this.iterations = options.iterations;

            if (options.gravity)
                this.gravity = options.gravity;

            if (options.stageMinVect)
                this.stageMinVect = options.stageMinVect;

            if (options.stageMaxVect)
                this.stageMaxVect = options.stageMaxVect;

            if (options.speedLimitMinVect)
                this.speedLimitMinVect = options.speedLimitMinVect;

            if (options.speedLimitMaxVect)
                this.speedLimitMaxVect = options.speedLimitMaxVect;

            if (options.constraintSnapCallback)
                this.constraintSnapCallback = options.constraintSnapCallback;

            if (options.useMass)
                this.useMass = options.useMass;

            if (options.stageFriction)
                this.stageFriction = options.stageFriction;
        }
    }

    this.addParticle = function (particle) {

        this.particles.push(particle);
    }

    this.addEffector = function (effector) {

        this.effectors.push(effector);
    }

    this.addConstraint = function (constraint) {

        this.constraints.push(constraint);
    }

    this.addBody = function (body) {

        this.bodies.push(body);
    }

    this.runTimeStep = function (timeDelta) {

        if (!this.paused) {

            this.runVerlet(timeDelta);
            this.satisfyConstraints();
        }
    }

    this.runVerlet = function (timeDelta) {

        // TODO
        // let timeDeltaSquare = Math.pow(timeDelta, 2);

        for (let i = 0; i < this.particles.length; i++) {
            if (this.markCollides && this.particles[i].data.collided > 0) {
                this.particles[i].data.collided -= 1;
            }

            // derive velocity
            let velocityVector = this.particles[i].vector.getSubtractedFromVector(this.particles[i].lastVector);

            // apply attractor influence
            for (let o = 0; o < this.effectors.length; o++) {

                const baDistX = this.particles[i].vector.x - this.effectors[o].vector.x;
                const baDistY = this.particles[i].vector.y - this.effectors[o].vector.y;

                if (Math.abs(baDistX) + Math.abs(baDistY) < this.effectors[o].radius) {

                    if (this.effectors[o].force < 0) {
                        velocityVector.addToVector(
                            new Vector2D(
                                (1 - (baDistX / this.effectors[o].radius)) * this.effectors[o].force,
                                (1 - (baDistY / this.effectors[o].radius)) * this.effectors[o].force
                            ));
                    }
                    else {
                        velocityVector.addToVector(
                            new Vector2D(
                                ((baDistX / this.effectors[o].radius)) * this.effectors[o].force,
                                ((baDistY / this.effectors[o].radius)) * this.effectors[o].force
                            ));
                    }
                }
            }

            // apply gravity
            velocityVector.addToVector(this.gravity);

            // limit speed
            velocityVector.clamp(this.speedLimitMinVect, this.speedLimitMaxVect);

            // adjust for timestep delta
            // velocityVector.multiplyBy(timeDeltaSquare);

            // apply stage friction
            velocityVector.multiplyByScalar(1 - this.stageFriction);

            // apply
            this.particles[i].lastVector = this.particles[i].vector.copy();
            this.particles[i].vector.addToVector(velocityVector);
        }
    }

    this.satisfyConstraints = function () {

        // clamp to stage
        for (let i = 0; i < this.particles.length; i++)
            if (this.particles[i].radius)
                this.particles[i].vector.clamp(
                    this.stageMinVect.getAddedToScalar(this.particles[i].radius),
                    this.stageMaxVect.getSubtractedFromScalar(this.particles[i].radius));
            else
                this.particles[i].vector.clamp(
                    this.stageMinVect,
                    this.stageMaxVect);

        for (let j = 0; j < this.iterations; j++) {

            this.runConstraints();
            this.runParticleCollisions();
            this.runParticleOnLineCollisions();
            this.runBodyCollisions();
            this.runPinning();
        }
    }

    this.runConstraints = function () {

        for (let i = 0; i < this.constraints.length; i++) {

            // relationship constraints
            let deltaVector = this.constraints[i].ends.startParticle.vector.getSubtractedFromVector(this.constraints[i].ends.endParticle.vector);
            let deltalength = deltaVector.magnitude();
            let diff;
            let invmass1;
            let invmass2;

            if (this.useMass) {

                invmass1 = this.constraints[i].ends.startParticle.mass * -1;
                invmass2 = this.constraints[i].ends.endParticle.mass * -1;
                diff = (this.constraints[i].rest - deltalength) / (deltalength * (invmass1 + invmass2));

            } else {

                deltaVector.normalize();
                diff = (this.constraints[i].rest - deltalength);
            }

            let addVect2 = deltaVector.getMultipliedByScalar(diff);
            let addVect3 = addVect2.copy();

            if (this.useMass)
                addVect2.multiplyBy(invmass2);

            // add stiffness calculation
            addVect3.multiplyByScalar(0.5).multiplyByScalar(this.constraints[i].stiffness);
            addVect2.multiplyByScalar(0.5).multiplyByScalar(this.constraints[i].stiffness);

            this.constraints[i].ends.startParticle.vector.addToVector(addVect3);
            this.constraints[i].ends.endParticle.vector.subtractByVector(addVect2);

            // snapping
            if (Math.abs(diff) > this.constraints[i].tolerance) {

                let removedConstraint = this.constraints.splice(i, 1);

                if (this.constraintSnapCallback)
                    this.constraintSnapCallback(removedConstraint[0]);

                i--;
            }
        }
    }

    this.runParticleCollisions = function () {

        let totalRadius = 0;

        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].collides || this.particles[i].radius == 0)
                continue;

            for (let o = 0; o < this.particles.length; o++) {

                if (!this.particles[o].collides || this.particles[o].radius == 0 || i == o)
                    continue;

                totalRadius = (this.particles[i].radius + this.particles[o].radius);

                // first pass check for speed
                if (Math.abs(this.particles[i].vector.x - this.particles[o].vector.x) > totalRadius * 2 ||
                    Math.abs(this.particles[i].vector.y - this.particles[o].vector.y) > totalRadius * 2)
                    continue;

                const distance = this.particles[i].vector.distanceTo(this.particles[o].vector);

                if (distance <= totalRadius) {

                    if (this.markCollides) {
                        if (this.particles[i].data.collided < this.maxCollideCound)
                            this.particles[i].data.collided += 1;

                        if (this.particles[o].data.collided < this.maxCollideCound)
                            this.particles[o].data.collided += 1;
                    }

                    let collisionVector = this.particles[i].vector.getSubtractedFromVector(this.particles[o].vector).divideByScalar(distance);
                    // verlet is built around recalcing these things in multiple passes, so the response needs to be dulled
                    // otherwise it appears 'jumpy'
                    collisionVector.multiplyByScalar(0.5);
                    let dot1 = this.particles[i].vector.getSubtractedFromVector(this.particles[i].lastVector).dotProduct(collisionVector);
                    let dot2 = this.particles[o].vector.getSubtractedFromVector(this.particles[o].lastVector).dotProduct(collisionVector);
                    let optimizedP = 0;

                    if (this.useMass) {
                        optimizedP = 2.0 * (dot1 - dot2) / (this.particles[i].mass + this.particles[o].mass);
                    }
                    else {
                        optimizedP = 2.0 * (dot1 - dot2);
                    }

                    collisionVector.getMultipliedByScalar(optimizedP);
                    this.particles[o].vector.subtractByVector(collisionVector.getMultipliedByScalar(this.particles[i].mass));
                    this.particles[i].vector.addToVector(collisionVector.getMultipliedByScalar(this.particles[o].mass));
                }
            }
        }
    }

    this.runBodyCollisions = function () {

        for (let i = 0; i < this.bodies.length; i++) {

            if (!this.bodies[i].collides)
                continue;

            for (let o = 0; o < this.bodies.length; o++) {

                if (i != o && this.bodies[o].collides) {

                    let collisionData = this.bodies[i].getCollision(this.bodies[o]);

                    if (collisionData) {

                        if (this.useMass) {

                            // slower but takes mass into account
                            let t = null;

                            if (Math.abs(collisionData.edge.startParticle.vector.x - collisionData.edge.endParticle.vector.x) >
                                Math.abs(collisionData.edge.startParticle.vector.y - collisionData.edge.endParticle.vector.y)) {

                                t = (collisionData.vector.x - collisionData.collisionVector.x - collisionData.edge.startParticle.vector.x) /
                                    (collisionData.edge.endParticle.vector.x - collisionData.edge.startParticle.vector.x);

                            } else {

                                t = (collisionData.vector.y - collisionData.collisionVector.y - collisionData.edge.startParticle.vector.y) /
                                    (collisionData.edge.endParticle.vector.y - collisionData.edge.startParticle.vector.y);
                            }

                            let lambda = 1 / (t * t + (1 - t) * (1 - t));
                            let edgeMass = t * collisionData.edgeBody.mass + (1 - t) * collisionData.edgeBody.mass;
                            let invCollisionMass = 1 / (edgeMass + collisionData.vectorBody.mass);
                            let ratio1 = collisionData.vectorBody.mass * invCollisionMass;
                            let ratio2 = edgeMass * invCollisionMass;

                            collisionData.edge.startParticle.vector.subtractByVector(collisionData.collisionVector.getMultipliedByScalar((1 - t) * ratio1 * lambda));
                            collisionData.edge.endParticle.vector.subtractByVector(collisionData.collisionVector.getMultipliedByScalar(t * ratio1 * lambda));
                            collisionData.vector.addToVector(collisionData.collisionVector.getMultipliedByScalar(ratio2));

                        } else {

                            // faster but ignores mass
                            let t;

                            if (Math.abs(collisionData.edge.startParticle.vector.x - collisionData.edge.endParticle.vector.x) > Math.abs(collisionData.edge.startParticle.vector.y - collisionData.edge.endParticle.vector.y))
                                t = (collisionData.vector.x - collisionData.collisionVector.x - collisionData.edge.startParticle.vector.x) / (collisionData.edge.endParticle.vector.x - collisionData.edge.startParticle.vector.x);
                            else
                                t = (collisionData.vector.y - collisionData.collisionVector.y - collisionData.edge.startParticle.vector.y) / (collisionData.edge.endParticle.vector.y - collisionData.edge.startParticle.vector.y);

                            let lambda = 1 / (t * t + (1 - t) * (1 - t));
                            collisionData.edge.startParticle.vector.subtractByVector(collisionData.collisionVector.getMultipliedByScalar(1 - t).multiplyByScalar(0.5).multiplyByScalar(lambda));
                            collisionData.edge.endParticle.vector.subtractByVector(collisionData.collisionVector.getMultipliedByScalar(t).multiplyByScalar(0.5).multiplyByScalar(lambda));
                            collisionData.vector.addToVector(collisionData.collisionVector.getMultipliedByScalar(0.5));
                        }
                    }
                }
            }
        }
    }

    this.runParticleOnLineCollisions = function () {

        // TODO: this should only be run on particles that are no connected to bodies!

        for (let i = 0; i < this.particles.length; i++) {

            if (!this.particles[i].collides)
                continue;

            for (let o = 0; o < this.constraints.length; o++) {

                if (this.constraints[o].collides &&
                    this.particles[i].objectID != this.constraints[o].objectID &&
                    this.particles[i] != this.constraints[o].ends.startParticle &&
                    this.particles[i] != this.constraints[o].ends.endParticle) {

                    if (CollisionFuncs.CircleCrossesLine(
                        this.particles[i].vector,
                        this.particles[i].radius,
                        this.constraints[o].ends.startParticle.vector,
                        this.constraints[o].ends.endParticle.vector)) {

                        let collisionData = CollisionFuncs.GetCircleCrossingLineCollision(
                            this.particles[i].vector,
                            this.particles[i].radius,
                            this.constraints[o].ends.startParticle.vector,
                            this.constraints[o].ends.endParticle.vector);

                        this.constraints[o].ends.startParticle.vector.subtractByVector(collisionData.lineStartCollisionVector);
                        this.constraints[o].ends.endParticle.vector.subtractByVector(collisionData.lineEndCollisionVector);
                        this.particles[i].vector.addToVector(collisionData.pointCollisionVector);
                    }
                }
            }
        }
    }

    this.runPinning = function () {

        for (let i = 0; i < this.particles.length; i++)
            if (this.particles[i].pinnedTo)
                this.particles[i].vector = this.particles[i].pinnedTo.copy();
    }

    this.init(options);
}