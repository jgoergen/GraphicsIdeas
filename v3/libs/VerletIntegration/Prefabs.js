let Prefabs = {

    Rope: function (verlet, startX, startY, links, linkLength, elasticity, pinFirst) {

        let lastParticle = null;

        for (var i = 0; i < links; i++) {

            let pin =
                (!lastParticle && pinFirst) ?
                    new Vector2D(startX, startY) :
                    null;

            let particle =
                new Particle({
                    vector: new Vector2D(startX, startY),
                    pinnedTo: pin
                });

            verlet.addParticle(particle);

            if (lastParticle)
                verlet.addConstraint(
                    new Constraint({
                        startParticle: particle,
                        endParticle: lastParticle,
                        stiffness: elasticity,
                        tolerance: null,
                        collides: false,
                        objectID: Math.floor(Math.random() * 100000),
                        data: { drawn: true }
                    }));

            startX += linkLength;
            lastParticle = particle;
        }
    },

    Box: function (verlet, x, y, width, height, rotationDegrees, collides, stiffness, objectID) {

        let particle1 =
            new Particle({
                vector: new Vector2D(
                    x,
                    y),
                objectID: objectID
            });

        let particle2 =
            new Particle({
                vector: new Vector2D(
                    MathHelperFunctions.RotatePoint(x, y, x + width, y, rotationDegrees)[0],
                    MathHelperFunctions.RotatePoint(x, y, x + width, y, rotationDegrees)[1]),
                objectID: objectID
            });

        let particle3 =
            new Particle({
                vector: new Vector2D(
                    MathHelperFunctions.RotatePoint(x, y, x + width, y + height, rotationDegrees)[0],
                    MathHelperFunctions.RotatePoint(x, y, x + width, y + height, rotationDegrees)[1]),
                objectID: objectID
            });

        let particle4 =
            new Particle({
                vector: new Vector2D(
                    MathHelperFunctions.RotatePoint(x, y, x, y + height, rotationDegrees)[0],
                    MathHelperFunctions.RotatePoint(x, y, x, y + height, rotationDegrees)[1]),
                objectID: objectID
            });

        verlet.addParticle(particle1);
        verlet.addParticle(particle2);
        verlet.addParticle(particle3);
        verlet.addParticle(particle4);

        let constraint1 =
            new Constraint({
                startParticle: particle1,
                endParticle: particle2,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: collides,
                data: { drawn: true }
            });

        verlet.addConstraint(constraint1);

        let constraint2 =
            new Constraint({
                startParticle: particle2,
                endParticle: particle3,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: collides,
                data: { drawn: true }
            });

        verlet.addConstraint(constraint2);

        let constraint3 =
            new Constraint({
                startParticle: particle3,
                endParticle: particle4,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: collides,
                data: { drawn: true }
            });

        verlet.addConstraint(constraint3);

        let constraint4 =
            new Constraint({
                startParticle: particle4,
                endParticle: particle1,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: collides,
                data: { drawn: true }
            });

        verlet.addConstraint(constraint4);
        verlet.addBody(new Body({
            edges: [
                constraint1,
                constraint2,
                constraint3,
                constraint4
            ],
            collides: true
        }));

        verlet.addConstraint(
            new Constraint({
                startParticle: particle1,
                endParticle: particle3,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: false
            }));

        verlet.addConstraint(
            new Constraint({
                startParticle: particle2,
                endParticle: particle4,
                stiffness: stiffness,
                tolerance: null,
                objectID: objectID,
                collides: false
            }));
    },

    Triangle: function (verlet, startX, startY, size, elasticity, objectIndex) {

        let particle1 =
            new Particle({
                vector: new Vector2D(startX, startY)
            });

        let particle2 =
            new Particle({
                vector: new Vector2D(startX + size, startY)
            });

        let particle3 =
            new Particle({
                vector: new Vector2D(startX, startY + size)
            });

        verlet.addParticle(particle1);
        verlet.addParticle(particle2);
        verlet.addParticle(particle3);

        let edge1 = new Constraint({
            startParticle: particle1,
            endParticle: particle2,
            stiffness: 1,
            collides: true,
            objectID: objectIndex,
            data: { drawn: true }
        });

        let edge2 = new Constraint({
            startParticle: particle2,
            endParticle: particle3,
            stiffness: 1,
            collides: true,
            objectID: objectIndex,
            data: { drawn: true }
        });

        let edge3 = new Constraint({
            startParticle: particle3,
            endParticle: particle1,
            stiffness: 1,
            collides: true,
            objectID: objectIndex,
            data: { drawn: true }
        });

        verlet.addConstraint(edge1);
        verlet.addConstraint(edge2);
        verlet.addConstraint(edge3);

        verlet.addBody(new Body({
            edges: [
                edge1,
                edge2,
                edge3
            ],
            collides: true
        }));
    },

    Cloth: function (verlet, startX, startY, links, linkLength, elasticity, tolerance, pinCorners) {

        let particleArray = {};
        let xlinks = links * 2;

        for (var i = 0; i < xlinks; i++) {

            for (var o = 0; o < links; o++) {

                let pin =
                    (o == 0 && (i == 0 || i == (xlinks - 1))) ?
                        new Vector2D(startX + (i * linkLength), startY + (o * linkLength)) :
                        null;

                let particle =
                    new Particle({
                        vector: new Vector2D(
                            startX + (i * linkLength),
                            startY + (o * linkLength)),
                        pinnedTo: pin
                    });

                particleArray[i + "_" + o] = particle;

                verlet.addParticle(particle);

                if (i > 0)
                    verlet.addConstraint(
                        new Constraint({
                            startParticle: particle,
                            endParticle: particleArray[(i - 1) + "_" + o],
                            stiffness: elasticity,
                            tolerance: tolerance,
                            collides: true,
                            objectID: 0,
                            data: { drawn: (o % 4 === 0) || ((o == 0 || o == (links - 1))) ? true : false }
                        }));

                if (o > 0)
                    verlet.addConstraint(
                        new Constraint({
                            startParticle: particle,
                            endParticle: particleArray[i + "_" + (o - 1)],
                            stiffness: elasticity,
                            tolerance: tolerance,
                            collides: true,
                            objectID: 0,
                            data: { drawn: (i % 4 === 0) || ((i == 0 || i == (xlinks - 1))) ? true : false }
                        }));
            }
        }
    }
};