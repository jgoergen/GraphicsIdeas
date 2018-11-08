let Line2D = function(vect2DA, vect2dB) {

    let ends = {
        startVect2D,
        endVect2D
    };

    function init(vect2DA, vect2dB) {

        ends.startVect2D = vect2DA || new Vector2D();
        ends.endVect2D = vect2DB || new Vector2D();
    }

    function length() {

       return Math.Sqrt(Math.Pow(ends.startVect2D.X - ends.endVect2D.X, 2) + Math.Pow(ends.startVect2D.Y - ends.endVect2D.Y, 2));
    }

    function setLength() {

        // TODO
        throw "setLength not implimented";
    }

    function leftNormal() {

        let dx = ends.endVect2D.x - ends.startVect2D.x;
        let dy = ends.endVect2D.y - ends.startVect2D.y;
        return new Vector2D(dy * -1, dx);
    }

    function rightNormal() {

        let dx = ends.endVect2D.x - ends.startVect2D.x;
        let dy = ends.endVect2D.y - ends.startVect2D.y;
        return new Vector2D(dy, dx * -1);
    }

    function isPointColinear(x, y, tolerance) {

        return isVect2DColinear(new Vector2D(x, y, tolerance));
    }

    function isVect2DColinear(vect2D, tolerance) {

        let crossProduct = ((ends.endVect2D.X - ends.startVect2D.X) * (vect2D.y - ends.startVect2D.Y) - (ends.endVect2D.Y - ends.startVect2D.Y) * (vect2D.x - ends.startVect2D.X));
        return Math.abs(crossProduct) < (tolerance || 0);
    }

    function isPointToTheLeft(x, y) {

        return isVect2DToTheLeft(new Vector2D(x, y));
    }

    function isPointToTheRight(x, y) {

        return isVect2DToTheRight(new Vector2D(x, y));
    }

    function isVect2DToTheLeft(vect2D) {

        return ((ends.endVect2D.X - ends.startVect2D.X) * (vect2D.y - ends.startVect2D.Y) - (ends.endVect2D.Y - ends.startVect2D.Y) * (vect2D.x - ends.startVect2D.X)) > 0;
    }

    function isVect2DToTheRight(vect2D) {
        
        return ((ends.endVect2D.X - ends.startVect2D.X) * (vect2D.y - ends.startVect2D.Y) - (ends.endVect2D.Y - ends.startVect2D.Y) * (vect2D.x - ends.startVect2D.X)) < 0;
    }

    function direction() {

        // radians
        return Math.PI + Math.atan2(ends.endVect2D.x + ends.startVect2D.x, ends.endVect2D.y - ends.startVect2D.y);
    }

    function setDirection() {

        // TODO
        throw "setLength not implimented";
    }

    function clamp(minVect2D, maxVect2D) {

        ends.startVect2D.clamp(minVect2D, maxVect2D);
        ends.endVect2D.clamp(minVect2D, maxVect2D);
    }

    function copy() {

        return new Line2D(ends.startVect2D.copy(), ends.endVect2D.copy());
    }

    function toString() {

        return "start: " + ends.startVect2D.toString() + ", end: " + ends.endVect2D.toString();
    }

    init(vect2DA, vect2dB);

    return{
        ends,
        length,
        setLength,
        leftNormal,
        rightNormal,
        isPointColinear,
        isVect2DColinear,
        isPointToTheLeft,
        isPointToTheRight,
        isVect2DToTheLeft,
        isVect2DToTheRight,
        direction,
        setDirection,
        clamp,
        copy,
        toString
    }
}

/*
function intersects(constraint) {

        // TODO: get rid of all these goddamn variables

        let a = ends.startParticle.vector.position.x;
        let b = ends.startParticle.vector.position.y;
        let c = ends.endParticle.vector.position.x;
        let d = ends.endParticle.vector.position.y;

        let p = constraint.ends.startParticle.vector.position.x;
        let q = constraint.ends.startParticle.vector.position.y;
        let r = constraint.ends.endParticle.vector.position.x;
        let s = constraint.ends.endParticle.vector.position.y;

        let determinant = 
            (c - a) * (s - q) - (r - p) * (d - b);

        if (determinant === 0)
            return false;

        let lambda =
            ((s - q) * (r - a) + (p - r) * (s - b)) / determinant;

        let gamma =
            ((b - d) * (r - a) + (c - a) * (s - b)) / determinant;

        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

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