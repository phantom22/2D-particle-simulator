function DEBUG_read_particle(id:number) {
    if (!particles[id]) throw `${id} is not a valid particle id!`;
    let { x, y, vx, vy, ax, ay } = particles[id];

    return {
        x,                y,
        vx: vx * 1000,    vy: vy * 1000,
        ax: ax * 1000000, ay: ay * 1000000
    }
}

function DEBUG_get_bounds() {
    return { bounds_min_x, bounds_max_x, bounds_min_y, bounds_max_y }
}