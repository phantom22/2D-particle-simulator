    /** This array contains all the particles to be rendered. */
let particles = [] as Particle[],
    particle_width = 10,
    inv_particle_width = 1 / particle_width,
    /** Max distance from the origin for a particle to be emulated physically. */
    //physics_distance_from_offset:number,
    snap_to_grid = false,
    /** Visibility bounds - any particle with a x value higher than this can be visible horizontally. */
    bounds_x_min:number,
    /** Visibility bounds - any particle with a y value higher than this can be visible vertically. */
    bounds_y_min:number,
    /** Visibility bounds - any particle with a x smaller than this can be visible horizontally. */
    bounds_x_max:number,
    /** Visibility bounds - any particle with a y value smaller than this can be visible horizontally. */
    bounds_y_max:number,
    cell_offset_x:number,
    cell_offset_y:number;

/** context: Particle. This is set to the initial value of particle_width, needed for scaling. */
const PARTICLE_RESOLUTION = particle_width;

/** 
 * Updates the visibility bounds of the canvas for 2D culling. 
 * 
 * automatically updates bounds_x and bounds_y.
 */
function update_bounds() {
    bounds_x_min = (offset_x - particle_width) * scale;
    bounds_x_max = (width + offset_x) * scale;
    bounds_y_min = (offset_y - particle_width) * scale;
    bounds_y_max = (height + offset_y) * scale;
    //physics_distance_from_offset = (width ** 2 + height ** 2) * height * 3 / 2;
}

/** 
 * Updates the time scale of the simulation.. 
 * 
 * automatically updates scaled_delta_time.
 */
function set_time_scale(value:number) {
    time_scale = Math.max(_min_time_scale, Math.min(value, _max_time_scale));
    scaled_delta_time = fixed_delta_time * time_scale;
}

/**
 * Sets scale to the specified value. The camera keeps looking at the same center as before.
 * 
 * automatically changes inv_scale and updates bounds, cell_offset and grid.
 */
function set_scale(value:number) {
    const center = screen_to_world(width * 0.5, height * 0.5);

    scale = Math.max(_min_scale, Math.min(value, _max_scale));
    inv_scale = 1 / scale;
    particle_width = PARTICLE_RESOLUTION * inv_scale;

    camera_look_at(center[0], center[1]);
}

/**
 * Sets offset_x and offset_y to the specified values.
 * 
 * does not automatically invert y_value.
 * 
 * automatically updates bounds, cell_offset and grid.
 */
function set_offset(x_value:number, y_value:number) {
    offset_x = x_value;
    offset_y = y_value;
    update_bounds();
    cell_offset_x = particle_width - x_value % particle_width;
    cell_offset_y = particle_width - y_value % particle_width;
    update_grid();
}

/** 
 * Converts screen (canvas) position to world position. 
 * 
 * the output y is automatically inverted.
 */
function screen_to_world(screen_x:number, screen_y:number): [world_x:number, world_y:number] {
    const rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;

  return [
    ((screen_x - rect.left) * scaleX + offset_x) * scale,
    ((screen_y - rect.top) * scaleY + offset_y) * -scale
  ]
}

/** 
 * Converts world position to screen (canvas) position. 
 * 
 * world_y is automatically inverted.
 */
function world_to_screen(world_x:number, world_y:number): [screen_x:number, screen_y:number] {
    return [
        world_x * inv_scale - offset_x,
        -world_y * inv_scale - offset_y
    ]
}

/** 
 * Converts a worlds position to the cell position it belongs to. 
 * 
 * world_y is automatically inverted.
 * 
 * how it works:
 * 
 * - world_x, this value gets rounded down to the nearest left cell.
 * - world_y: 
 * 
 * > when world_y > 0, invert its value and round up down to the nearest cell above it,
 * 
 * > when world_y < 0, invert its vakue and round it down to the nearest cell under it.
 */
function world_to_screen_cell(world_x:number, world_y:number): [screen_cell_x:number, screen_cell_y:number] {
    let x_pr = world_x < 0 ? -PARTICLE_RESOLUTION : 0,
        y_pr = world_y > 0 ? -PARTICLE_RESOLUTION : 0;
    return [
        (world_x - world_x % PARTICLE_RESOLUTION + x_pr) * inv_scale - offset_x,
        (world_y % PARTICLE_RESOLUTION - world_y + y_pr) * inv_scale - offset_y
    ]
}

/** 
 * Centers the camera to the specified world position.
 * 
 * world_y is automatically inverted.
 */
function camera_look_at(world_x:number, world_y:number) {
    set_offset(world_x*inv_scale - width*0.5, (-world_y*inv_scale - height*0.5));
}

/**
 * Forces the camera to look at the center of the screen.
 */
function camera_look_at_screen_center() {
    const center = screen_to_world(width * 0.5, height * 0.5);
    camera_look_at(center[0], center[1]);
}


console.warn("Particle.should_be_updated() is yet to be implemented!");
class Particle {

    /** Particles x position. */
    x:number;
    /** Particles y position. */
    y:number;
    /** Particles x speed. Measured in m/ms. */
    vx:number;
    /** Particles y speed. Measured in m/ms. */
    vy:number;
    /** Particles x acceleration. Measured in m/ms^2. */
    ax:number;
    /** Particles y acceleration. Measured in m/ms^2. */
    ay:number;
    /** Particles material.  */
    material:Material;

    constructor(material_type:number, x:number, y:number, vx=0, vy=0, ax=0, ay=0) {
        this.material = new Material(material_type);
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
    }

    /** Should the particle keep updating its physics values? */
    should_be_updated() {
        return true;//(this.x - offset_x)**2 + (-this.y - offset_y)**2 <= physics_distance_from_offset
    }

    /** Called during the fixedUpdate, this calculates the new speed and position of the particle. */
    step() {
        this.vx += this.ax * scaled_delta_time;
        this.vy += this.ay * scaled_delta_time;
        this.x += this.vx * scaled_delta_time;
        this.y += this.vy * scaled_delta_time;
    }

    /** Should the particle be rendered? */
    is_visible() {
        return this.x > bounds_x_min && this.x < bounds_x_max && -this.y > bounds_y_min && -this.y < bounds_y_max
    }

    /** Computes the screen position of this particle. If snap_to_grid is set to true, computes the screen_cell position. */
    screen_position(): [screen_x:number, screen_y:number] {
        return snap_to_grid === true ? world_to_screen_cell(this.x, this.y) : world_to_screen(this.x, this.y)
    }

    stop_horizontal_movement() {
        this.ax = 0;
        this.vx = 0;
    }

    stop_vertical_movement() {
        this.ay = 0;
        this.vy = 0;
    }
}