let Body = function (options) {

    // initialize
    this.edges = options.edges;
    this.data = options.data || {};
    this.collides = options.collides || false;
    this.mass = options.mass || 1;

    // find unique vertexes
    this.uniqueVectors = [];

    for (let i = 0; i < this.edges.length; i++) {

        if (!this.uniqueVectors.find((vector) => { return vector === this.edges[i].ends.startParticle.vector }))
            this.uniqueVectors.push(this.edges[i].ends.startParticle.vector);

        if (!this.uniqueVectors.find((vector) => { return vector === this.edges[i].ends.endParticle.vector }))
            this.uniqueVectors.push(this.edges[i].ends.endParticle.vector);
    }
}

Body.prototype.getCenter = function () {

    let centerX = 0;
    let centerY = 0;

    for (let i = 0; i < this.uniqueVectors.length; i++) {

        centerX += this.uniqueVectors[i].x;
        centerY += this.uniqueVectors[i].y;
    }

    return new Vector2D(
        centerX /= this.uniqueVectors.length,
        centerY /= this.uniqueVectors.length);
}

Body.prototype.getBounds = function () {

    let minX = 10000;
    let minY = 10000;
    let maxX = -10000;
    let maxY = -10000;

    for (let i = 0; i < this.uniqueVectors.length; i++) {

        minX = Math.min(minX, this.uniqueVectors[i].x, this.uniqueVectors[i].x);
        minY = Math.min(minY, this.uniqueVectors[i].y, this.uniqueVectors[i].y);
        maxX = Math.max(maxX, this.uniqueVectors[i].x, this.uniqueVectors[i].x);
        maxY = Math.max(maxY, this.uniqueVectors[i].y, this.uniqueVectors[i].y);
    }

    return [minX, minY, maxX, maxY];
}

Body.prototype.projectToAxis = function (axisVect) {

    let dotP = axisVect.dotProduct(this.uniqueVectors[0]);
    let min = dotP;
    let max = dotP;

    for (let i = 0; i < this.uniqueVectors.length; i++) {

        //Project the rest of the vertices onto the axis and extend 
        //the interval to the left/right if necessary
        dotP = axisVect.dotProduct(this.uniqueVectors[i]);
        min = Math.min(dotP, min);
        max = Math.max(dotP, max);
    }

    return [min, max];
}

Body.prototype.getCollision = function (body) {

    // initialize the length of the collision vector to a relatively large value
    let minDistance = 10000;
    let collisionAxis = null;
    let collisionEdge = null;
    let collisionVector = null;
    let collisionEdgeBody = null;
    let primaryBody = null;
    let secondaryBody = null;

    // just a fancy way of iterating through all of the edges of both bodies at once
    for (let i = 0; i < this.edges.length + body.edges.length; i++) {

        let edge;

        if (i < this.edges.length)
            edge = this.edges[i].ends;
        else
            edge = body.edges[i - this.edges.length].ends;

        // calculate the axis perpendicular to this edge and normalize it
        let axisVect =
            new Vector2D(
                edge.startParticle.vector.y - edge.endParticle.vector.y,
                edge.endParticle.vector.x - edge.startParticle.vector.x);

        axisVect.normalize();

        let projection1 = this.projectToAxis(axisVect);
        let projection2 = body.projectToAxis(axisVect);

        // calculate the distance between the two intervals - see below
        let distance =
            projection1[0] < projection2[0] ?
                projection2[0] - projection1[1] :
                projection1[0] - projection2[1];

        if (distance > 0) {

            // if the intervals don't overlap, return, since there is no collision
            return null;

        } else if (Math.abs(distance) < minDistance) {

            // if they do and it's the shortest distance so far, save this info for response
            minDistance = Math.abs(distance);
            collisionAxis = axisVect;
            collisionEdge = edge;
            collisionEdgeBody =
                i < this.edges.length ?
                    this :
                    body;
        }
    }

    primaryBody = this;
    secondaryBody = body;

    if (this === collisionEdgeBody) {

        primaryBody = body;
        secondaryBody = this;
    }

    // this is needed to make sure that the collision normal is pointing at B1
    let sign = Math.sign(
        collisionAxis.dotProduct(
            secondaryBody.getCenter()
                .getSubtractedFromVector(
                    primaryBody.getCenter())));

    // remember that the line equation is N*( R - R0 ). We choose B2->Center 
    // as R0; the normal N is given by the collision normal
    if (sign == 1)
        collisionAxis.reverse(); // reverse the collision normal if it points away from B1

    let smallestDistance = 10000;

    for (let i = 0; i < primaryBody.uniqueVectors.length; i++) {

        // measure the distance of the vertex from the line using the line equation
        let vertexDistance =
            collisionAxis.dotProduct(
                primaryBody.uniqueVectors[i].getSubtractedFromVector(
                    secondaryBody.getCenter()));

        // if the measured distance is smaller than the smallest distance reported 
        // so far, set the smallest distance and the collision vertex
        if (vertexDistance < smallestDistance) {

            smallestDistance = vertexDistance;
            collisionVector = primaryBody.uniqueVectors[i];
        }
    }

    // verlet is build around recalcing these things in multiple passes, so the response needs to be dulled
    // otherwise it appears 'jumpy'
    collisionAxis.multiplyByScalar(0.5)

    return {
        distance: minDistance,
        collisionVector: collisionAxis,
        edge: collisionEdge,
        edgeBody: collisionEdgeBody,
        vector: collisionVector,
        vectorBody: primaryBody
    };
}

Body.prototype.intervalDistance = function (minA, maxA, minB, maxB) {

    if (minA < minB)
        return minB - maxA;
    else
        return minA - maxB;
}