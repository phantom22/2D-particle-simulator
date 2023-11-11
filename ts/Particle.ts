    /** This array contains all the particles to be rendered. */
let particles = [] as Particle[],
    /** 
     * Current particle width with respect to scale. Read-only.
     * 
     * ---
     * this value is changed by `set_scale(value)`.
     */
    particle_width = 10,
    /**
     * Inverse of the current particle_width value. Read-only.
     * 
     * ---
     * this value is changed by `set_scale(value)`.
     */
    inv_particle_width = 1 / particle_width,
    /** Should the particles snap to the grid cells? */
    snap_to_grid = false;
    /** Max distance from the origin for a particle to be emulated physically. */
    //physics_distance_from_offset:number,

/** This is set to the initial value of particle_width, needed for correct scaling. */
const PARTICLE_RESOLUTION = particle_width;

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