const particles = [] as Particle[],
      PARTICLE_WIDTH = 10,
      INV_PARTICLE_WIDTH = 1 / PARTICLE_WIDTH;

    /** Visibility bounds - any particle with a x value higher than this can be visible horizontally. */
let bounds_min_x = 0,
    /** Visibility bounds - any particle with a y value higher than this can be visible vertically. */
    bounds_min_y = 0,
    /** Visibility bounds - any particle with a x smaller than this can be visible horizontally. */
    bounds_max_x = 0,
    /** Visibility bounds - any particle with a y value smaller than this can be visible horizontally. */
    bounds_max_y = 0;

/** Updates the visibility bounds of the canvas for 2D culling. */
function update_bounds() {
    bounds_min_x = offset_x - PARTICLE_WIDTH;
    bounds_max_x = width + offset_x;
    bounds_min_y = offset_y - PARTICLE_WIDTH;
    bounds_max_y = height + offset_y;
}

function set_offset(x_value:number, y_value:number) {
    offset_x = x_value;
    offset_y = y_value;
    bounds_min_x = x_value - PARTICLE_WIDTH;
    bounds_max_x = width + x_value;
    bounds_min_y = y_value - PARTICLE_WIDTH;
    bounds_max_y = height + y_value;
}

function set_width(value:number) {
    width = value;
    bounds_max_x = value + offset_x;
}

function set_height(value:number) {
    height = value;
    bounds_max_y = height + offset_y;
}

function set_offset_x(value:number) {
    offset_x = value;
    bounds_min_x = value - PARTICLE_WIDTH;
    bounds_max_x = width + value;
    console.log(DEBUG_get_bounds())
}

function set_offset_y(value:number) {
    offset_y = value;
    bounds_min_y = value - PARTICLE_WIDTH;
    bounds_max_y = height + value;
}

/** Converts the event.y to the actual world position. */
function DOM_to_world(clientX:number, clientY:number): [x:number, y:number] {
    const rect = _canvas.getBoundingClientRect(),
    scaleX = _canvas.width / rect.width,
    scaleY = _canvas.height / rect.height;

  return [
    (clientX - rect.left) * scaleX,
    (clientY - rect.top) * scaleY
  ]
}

/** Converts screen position (absolute position) to world position. */
function screen_to_world(x:number, y:number): [x:number, y:number] {
    return [
        x + offset_x,
        y + offset_y
    ]
}

/** Converts world position to screen position. */
function world_to_screen(x:number, y:number): [x:number, y:number] {
    return [
        x - offset_x,
        y - offset_y
    ]
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
    snap_to_grid = false;

    constructor(material_type:number, x:number, y:number, vx=0, vy=0, ax=0, ay=0) {
        this.material = new Material(material_type);
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
    }

    /** Called during the fixedUpdate, this calculates the new speed and position of the particle. */
    step() {
        this.vx += this.ax * fixedDeltaTime;
        this.vy += this.ay * fixedDeltaTime;
        this.x += this.vx * fixedDeltaTime;
        this.y += this.vy * fixedDeltaTime;
    }

    region(): [x_region:number, y_region:number] {
        return [
            ~~(this.x * INV_PARTICLE_REGION_SIZE),
            ~~(this.y * INV_PARTICLE_REGION_SIZE)
        ]
    }


    is_visible() {
        return this.x > bounds_min_x && this.x < bounds_max_x && this.y > bounds_min_y && this.y < bounds_max_y
    }

    screen_position(): [x:number, y:number] {
        const screen_pos_x = this.x - offset_x,
              screen_pos_y = this.y - offset_y;

        return this.snap_to_grid === true ? [
            ~~(screen_pos_x * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH,
            ~~(screen_pos_y * INV_PARTICLE_WIDTH) * PARTICLE_WIDTH
        ] : [
            screen_pos_x,
            screen_pos_y
        ]
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

const PARTICLE_REGION_SIZE = PARTICLE_WIDTH * 5,
      INV_PARTICLE_REGION_SIZE = 1 / PARTICLE_REGION_SIZE;