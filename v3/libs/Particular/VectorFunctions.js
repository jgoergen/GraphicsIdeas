var VectorFunctions = {

    IsParrallel: function (_vector1, _vector2) {

        var vect1Normalized = _vector1.getNormalized();
        var vect2Normalized = _vector2.getNormalized();

        // parrallel
        if (vect1Normalized.x == vect2Normalized.x && vect1Normalized.y == vect2Normalized.y)
            return true;

        // parrallel in opposite direction
        if (vect1Normalized.x == (vect2Normalized.x * -1) && vect1Normalized.y == vect2Normalized.y)
            return true;

        return false;
    },

    GetAngleBetweenVectors: function (_vector1, _vector2) {

        // returned in degrees

        var xDif = 0;
        var yDif = 0;

        if (_vector1.y > _vector2.y)
            yDif = _vector1.y - _vector2.y;
        else
            yDif = _vector2.y - _vector1.y;

        if (_vector1.x > _vector2.x)
            xDif = _vector1.x - _vector2.x;
        else
            xDif = _vector2.x - _vector1.x;

        return Math.atan(yDif / xDif) * 180 / Math.PI;
    },

    GetPerp: function (_vector1, _vector2) {

        return ((_vector2.vX * _vector1.vY) - (_vector2.vY * _vector1.vX));
    },

    Projection: function (_vector1, _vector2) {

        var dotProduct = this.GetDotProduct(_vector1, _vector2);
        var vect2Normalized = _vector2.getNormalized();

        return new Vector(0,
            0,
            (dotProduct * vect2Normalized.x),
            (dotProduct * vect2Normalized.y));
    },

    Projection2: function (_vector, _dx, _dy) {

        var dotProduct = (_vector.vX * _dx + _vector.vY * _dy);
        return new Vector(0,
            0,
            (dotProduct * _dx),
            (dotProduct * _dy));
    },

    DotProduct: function (_vector1, _vector2) {

        return (_vector1.vX * _vector2.vX + _vector1.vY * _vector2.vY);
        // positive = both vectors point in the same direction.
        // negative = both vectors point in opposit directions.
    },

    DoRoundCollision: function (_vector1, _vector2) {

        var tempVect = new Vector();
        tempVect.vX = (_vector1.x - _vector2.x);
        tempVect.vY = (_vector1.y - _vector2.y);
        tempVect.setLength(1);

        var a1 = this.DotProduct(_vector1, tempVect);
        var a2 = this.DotProduct(_vector2, tempVect);

        var optimizedP = (2 * (a1 - a2)) / (_vector1.mass + _vector2.mass);

        var tempVect2 = new Vector();
        tempVect2.vX = _vector1.vX - optimizedP * _vector2.mass * tempVect.vX;
        tempVect2.vY = _vector1.vY - optimizedP * _vector2.mass * tempVect.vY;

        var tempVect3 = new Vector();
        tempVect3.vX = _vector2.vX + optimizedP * _vector1.mass * tempVect.vX;
        tempVect3.vY = _vector2.vY + optimizedP * _vector1.mass * tempVect.vY;

        _vector1.vX = tempVect2.vX;
        _vector1.vY = tempVect2.vY;
        _vector2.vX = tempVect3.vX;
        _vector2.vY = tempVect3.vY;
    },

    DoFlatCollision: function (_vector1, _vector2) {

        // vector 2 is considered a wall
        // bouncieness and friction is applied as well, default = 1 for both which makes it a perfect 'lossless' collision.

        var vect2Normalized = _vector2.getNormalized();
        var vect2LeftNormal = _vector2.getLeftNormal();

        var dotProduct = _vector1.vX * vect2Normalized.x + _vector1.vY * vect2Normalized.y;

        var proj1VX = dotProduct * vect2Normalized.x;
        var proj1VY = dotProduct * vect2Normalized.y;

        var dotProduct2 = _vector1.vX * vect2LeftNormal.x + _vector1.vY * vect2LeftNormal.y;
        var proj2VX = dotProduct2 * vect2LeftNormal.x;
        var proj2VY = dotProduct2 * vect2LeftNormal.y;

        proj2VX *= -1;
        proj2VY *= -1;

        _vector1.vX = _vector1.friction * _vector2.friction * proj1VX + _vector1.bounce * _vector2.bounce * proj2VX;
        _vector1.vY = _vector1.friction * _vector2.friction * proj1VY + _vector1.bounce * _vector2.bounce * proj2VY;
    },

    FindIntersection: function (_vector1, _vector2) {

        var returnVect = new Vector();

        var v3VX = _vector1.x - _vector2.x;
        var v3VY = _vector1.y - _vector2.y;

        returnVect.vX = v3VX;
        returnVect.vY = v3VY;

        var vect2LeftNormal = _vector2.getLeftNormal();

        return this.Projection2(returnVect, vect2LeftNormal.x, vect2LeftNormal.y);
    },

    GetDistanceToIntersection: function (_vector1, _vector2) {

        // extremely optomized & stripped down.
        var vect2LeftNormal = _vector2.getLeftNormal();
        var dotProduct = (_vector1.x - _vector2.x) * vect2LeftNormal.x + (_vector1.y - _vector2.y) * vect2LeftNormal.y;
        return Math.sqrt((dotProduct * vect2LeftNormal.x) * (dotProduct * vect2LeftNormal.x) + (dotProduct * vect2LeftNormal.y) * (dotProduct * vect2LeftNormal.y));
    }
}