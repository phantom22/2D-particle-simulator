const display = new Display("#display", { fixed_fps: 60 });

// particles.push(new Particle(1, -500, -500, 30/1000, 60/1000, 3/1000000, 6/1000000));
// particles.push(new Particle(0, 500, -500, -30/1000, 60/1000, -3/1000000, 6/1000000));
// particles.push(new Particle(0, -500, 500, 30/1000, -60/1000, 3/1000000, -6/1000000));
// particles.push(new Particle(1, 500, 500, -30/1000, -60/1000, -3/1000000, -6/1000000));

no_mouse_mode = true;

(function(){
    const quantity = 20000,
          delta_angle = 2 * Math.PI / quantity,
          vx_module = 0/1000,
          vy_module = 0/1000,
          ax_module = 9.81/1000000,
          ay_module = 9.81/1000000;

    for (let i=0; i<quantity; i++) {
        const angle = i * delta_angle;
        particles.push(new Particle(0, /*(angle<Math.PI*0.5||angle>3*Math.PI*0.5 ? -particle_width : 0)*/ - particle_width*0.5, /*(angle<Math.PI ? -particle_width : 0) +*/ particle_width*0.5, vx_module*Math.cos(angle), vy_module*Math.sin(angle), ax_module*Math.cos(angle), ay_module*Math.sin(angle)))
    }
})();

set_scale(0.8);
//  let angle = 0,
//      distance = 100,
//      w = (2 * Math.PI) / 288;
//  setInterval(() => {
//      particles[0].x = Math.cos(angle) * distance;
//      particles[0].y = Math.sin(angle) * distance;
//      angle += w;
//  }, 16.66666667)

//selected_particle = 0;

//unpaused = false;