const values = {
    PARTICLE_SIZE: {
        Min: 1,
        Max: 4,
        TransitionFrames: 1,
        Ceiled: true,
        Index: 0
    },
    PARTICLE_COUNT: (v) => ({
        Min: 50 * (5 - v.PARTICLE_SIZE.Value),
        Max: 140 * (5 - v.PARTICLE_SIZE.Value),
        TransitionFrames: 1,
        Ceiled: true
    }),
    VISION_DISTANCE: {
        Min: (v) => 20,
        Max: (v) => 50,
        TransitionFrames: 1
    },
    DAMPENING: {
        Min: (v) => 0.1,
        Max: (v) => 0.999,
        TransitionFrames: 1
    },
    ATTRACTION_STRENGTH: {
        Min: (v) => 0.5,
        Max: (v) => 2,
        TransitionFrames: 1
    },
    COLORS: {
        Min: (v) => 3,
        Max: (v) => 18,
        TransitionFrames: 1,
        Ceiled: true,
    },
    COLLISSION_FORCE: {
        Min: (v) => 0.8,
        Max: (v) => 1.5,
        TransitionFrames: 1
    },
    MAX_SPEED: {
        Min: (v) => 2,
        Max: (v) => 6,
        TransitionFrames: 1
    },
    FRAME_BLEND: {
        Min: (v) => 0.1,
        Max: (v) => 0.5,
        TransitionFrames: 1
    },
    BLEND_MODE: {
        Array: [
            'source-over',
            'lighter',
            'multiply',
            'screen',
            'overlay',
            'darken',
            'lighten',
            'color-dodge',
            'color-burn',
            'hard-light',
            'soft-light',
            'difference',
            'exclusion'
        ],
    }
};

/////////////////////////////////////////////////////////
let colorOptions = [];
let particles = [];
let attractionMatrix = [];

const createParticle = (x, y, color) => {
    return {
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        color: color
    };
}

const init = async p => {
    p.ctx.lineWidth = 1;
    p.ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
    attractionMatrix = [];

    particles = [];
    colorOptions = [];

    for (let i = 0; i < p.values.COLORS.Value; i++) {
        const hslPosition = i * (360 / p.values.COLORS.Value);
        const color = `hsla(${hslPosition}, 100%, 50%, 1)`;
        colorOptions.push(color);

        for (let j = 0; j < p.values.PARTICLE_COUNT.Value; j++) {
            const particleX =
                (j % Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) * (CANVAS_WIDTH / Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) +
                (Math.random() * (CANVAS_WIDTH / Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) / 2);

            const particleY =
                Math.floor(j / Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) * (CANVAS_HEIGHT / Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) +
                (Math.random() * (CANVAS_HEIGHT / Math.ceil(Math.sqrt(p.values.PARTICLE_COUNT.Value))) / 2);

            particles.push(
                createParticle(
                    particleX,
                    particleY,
                    Math.floor(Math.random() * colorOptions.length)));
        }
    }

    for (let j = 0; j < colorOptions.length; j++) {
        const colorAttractions = [];
        for (let k = 0; k < colorOptions.length; k++) {
            colorAttractions.push((Math.random() * p.values.ATTRACTION_STRENGTH.Value) - (p.values.ATTRACTION_STRENGTH.Value / 2));
        }
        attractionMatrix.push(colorAttractions);
    }
}

const update = p => {
    //p.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    p.ctx.fillStyle = `rgba(0,0,0,${p.values.FRAME_BLEND.Value})`;
    p.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //p.ctx.globalCompositeOperation = p.values.BLEND_MODE.Value;

    for (let pi = 0; pi < particles.length; pi++) {
        const particle = particles[pi];

        doChecks(particle, particles, p);

        // limit velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > p.values.MAX_SPEED.Value) {
            particle.vx *= p.values.MAX_SPEED.Value / speed;
            particle.vy *= p.values.MAX_SPEED.Value / speed;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        applyCollisions(particle, particles, p);

        if (particle.x < 0) particle.x = CANVAS_WIDTH;
        if (particle.x > CANVAS_WIDTH) particle.x = 0;
        if (particle.y < 0) particle.y = CANVAS_HEIGHT;
        if (particle.y > CANVAS_HEIGHT) particle.y = 0;

        particle.vx *= p.values.DAMPENING.Value; // Damping
        particle.vy *= p.values.DAMPENING.Value; // Damping

        drawParticle(particle, p);
    };
}

const drawParticle = (particle, p) => {
    p.ctx.beginPath();
    p.ctx.arc(particle.x, particle.y, p.values.PARTICLE_SIZE.Value, 0, Math.PI * 2);
    p.ctx.fillStyle = colorOptions[particle.color];
    p.ctx.fill();
    p.ctx.closePath();
}

const doChecks = (particle, particleArray, p) => {
    for (let i = 0; i < particleArray.length; i++) {
        if (particleArray[i] !== particle) {
            const otherParticle = particleArray[i];
            const dx = otherParticle.x - particle.x;
            const dy = otherParticle.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < p.values.VISION_DISTANCE.Value) {
                // Apply attraction or repulsion based on color
                const attraction = attractionMatrix[particle.color][otherParticle.color];
                particle.vx += (dx / distance) * attraction;
                particle.vy += (dy / distance) * attraction;
            }
        }
    }
}

const applyCollisions = (particle, particleArray, p) => {
    for (let i = 0; i < particleArray.length; i++) {
        if (particleArray[i] !== particle) {
            const otherParticle = particleArray[i];
            const dx = otherParticle.x - particle.x;
            const dy = otherParticle.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < p.values.PARTICLE_SIZE.Value * 2) {
                const angle = Math.atan2(dy, dx);
                const force = p.values.COLLISSION_FORCE.Value;
                particle.vx -= Math.cos(angle) * force;
                particle.vy -= Math.sin(angle) * force;
            }
        }
    }
}

new DemoFramework(
    {
        fps: 60,
        width: 800,
        height: 800,
        values,
        init,
        update
    });