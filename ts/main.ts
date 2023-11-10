const display = new Display("#display", { fixed_fps: 60 });

particles.push(new Particle(0, 50, 50));

let angle = 0,
    distance = 100,
    w = (2 * Math.PI) / 60;

setInterval(() => {
    particles[0].x = Math.cos(angle) * distance;
    particles[0].y = Math.sin(angle) * distance;
    angle += w;
}, 16.66666667)
//selected_particle = 0;