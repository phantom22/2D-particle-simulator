const particles = [] as Particle[],
      X_REGIONS = [] as { [x_region_id:number]: [particle_id:number] },
      Y_REGIONS = [] as { [y_region_id:number]: [particle_id:number] };

let PARTICLE_WIDTH = 50,
    INV_PARTICLE_WIDTH = 1 / PARTICLE_WIDTH;

let physics_distance_from_offset = (2 * screen.width) ** 2,
    snap_to_grid = false;

    /** Visibility bounds - any particle with a x value higher than this can be visible horizontally. */
let bounds_min_x = 0,
    /** Visibility bounds - any particle with a y value higher than this can be visible vertically. */
    bounds_min_y = 0,
    /** Visibility bounds - any particle with a x smaller than this can be visible horizontally. */
    bounds_max_x = 0,
    /** Visibility bounds - any particle with a y value smaller than this can be visible horizontally. */
    bounds_max_y = 0,
    cell_offset_x = 0,
    cell_offset_y = 0;

/** Updates the visibility bounds of the canvas for 2D culling. */
function update_bounds() {
    bounds_min_x = offset_x - PARTICLE_WIDTH;
    bounds_max_x = width + offset_x;
    bounds_min_y = offset_y - PARTICLE_WIDTH;
    bounds_max_y = height + offset_y;
}

function set_scale(value:number) {
    scale = Math.max(_min_scale, Math.min(scale - Math.sign(value) * scale_delta, _max_scale));
    update_bounds();
    update_grid();
}

function set_offset(x_value:number, y_value:number) {
    offset_x = x_value;
    offset_y = y_value;
    update_bounds();
    cell_offset_x = PARTICLE_WIDTH - x_value % PARTICLE_WIDTH;
    cell_offset_y = PARTICLE_WIDTH - y_value % PARTICLE_WIDTH;
    update_grid();
}

/** Converts screen (canvas) position to world position. */
function screen_to_world(clientX:number, clientY:number): [x:number, y:number] {
    const rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;

  return [
    (clientX - rect.left) * scaleX + offset_x,
    (clientY - rect.top) * scaleY + offset_y
  ]
}

/** Converts screen position (absolute position) to world position. */
// function screen_to_world(x:number, y:number): [x:number, y:number] {
//     return [
//         x + offset_x,
//         y + offset_y
//     ]
// }

/** Converts world position to screen (canvas) position. */
function world_to_screen(x:number, y:number): [x:number, y:number] {
    return [
        x - offset_x,
        y - offset_y//height - y + offset_y
    ]
}

/** Converts a worlds positions to the cell position it belongs to. */
function world_to_screen_cell(x:number, y:number): [x:number, y:number] {
    return [
        x - offset_x - x % PARTICLE_WIDTH,
        y - offset_y - y % PARTICLE_WIDTH
        //Math.floor((x - offset_x) * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH + cell_offset_x,
        //Math.floor((height - y + offset_y) * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH + cell_offset_y
    ]
}

function world_to_region(x:number, y:number): [x_region:number, y_region:number] {
    return [
        Math.floor(x * INV_PARTICLE_REGION_SIZE),
        Math.floor(y * INV_PARTICLE_REGION_SIZE)
    ]
}

function center_world_pos(x:number, y:number) {
    set_offset(x - width*0.5, y - height*0.5);
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
    collides_with:Particle[] = [];
    is_grounded = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    region_bounds: [number,number,number,number]

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
        if (this.should_be_updated() === false) return;

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
        return this.x > bounds_min_x && this.x < bounds_max_x && this.y > bounds_min_y && this.y < bounds_max_y
    }

    screen_position(): [x:number, y:number] {
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

function intersect_xy_regions(x_reg:number[], y_reg:number[]) {
    
}

function find_particle(x:number, y:number): null|Particle {
    let reg = world_to_region(x,y);
    
    let x_reg = X_REGIONS[reg[0]];
    if (x_reg === undefined) return null;

    let y_reg = Y_REGIONS[reg[1]];
    if (y_reg === undefined) return null;

    return null;
}

const PARTICLE_REGION_SIZE = PARTICLE_WIDTH * 3,
      INV_PARTICLE_REGION_SIZE = 1 / PARTICLE_REGION_SIZE;