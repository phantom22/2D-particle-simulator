const X_REGIONS = [] as { [x_region_id:number]: [particle_id:number] },
      Y_REGIONS = [] as { [y_region_id:number]: [particle_id:number] };

let particles = [] as Particle[],
    particle_width = 50,
    inv_particle_width = 1 / particle_width,
    physics_distance_from_offset = (2 * screen.width) ** 2,
    snap_to_grid = false,
    /** Visibility bounds - any particle with a x value higher than this can be visible horizontally. */
    bounds_x_min = 0,
    /** Visibility bounds - any particle with a y value higher than this can be visible vertically. */
    bounds_y_min = 0,
    /** Visibility bounds - any particle with a x smaller than this can be visible horizontally. */
    bounds_x_max = 0,
    /** Visibility bounds - any particle with a y value smaller than this can be visible horizontally. */
    bounds_y_max = 0,
    cell_offset_x = 0,
    cell_offset_y = 0;

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
    physics_distance_from_offset = (2 * screen.width) ** 2 * scale;
}

/**
 * Sets scale to the specified value.
 * 
 * automatically changes inv_scale and updates bounds, cell_offset and grid.
 */
function set_scale(value:number) {
    scale = Math.max(_min_scale, Math.min(value, _max_scale));
    inv_scale = 1 / scale;
    particle_width = PARTICLE_RESOLUTION * inv_scale;
    update_bounds();
    cell_offset_x = particle_width - offset_x % particle_width;
    cell_offset_y = particle_width - offset_y % particle_width;
    update_grid();
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

/** Converts screen position (absolute position) to world position. */
// function screen_to_world(x:number, y:number): [x:number, y:number] {
//     return [
//         x + offset_x,
//         y + offset_y
//     ]
// }

/** 
 * Converts world position to screen (canvas) position. 
 * 
 * world_y is automatically inverted.
 */
function world_to_screen(world_x:number, world_y:number): [screen_x:number, screen_y:number] {
    return [
        world_x * inv_scale - offset_x,
        -world_y * inv_scale - offset_y//height - y + offset_y
    ]
}

/** 
 * Converts a worlds positions to the cell position it belongs to. 
 * 
 * outcome changes if x<0 or y<0.
 */
function world_to_screen_cell(x:number, y:number): [screen_cell_x:number, screen_cell_y:number] {
    return [
        x > 0 ? (x - x % particle_width) * inv_scale - offset_x : (x - (particle_width + x % particle_width)) * inv_scale - offset_x,
        y > 0 ? (y - y % particle_width) * inv_scale - offset_y : (y - (particle_width + y % particle_width)) * inv_scale - offset_y
    ]
}

// function world_to_region(x:number, y:number): [x_region:number, y_region:number] {
//     return [
//         Math.floor(x * INV_PARTICLE_REGION_SIZE),
//         Math.floor(y * INV_PARTICLE_REGION_SIZE)
//     ]
// }

/** 
 * Centers the camera to the specified world position.
 * 
 * world_y is automatically inverted.
 */
function camera_look_at(world_x:number, world_y:number) {
    set_offset(world_x*inv_scale - width*0.5, (-world_y*inv_scale - height*0.5));
}

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
    // collides_with:Particle[] = [];
    // is_grounded = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // region_bounds: [number,number,number,number]

    constructor(material_type:number, x:number, y:number, vx=0, vy=0, ax=0, ay=0) {
        this.material = new Material(material_type);
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // assign regions manually
    }

    /** Should the particle keep updating its physics values? */
    should_be_updated() {
        return (this.x - offset_x)**2 + (this.y - offset_y)**2 <= physics_distance_from_offset
    }

    /** Called during the fixedUpdate, this calculates the new speed and position of the particle. */
    step() {
        this.vx += this.ax * fixed_delta_time;
        this.vy += this.ay * fixed_delta_time;
        this.x += this.vx * fixed_delta_time;
        this.y += this.vy * fixed_delta_time;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // assign regions with function
        // this means that whenever i assign a new region i have to remove this particle from the previous one
        // add it to the new region and sort from smallest to highest ID
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

// function intersect_xy_regions(x_reg:number[], y_reg:number[]) {
    
// }

// function find_particle(x:number, y:number): null|Particle {
//     let reg = world_to_region(x,y);
    
//     let x_reg = X_REGIONS[reg[0]];
//     if (x_reg === undefined) return null;

//     let y_reg = Y_REGIONS[reg[1]];
//     if (y_reg === undefined) return null;

//     return null;
// }

const PARTICLE_REGION_SIZE = particle_width * 3,
      INV_PARTICLE_REGION_SIZE = 1 / PARTICLE_REGION_SIZE;