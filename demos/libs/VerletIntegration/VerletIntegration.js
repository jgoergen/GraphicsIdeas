let VerletIntegration = function(options) {

    let CIRCULAR_COLLISION_RESPONSE_DAMPENING = 0.2;
    let LINE_COLLISION_RESPONSE_DAMPENING = 0.2;

    let iterations = 6;
    let particles;
    let constraints;
    let gravity;
    let paused;
    let stageMinVect;
    let stageMaxVect;
    let speedLimitMinVect;
    let speedLimitMaxVect;
    let constraintSnapCallback;
    
    function init(options) {

        particles = [];
        paused = false;
        gravity = new Vector2D(0, 0.005);
        constraints = [];
        stageMinVect = new Vector2D(10, 10);
        stageMaxVect = new Vector2D(790, 490);
        speedLimitMinVect = new Vector2D(-4, -4);
        speedLimitMaxVect = new Vector2D(4, 4);

        if (options) {

            if (options.iterations)
                iterations = options.iterations;

            if (options.gravity)
                gravity = options.gravity;

            if (options.stageMinVect)
                stageMinVect = options.stageMinVect;

            if (options.stageMaxVect)
                stageMaxVect = options.stageMaxVect;

            if (options.speedLimitMinVect)
                speedLimitMinVect = options.speedLimitMinVect;

            if (options.speedLimitMaxVect)
                speedLimitMaxVect = options.speedLimitMaxVect;

            if (options.constraintSnapCallback)
                constraintSnapCallback = options.constraintSnapCallback;
        }
    }

    function addParticle(particle) {

        particles.push(particle);
    }

    function addConstraint (constraint) {

        constraints.push(constraint);
    }

    function runTimeStep(timeDelta) {

        if (!paused) {

			runVerlet(timeDelta);
			satisfyConstraints();
        }
    }

    function runVerlet(timeDelta) {

        // TODO
        // let timeDeltaSquare = Math.pow(timeDelta, 2);

        for (let i = 0; i < particles.length; i++) {

            // derive velocity
            let velocityVector = particles[i].vector.getSubtractedFrom(particles[i].lastVector);

            // apply gravity
            velocityVector.addTo(gravity);

            // limit speed
            // velocityVector.clamp(speedLimitMinVect, speedLimitMaxVect);

            // adjust for timestep delta
            // velocityVector.multiplyBy(timeDeltaSquare);

            // apply
			particles[i].lastVector = particles[i].vector.copy();	
            particles[i].vector.addTo(velocityVector);
		}
    }

    function satisfyConstraints() {
            
        // clamp to stage
        
        for (let i = 0; i < particles.length; i++)
            if (particles[i].radius)
                particles[i].vector.clamp(
                    stageMinVect.getAddedTo(particles[i].radius / 2),
                    stageMaxVect.getSubtractedFrom(particles[i].radius / 2));
            else
                particles[i].vector.clamp(
                    stageMinVect,
                    stageMaxVect); 

		for (let j = 0; j < iterations; j++) {

			runConstraints();
            runParticleCollisions();
            runLineCollisions();
			runPinning();
        }
    }
    
	function runConstraints() {

		for (let i = 0; i < constraints.length; i++) {
            
			// relationship constraints
			let deltaVector = constraints[i].ends.endParticle.vector.getSubtractedFrom(constraints[i].ends.startParticle.vector);
			let invmass1 = constraints[i].ends.startParticle.mass * -1;
			let invmass2 = constraints[i].ends.endParticle.mass * -1;
			let deltalength = deltaVector.magnitude();
			let diff = (deltalength - constraints[i].rest) / (deltalength * (invmass1 + invmass2));
			
            let addVect2 = deltaVector.getMultipliedBy(diff);
            
			// add mass calculation
			let addVect3 = addVect2;
			addVect2.multiplyBy(invmass2);
			
			// add stiffness calculation
            addVect3.multiplyBy(constraints[i].stiffness);
            addVect2.multiplyBy(constraints[i].stiffness);
			
			constraints[i].ends.startParticle.vector.addTo(addVect3);
            constraints[i].ends.endParticle.vector.subtractBy(addVect2);
            
            // snapping
            if (Math.abs(diff) > constraints[i].tolerance) {

                let removedConstraint = constraints.splice(i, 1);

                if (constraintSnapCallback)
                    constraintSnapCallback(removedConstraint[0]);
                
                i --;
            }
		}
    }

    function runParticleCollisions() {

        let totalRadius = 0;

        for (let i = 0; i < particles.length; i ++) {

            if (!particles[i].collides || particles[i].radius == 0)
                continue;

            for (let o = 0; o < particles.length; o ++) {

                if (!particles[o].collides || particles[o].radius == 0 || i == o)
                    continue;

                totalRadius = (particles[i].radius + particles[o].radius);

                // first pass check for speed
                if (Math.abs(particles[i].vector.x - particles[o].vector.x) > totalRadius ||
                    Math.abs(particles[i].vector.y - particles[o].vector.y) > totalRadius)
                    continue;

                let distance = particles[i].vector.distanceTo(particles[o].vector);
                if (distance <= totalRadius) {

                    let particleDifferenceVector2D = particles[o].vector.getSubtractedFrom(particles[i].lastVector);
                    particleDifferenceVector2D.normalize();
                    particleDifferenceVector2D.multiplyBy(CIRCULAR_COLLISION_RESPONSE_DAMPENING);
                    particles[i].vector.subtractBy(particleDifferenceVector2D);
                    particles[o].vector.addTo(particleDifferenceVector2D);
                }
            }
        }
    }
    
    function runLineCollisions() {

		for (let i = 0; i < particles.length; i++) {

            if (!particles[i].collides)
                continue;

			for (let o = 0; o < constraints.length; o++) {

				if (constraints[o].collides && particles[i].objectID != constraints[o].objectID && particles[i] != constraints[o].ends.startParticle && particles[i] != constraints[o].ends.endParticle) {

					if (CollisionFuncs.PointCrossesLine(
                        particles[i].vector,
                        constraints[o].ends.startParticle.vector,
                        constraints[o].ends.endParticle.vector)) {

                        let particleVelocityVect2D = particles[i].lastVector.getSubtractedFrom(particles[i].vector);
                        let lineStartParticleVelocityVect2D = constraints[o].ends.startParticle.lastVector.getSubtractedFrom(constraints[o].ends.startParticle.vector);
                        let lineEndParticleVelocityVect2D = constraints[o].ends.endParticle.lastVector.getSubtractedFrom(constraints[o].ends.endParticle.vector);

                        // TODO: figure out which end of line gets pushed and which gets pulled. fix collision response.

                        let startDifferenceVector2D = constraints[o].ends.startParticle.vector.getSubtractedFrom(particles[i].vector);
                        let endDifferenceVector2D = constraints[o].ends.endParticle.vector.getSubtractedFrom(particles[i].vector);

                        particleVelocityVect2D.normalize();
                        startDifferenceVector2D.normalize();
                        endDifferenceVector2D.normalize();

                        particles[i].vector = particles[i].lastVector.copy();
						constraints[o].ends.startParticle.vector.addTo(startDifferenceVector2D);
                        constraints[o].ends.endParticle.vector.addTo(endDifferenceVector2D);
                    }
				}
			}
		}
    }
    
    function runPinning() {

		for (let i = 0; i < particles.length; i++)
            if (particles[i].pinnedTo)
                particles[i].vector = particles[i].pinnedTo.copy();
	}

    init(options);

    return {
        gravity,
        particles,
        constraints,
        addParticle,
        addConstraint,
        runTimeStep
    }
}