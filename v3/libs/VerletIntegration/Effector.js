let Effector = function (options) {

    // initialize
    this.vector = options.vector;
    this.data = options.data || {};
    this.force = options.force || 0;
    this.radius = options.radius || 1;
    this.pinToMouse = options.pinToMouse || false;
}