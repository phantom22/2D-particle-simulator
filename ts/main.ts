const display = new Display("#display", { fixed_fps: 60 });

particles.push(new Particle(1, -500, -500, 30/1000, 60/1000, 3/1000000, 6/1000000));
particles.push(new Particle(0, 500, -500, -30/1000, 60/1000, -3/1000000, 6/1000000));
particles.push(new Particle(0, -500, 500, 30/1000, -60/1000, 3/1000000, -6/1000000));
particles.push(new Particle(1, 500, 500, -30/1000, -60/1000, -3/1000000, -6/1000000));

//  let angle = 0,
//      distance = 100,
//      w = (2 * Math.PI) / 288;
//  setInterval(() => {
//      particles[0].x = Math.cos(angle) * distance;
//      particles[0].y = Math.sin(angle) * distance;
//      angle += w;
//  }, 16.66666667)

selected_particle = 0;