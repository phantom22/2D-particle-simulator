// function binarySearch(a:number[], x:number) {
//     let l = 0,
//         h = a.length;
//     while (l!==h) {
//         const m = ~~((l+h)/2);
//         if (x === a[m]) {
//             return m;
//         }
//         else if (x > a[m])
//             l = m + 1;
//         else 
//             h = m ;
//     }
//     return -1;
// }
/**
 * Cached value of `window.innerWidth`, this value reflects `canvas.width`. Read-only.
 *
 * ---
 * this values is changed by `Display.adapt_canvas_size()`.
 */
let width, 
/**
 * Cached value of `window.innerHeight`, this value reflects `canvas.height`. Read-only.
 *
 * ---
 * this values is changed by `Display.adapt_canvas_size()`.
 */
height, 
/**
 * How far away is the offset x component from 0. Read-only.
 *
 * ---
 * use `set_world_offset(x,y)` to change this value.
 */
offset_x, 
/**
 * How far away is the offset y component from 0. Read-only.
 *
 * ---
 * use `set_world_offset(x,y)` to change this value.
 */
offset_y, canvas, ctx, 
/**
 * If true the canvas will keep updating (image and physics calculations).
 *
 * ---
 * won't reset if already defined.
 */
unpaused, 
/** This flag is set to true whenever the window is resized. On the next render frames the canvas width and height will be updated. Read-only. */
_update_canvas_size, 
/** Time between two physics frames. Measured in milliseconds. Read-only. */
fixed_delta_time, 
/** Cached value of `delta_time * time_scale`, updated each frame. Measured in milliseconds. Read-only.*/
scaled_delta_time, 
/** Time took to render previous frame. Measured in milliseconds. Read-only. */
delta_time, 
/** Increments by one at the end of each rendered frame. */
frame_count, physics_interval_id, render_interval_id;
const UI_FONT = "Verdana";
let ui_font_size = 15, ui_padding = 5, ui_margin = 15, ui_offset_color = "#c2ac44", ui_fps_color = "#00ff00";
/** This function, before drawing a particles, asserts that it's not an undefined value and if it's a visible particle. */
function draw_particle(p) {
    if (p === undefined || p.is_visible() === false)
        return;
    const pos = p.screen_position();
    ctx.drawImage(MATERIAL_CACHE[p.material.type], pos[0], pos[1], particle_width, particle_width);
}
class Display {
    /** How many frames after the page loads should the fps detector wait? Default=5 */
    static WAIT_FRAMES = 10;
    /** Number of taken sample timestamps required for the fps detection. Default=10 */
    static FPS_SAMPLES = 10;
    /** Very small number that helps preventing wrong fps detection. Default=0.004973808593749851 */
    static FPS_CALCULATION_EPSILON = 0.006;
    /** The refresh rate of the screen. Needs to be calculated only one time. Read-only. */
    static REFRESH_RATE;
    /** Is the current device a mobile phone? Needed for performance tweaks. Read-only. */
    static IS_RUN_ON_PHONE = (function (a) {
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
    })(navigator.userAgent || navigator.vendor || window.opera);
    /** Max render frames per second. Read-only.*/
    fps;
    /** Max physics frames per second. Read-only.*/
    fixed_fps;
    constructor(query, settings = {}) {
        const c = document.querySelector(query);
        if (c instanceof HTMLCanvasElement) {
            c.width = width;
            c.height;
            canvas = c;
            ctx = c.getContext("2d");
            this.#applySettings(settings);
            this.#init().then(fps => this.start(fps, settings.fixed_fps));
        }
        else
            throw `Couldn't find canvas with query '${query}'`;
    }
    #applySettings({} = {}) {
    }
    /** Method used to detect screen refresh rate. If refresh rate was already, resolve immediately with that value. */
    #init() {
        return new Promise(resolve => {
            if (Display.REFRESH_RATE !== undefined) {
                resolve(Display.REFRESH_RATE);
                return;
            }
            /** timestamps[0] is the start of the elapsed time; timestamps[i] (with 0<i<FPS_SAMPLES+1) is where all the sample fps timestamps are. */
            const timestamps = [];
            let id, framesToWait = Display.WAIT_FRAMES;
            function frameStep(timestamp) {
                if (framesToWait > 0) {
                    framesToWait--;
                    if (framesToWait === 0)
                        timestamps.push(timestamp);
                }
                else if (timestamps.length - 1 < Display.FPS_SAMPLES) {
                    timestamps.push(timestamp);
                }
                else {
                    const avg = timestamps
                        .map((v, i) => v - timestamps[i - 1]) // calc delta_time between each timestamp
                        .slice(1) // remove timestamps[0] which is non relevant to the calculation
                        .reduce((a, b) => a + b) / (timestamps.length - 1) - Display.FPS_CALCULATION_EPSILON * 2; // divide the sum of the deltas by the sampleCount
                    let o;
                    if (avg <= 2.777778)
                        o = 360;
                    else if (avg <= 4.166667)
                        o = 240;
                    else if (avg <= 6.060606)
                        o = 165;
                    else if (avg <= 6.944444)
                        o = 144;
                    else if (avg <= 8.333333)
                        o = 120;
                    else if (avg <= 11.111111)
                        o = 90;
                    else if (avg <= 13.333333)
                        o = 75;
                    else if (avg <= 16.666667)
                        o = 60;
                    else if (avg <= 33.333333)
                        o = 30;
                    else
                        o = Math.floor(1000 / avg);
                    Object.defineProperty(Display, "REFRESH_RATE", { value: o, writable: false });
                    cancelAnimationFrame(id);
                    resolve(o);
                    return;
                }
                id = requestAnimationFrame(frameStep);
            }
            id = requestAnimationFrame(frameStep);
        });
    }
    /**
     * This method is called before the rendering loop is started. It's defined as follows:
     *
     * - finalize fps.
     * - if fixed_fps is higher than fps, clamp it down; calculate fixed_delta_time.
     * - apply event listeners to canvas.
     * - initialize frame_count.
     * - set canvas resolution to window.innerWidth, window.innerHeight
     * - center camera to 0,0.
     * - begin physics and rendering loop.
     */
    start(fps, fixed_fps) {
        Object.defineProperty(this, "fps", { value: fps, writable: false });
        if (fixed_fps === undefined || fixed_fps > fps)
            fixed_fps = fps;
        Object.defineProperty(this, "fixed_fps", { value: fixed_fps, writable: false });
        fixed_delta_time = 1000 / fixed_fps;
        applyEventListeners(fps);
        unpaused = unpaused ?? true;
        frame_count = 0;
        // adapt canvas size
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // reset update flag
        _update_canvas_size = false;
        // center the camera to 0,0
        set_world_offset(0 - width * 0.5, 0 - height * 0.5);
        physics_interval_id = setInterval(this.fixed_physics_step.bind(this), fixed_delta_time);
        render_interval_id = requestAnimationFrame(this.render_step.bind(this, 0, 0));
    }
    /**
     * This method controls the physics calculation process. It's defined as follows:
     *
     * - if the document is hidden or `unpaused` is set to false, skip calculations all together.
     * - for each particle, before the calculation check wether the particle should be updated.
     */
    fixed_physics_step() {
        if (document.hidden === false && unpaused) {
            for (let i = 0; i < particles.length; i++)
                if (particles[i].should_be_updated() === true)
                    particles[i].step();
        }
    }
    /**
     * Updates the canvas resolution to window.innerWidth, window.innerHeight; after that it centers the camera to the current screen center
     * which automatically updates bounds, cell_offset and grid.
     *
     * This method is triggered by the `_update_canvas_size` flag, changed by the onresize event listener of the window.
     */
    adapt_canvas_size() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        camera_look_at_screen_center();
        _update_canvas_size = false;
    }
    /**
     * This method controls the rendering process. It's defined as follows:
     *
     * - update canvas size, if needed.
     * - calculate delta_time and scaled_delta_time.
     * - if there is a selected particle, center the camera to its position.
     * - clear previous frame.
     * - draw grid.
     * - draw particles.
     * - draw current offset in the top left corner.
     * - draw current fps in the top right corner.
     * - increment frame_count.
     * - request next animation frame.
     */
    render_step(currFrame, prevFrame) {
        if (_update_canvas_size)
            this.adapt_canvas_size();
        delta_time = currFrame - prevFrame;
        scaled_delta_time = delta_time * time_scale;
        if (_is_pressing_reverse_time_scale_button)
            scaled_delta_time = -scaled_delta_time;
        if (selected_particle > -1) {
            camera_look_at_centerered_cell(particles[selected_particle].x, particles[selected_particle].y);
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(GRID_CACHE, 0, 0);
        for (let i = 0; i < particles.length; i += 10) {
            draw_particle(particles[i]);
            draw_particle(particles[i + 1]);
            draw_particle(particles[i + 2]);
            draw_particle(particles[i + 3]);
            draw_particle(particles[i + 4]);
            draw_particle(particles[i + 5]);
            draw_particle(particles[i + 6]);
            draw_particle(particles[i + 7]);
            draw_particle(particles[i + 8]);
            draw_particle(particles[i + 9]);
        }
        ctx.font = `${ui_font_size}px ${UI_FONT}`;
        ctx.fillStyle = ui_offset_color;
        ctx.fillText(`${offset_x.toFixed(2)},${(-offset_y).toFixed(2)}`, 8, 17);
        ctx.fillStyle = ui_fps_color;
        ctx.fillText(`${~~(1000 / delta_time)}`, width - 27, 17, 25);
        frame_count++;
        render_interval_id = requestAnimationFrame(nextFrame => this.render_step.call(this, nextFrame, currFrame));
    }
}
Object.defineProperty(Display, "IS_RUN_ON_PHONE", { writable: false });
/**
 * Any particle with a x value higher than this can be visible horizontally. Read-only.
 *
 * ---
 * this values is directly changed by `update_bounds()` but the actual function that triggers the change is `set_world_offset(x,y)`.
 */
let bounds_x_min, 
/**
 * Any particle with a y value higher than this can be visible vertically. Read-only.
 *
 * ---
 * this values is directly changed by `update_bounds()` but the actual function that triggers the change is `set_world_offset(x,y)`.
 */
bounds_y_min, 
/**
 * Any particle with a x smaller than this can be visible horizontally.
 *
 * ---
 * this values is directly changed by `update_bounds()` but the actual function that triggers the change is `set_world_offset(x,y)`.
 */
bounds_x_max, 
/**
 * Visibility bounds - any particle with a y value smaller than this can be visible horizontally.
 *
 * ---
 * this values is directly changed by `update_bounds()` but the actual function that triggers the change is `set_world_offset(x,y)`.
 */
bounds_y_max;
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
 * Updates the time scale of the simulation.
 */
function set_time_scale(value) {
    time_scale = Math.max(_min_time_scale, Math.min(value, _max_time_scale));
}
/**
 * Sets scale to the specified value. The camera keeps looking at the same center as before.
 *
 * automatically changes inv_scale and updates bounds, cell_offset and grid.
 */
function set_scale(value) {
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
function set_world_offset(x_value, y_value) {
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
function screen_to_world(screen_x, screen_y) {
    const rect = canvas.getBoundingClientRect(), scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    return [
        ((screen_x - rect.left) * scaleX + offset_x) * scale,
        ((screen_y - rect.top) * scaleY + offset_y) * -scale
    ];
}
/**
 * Converts world position to screen (canvas) position.
 *
 * world_y is automatically inverted.
 */
function world_to_screen(world_x, world_y) {
    return [
        world_x * inv_scale - offset_x,
        -world_y * inv_scale - offset_y
    ];
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
function world_to_screen_cell(world_x, world_y) {
    let x_pr = world_x < 0 ? -PARTICLE_RESOLUTION : 0, y_pr = world_y > 0 ? -PARTICLE_RESOLUTION : 0;
    return [
        (world_x - world_x % PARTICLE_RESOLUTION + x_pr) * inv_scale - offset_x,
        (world_y % PARTICLE_RESOLUTION - world_y + y_pr) * inv_scale - offset_y
    ];
}
/**
 * Centers the camera to the specified world position.
 *
 * world_y is automatically inverted.
 */
function camera_look_at(world_x, world_y) {
    set_world_offset(world_x * inv_scale - width * 0.5, -world_y * inv_scale - height * 0.5);
}
/**
 * Forces the camera to look at the center of the screen.
 */
function camera_look_at_screen_center() {
    const center = screen_to_world(width * 0.5, height * 0.5);
    camera_look_at(center[0], center[1]);
}
/**
 * Given a world position, pad it to be in the middle of a cell then center the camera around it.
 *
 * if `snap_to_grid` is false, simply point the camera half a cell to the right and half a cell to the bottom of the given position, thus center the camera to a cell which is not snapped to the grid.
 */
function camera_look_at_centerered_cell(world_x, world_y) {
    if (snap_to_grid) {
        let x_pr = world_x < 0 ? -PARTICLE_RESOLUTION * 0.5 : PARTICLE_RESOLUTION * 0.5, y_pr = world_y > 0 ? -PARTICLE_RESOLUTION * 0.5 : -PARTICLE_RESOLUTION * 0.5;
        return camera_look_at(world_x - world_x % PARTICLE_RESOLUTION + x_pr, world_y - world_y % PARTICLE_RESOLUTION - y_pr);
    }
    return camera_look_at(world_x + PARTICLE_RESOLUTION * 0.5, world_y - PARTICLE_RESOLUTION * 0.5);
}
/** What type of mousemove event is happening right now?
 *
 * - -1 = none
 * - 0 = TBD
 * - 1 = moving
 * - 2 = TBD */
// 0 = drawing, 2 = removing/inspecting
let _drag_type, 
/** Needed for mouse drag functionality. */
_previous_mouse_position, 
/** Needed to reduce lag from the mouse Move event. Indicates last frame in which the event was registered. */
_last_sample_frame, _sample_counter, 
/**
 * Current rendering scale. Read-only.
 *
 * ---
 * use `set_scale(value)` to change this value; won't reset if already defined.
 */
scale, 
/**
 * Inverse of the current canvas scale value. Read-only.
 *
 * ---
 * this value is changed by `set_scale(value)`.
 */
inv_scale, 
/**
 * Current physics time scale. Read-only.
 *
 * ---
 * use `set_time_scale(value)` to change this value; won't reset if already defined.
 */
time_scale, 
/**
 * How much scrolling the wheel will change the `scale` per second of scrolling. Read-only.
 *
 * the value depends on the detected frame rate.
 */
scale_scroll_wheel_delta, 
/**
 * How much scrolling the wheel will change the `time_scale` per second of scrolling. Read-only.
 *
 * the value depends on the detected frame rate.
 */
time_scale_scroll_wheel_delta;
/** Minimun `scale` value. */
const _min_scale = 0.08, 
/** Maximum `scale` value. */
_max_scale = 10, 
/** How much scrolling in seconds is needed to go from `_min_scale` to `_max_scale`. */
_scale_min_to_max_time = 3, 
/** Minimum `time_scale` value. */
_min_time_scale = 0, 
/** Minimum `time_scale` value. */
_max_time_scale = 5, 
/** How much scrolling in seconds is needed to go from `_min_time_scale` to `_max_time_scale`. */
_time_scale_min_to_max_time = 1, 
/** When pressing ctrl and scrolling the mouse wheel, this multiplier is applied to `scale_scroll_wheel_delta` and `time_scale_scroll_wheel_delta`. */
_ctrl_wheel_slow_down = 1 / 10, 
/** When pressing shift and scrolling the mouse wheel, this multiplier is applied to `scale_scroll_wheel_delta` and `time_scale_scroll_wheel_delta`. */
_shift_wheel_speed_up = 5, 
/** Maximum number of mousemove events processed per frame. */
_max_samples_per_frame = 3.;
/** Is the user in the middle of a drag event? */
let _is_dragging, 
/** Is the user currently pressing the T button, enabling `time_scale` modification? */
_is_pressing_time_scale_button, _is_pressing_reverse_time_scale_button, 
/**
 * The selected particle is identified by its ID, which is its position in the `particles` array.
 *
 * won't reset if already defined.
 */
selected_particle, selected_particle_camera_offset, 
/** Helps laptop users; if set to true, M1 instead of M3 is used to move around the grid. */
no_mouse_mode = false;
console.warn("selected_particle_camera_offset is yet to be implemented on mouse move when selected_particle is greater than -1!");
/**
 * This functions applies all the event listeners needed to `canvas`. The added events are:
 *
 * - onmousewheel
 * - onmousedown
 * - onmousemove
 * - onmouseup
 * - onmouseleave
 *
 * Resets all the helper variables and flags to their default values; if `scale`, `time_scale` or `selected_particle` were already defined do not reset them.
 */
function applyEventListeners(fps) {
    _drag_type = -1;
    _previous_mouse_position = null;
    scale_scroll_wheel_delta = (_max_scale - _min_scale) / (fps * _scale_min_to_max_time);
    time_scale_scroll_wheel_delta = (_max_time_scale - _min_time_scale) / (fps * _time_scale_min_to_max_time);
    _last_sample_frame = -1;
    scale = scale ?? 1;
    inv_scale = 1 / scale;
    time_scale = time_scale ?? 1;
    _is_dragging = false;
    _is_pressing_time_scale_button = false;
    _is_pressing_reverse_time_scale_button = false;
    selected_particle = selected_particle ?? -1,
        _sample_counter = 0;
    canvas.addEventListener("wheel", mousewheel);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseleave", mouseleave);
}
// On window resize, trigger `Display.adapt_canvas_size()`.
window.addEventListener("resize", _ => _update_canvas_size = true);
// Disable document scaling on CTRL + MOUSE WHEEL.
window.addEventListener("wheel", e => {
    if (e.ctrlKey)
        e.preventDefault();
}, { passive: false }); // passive:false => enable preventDefault().
/**
 * This functions checks for keyboard input; the following keys are mapped:
 * - SPACEBAR:
 *      toggle pause. If, after toggling, `unpaused` is set to true and `time_scale` is set to 0,
 *          simply reset it to 1.
 * - RIGHT ARROW: cycle clockwise through the particles by assigning them to `selected_particle`.
 * - LEFT ARROW: cycle anti-clockwise through the particles by assigning them to `selected_particle`.
 * - Escape: disable its default behaviour and set `selected_particle` to -1.
 * - G: toggle `snap_to_grid` filter.
 *
 * The scale update rate is capped to the `Display.fps` refresh rate by `_last_sample_frame` which is updated each time
 * this function is succesfully triggered (expect for when pressing the ALT key).
 */
window.addEventListener("keydown", e => {
    // events that are uncapped.
    switch (e.key) {
        case "t":
            _is_pressing_time_scale_button = true;
            return;
        case "r":
            _is_pressing_reverse_time_scale_button = true;
            break;
        case "Escape":
            selected_particle = -1;
            return;
        case "ArrowRight":
            if (selected_particle === particles.length - 1)
                selected_particle = -1;
            else
                selected_particle++;
            return;
        case "ArrowLeft":
            if (selected_particle === -1)
                selected_particle = selected_particle = particles.length - 1;
            else
                selected_particle--;
            return;
    }
    if (_last_sample_frame === frame_count)
        return;
    // events that need to be capped to the refresh rate.
    switch (e.key) {
        case " ":
            unpaused = !unpaused;
            if (unpaused === true && time_scale <= 0) {
                set_time_scale(1);
            }
            break;
        // On G key down, toggle snap_to_grid.
        case "g":
            snap_to_grid = !snap_to_grid;
            break;
        default:
            break;
    }
}, { passive: false });
window.addEventListener("keyup", e => {
    switch (e.key) {
        case "t":
            _is_pressing_time_scale_button = false;
            break;
        case "r":
            _is_pressing_reverse_time_scale_button = false;
            break;
        case "Shift":
            _is_pressing_time_scale_button = false;
            break;
        default:
            break;
    }
});
/**
 * This function will update the `scale` value (if the T key was not pressed) in the following way:
 *
 * - on SCROLL WHEEL FORWARD, then zoom-out.
 * - zoom-in, otherwise.
 *
 * If the T key was pressed, update the `time_scale` value in the following way:
 *
  - on SCROLL WHEEL FORWARD speed-up the simulation.
  - slow-down otherwise.
 *
 * The mouse wheel update rate is capped to the `Display.fps` refresh rate by `_last_sample_frame` which is updated each time
 * this function is succesfully triggered;
 *
 * when pressing the SHIFT key, you can noticeably speed up the rate of change of the zoom or of the time scale;
 * the opposite happens when the CTRL key is pressed.
 */
function mousewheel(e) {
    if (_last_sample_frame === frame_count)
        return;
    const multiplier = e.shiftKey ? _shift_wheel_speed_up : (e.ctrlKey ? _ctrl_wheel_slow_down : 1), change_dir = -Math.sign(e.deltaY) * multiplier;
    if (_is_pressing_time_scale_button) {
        set_time_scale(time_scale + change_dir * time_scale_scroll_wheel_delta);
        if (time_scale === 0 && unpaused === true) {
            unpaused = false;
        }
        else if (time_scale > 0 && unpaused === false) {
            unpaused = true;
        }
    }
    else {
        set_scale(scale + change_dir * scale_scroll_wheel_delta);
    }
    _last_sample_frame = frame_count;
}
/**
 * This function triggers the beginning of a drag event; the type of drag is determined by the button of the mouse that is being pressed.
 * this type is stored in _drag_type and it can have the following values:
 *
 * - -1: none.
 * - 0: Left mouse button down.
 * - 1: Scroll wheel button pressed down.
 * - 2: Right mouse button down.
 *
 * Initializes `_previous_mouse_position` for the drag event.
 */
function mousedown(e) {
    e.preventDefault();
    switch (e.button) {
        // Left button
        case 0:
            _drag_type = 0;
            break;
        // Wheel/Middle button
        case 1:
            _drag_type = 1;
            break;
        // Right button
        case 2:
            _drag_type = 2;
            break;
        // Any other auxiliary button
        default:
            _drag_type = -1;
            break;
    }
    _previous_mouse_position = [e.clientX, e.clientY];
}
/**
 * This function handles the following drag events:
 *
 * - `_drag_type` is set to 0 and `no_mouse_mode` is set to true: the camera is centered on the mouse.
 * - `_drag_type` is set to 1 and `no_mouse_mode` is set to false: the camera is centered on the mouse.
 *
 * The drag update rate is capped to `_max_samples_per_frame * Display.fps` which by default is 3 times the screen refresh rate; this
 * is done with `_last_sample_frame` and `_sample_counter` which is incremented each succesful function call.
 *
 * Also updates `_previous_mouse_position`.
 */
function mousemove(e) {
    if (_drag_type === -1 || _last_sample_frame === frame_count && _sample_counter === _max_samples_per_frame)
        return;
    const currentPos = [e.clientX, e.clientY];
    switch (_drag_type) {
        // Left button
        case 0:
            if (no_mouse_mode)
                set_world_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
            break;
        // Wheel/Middle button
        case 1:
            if (!no_mouse_mode)
                set_world_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
            break;
        // Right button
        case 2:
            break;
        // Any other auxiliary button
        default:
            _drag_type = -1;
            return;
    }
    if (_last_sample_frame === frame_count) {
        _sample_counter++;
    }
    else {
        _sample_counter = 1;
    }
    _previous_mouse_position = currentPos;
    _last_sample_frame = frame_count;
}
/**
 * Whenever a mouse button is released, stop any drag events.
 */
function mouseup(e) {
    e.preventDefault();
    switch (e.button) {
        // Left button
        case 0:
            break;
        // Wheel/Middle button
        case 1:
            break;
        // Right button
        case 2:
            break;
        // Any other auxiliary button
        default:
            break;
    }
    _drag_type = -1;
    _last_sample_frame = -1;
    _sample_counter = 0;
    _previous_mouse_position = null;
}
/**
 * Whenever the mouse leaves the canvas (by extension the window) stop any drag events.
 */
function mouseleave(e) {
    _drag_type = -1;
    _is_pressing_time_scale_button = false;
    _is_pressing_reverse_time_scale_button = false;
}
/** This array contains all the particles to be rendered. */
let particles = [], 
/**
 * Current particle width with respect to scale. Read-only.
 *
 * ---
 * this value is changed by `set_scale(value)`.
 */
particle_width = 5, 
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
    x;
    /** Particles y position. */
    y;
    /** Particles x speed. Measured in m/ms. */
    vx;
    /** Particles y speed. Measured in m/ms. */
    vy;
    /** Particles x acceleration. Measured in m/ms^2. */
    ax;
    /** Particles y acceleration. Measured in m/ms^2. */
    ay;
    /** Particles material.  */
    material;
    constructor(material_type, x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
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
        return true; //(this.x - offset_x)**2 + (-this.y - offset_y)**2 <= physics_distance_from_offset
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
        // Also add if hidden by another particle aka another particle was already drawn on top of it
        return this.x > bounds_x_min && this.x < bounds_x_max && -this.y > bounds_y_min && -this.y < bounds_y_max;
    }
    /** Computes the screen position of this particle. If snap_to_grid is set to true, computes the screen_cell position. */
    screen_position() {
        return snap_to_grid === true ? world_to_screen_cell(this.x, this.y) : world_to_screen(this.x, this.y);
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
/** This objects contains all the CanvasImageSources that pre-rendered all the avaiable particle materials. */
const MATERIAL_CACHE = [];
class Material {
    static MATERIALS = {
        sand: "#d4b470",
        stone: "#888C8D"
    };
    static MAX_TYPE_VALUE = Object.keys(Material.MATERIALS).length - 1;
    static TYPE_TO_NAME;
    type;
    constructor(type) {
        if (type === undefined || type < 0 || type > Material.MAX_TYPE_VALUE)
            throw `${type} is not a valid material type index!`;
        this.type = type;
    }
}
(function () {
    const keys = Object.keys(Material.MATERIALS), size = particle_width;
    for (let i = 0; i < keys.length; i++) {
        let material = keys[i], canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = Material.MATERIALS[material];
        ctx.fillRect(0, 0, size, size);
        MATERIAL_CACHE[i] = canvas;
    }
    Material.MAX_TYPE_VALUE = keys.length - 1;
    Material.TYPE_TO_NAME = (type) => keys[type] || "invalid type";
})();
/** This object contains the pre-rendered CanvasImageSource of the grid to be drawn on screen. */
const GRID_CACHE = document.createElement("canvas"), _grid_ctx = GRID_CACHE.getContext("2d");
/**
 * Cached value of `particle_width - x_offset % particle_width`, needed for `update_grid()`. Read-only.
 *
 * ---
 * this value is changed by `set_world_offset(x,y)`.
 */
let cell_offset_x, 
/**
 * Cached value of `particle_height - y_offset % particle_width`, needed for `update_grid()`. Read-only.
 *
 * ---
 * this value is changed by `set_world_offset(x,y)`.
 */
cell_offset_y, ui_axis_color = "#9c9c9c", ui_grid_color = "#0c0c0c", 
/** If the current particle width is less than this treshold, stop drawing the gridlines. */
no_grid_treshold = PARTICLE_RESOLUTION;
/** This function updates the cached grid with a new one. */
function update_grid() {
    let end_x = width, end_y = height, x_axis, y_axis;
    if (offset_y < 0 && offset_y + height > 0) {
        x_axis = -offset_y;
    }
    if (offset_x < 0 && offset_x + width > 0) {
        y_axis = -offset_x;
    }
    GRID_CACHE.width = width;
    GRID_CACHE.height = height;
    _grid_ctx.clearRect(0, 0, width, height);
    // prevent very fine grid lines
    if (particle_width >= no_grid_treshold) {
        _grid_ctx.strokeStyle = ui_grid_color;
        _grid_ctx.lineWidth = 1.5;
        _grid_ctx.beginPath();
        // vertical lines
        for (let x = cell_offset_x - particle_width; x < end_x; x += particle_width) {
            if (x === y_axis)
                continue;
            _grid_ctx.moveTo(x, 0);
            _grid_ctx.lineTo(x, height);
        }
        // horizontal lines
        for (let y = cell_offset_y - particle_width; y < end_y; y += particle_width) {
            if (y === x_axis)
                continue;
            _grid_ctx.moveTo(0, y);
            _grid_ctx.lineTo(width, y);
        }
        _grid_ctx.stroke();
    }
    _grid_ctx.strokeStyle = ui_axis_color;
    _grid_ctx.fillStyle = ui_axis_color;
    _grid_ctx.lineWidth = 3;
    _grid_ctx.font = `${ui_font_size}px ${UI_FONT}`;
    _grid_ctx.beginPath();
    if (x_axis !== undefined) {
        _grid_ctx.moveTo(0, x_axis);
        _grid_ctx.lineTo(width, x_axis);
        _grid_ctx.fillText("x", width - ui_padding - ui_margin, x_axis - ui_padding - ui_margin);
    }
    if (y_axis !== undefined) {
        _grid_ctx.moveTo(y_axis, 0);
        _grid_ctx.lineTo(y_axis, height);
        _grid_ctx.fillText("y", y_axis + ui_padding + ui_margin, ui_padding + ui_margin);
    }
    _grid_ctx.stroke();
}
const display = new Display("#display", { fixed_fps: 60 });
// particles.push(new Particle(1, -500, -500, 30/1000, 60/1000, 3/1000000, 6/1000000));
// particles.push(new Particle(0, 500, -500, -30/1000, 60/1000, -3/1000000, 6/1000000));
// particles.push(new Particle(0, -500, 500, 30/1000, -60/1000, 3/1000000, -6/1000000));
// particles.push(new Particle(1, 500, 500, -30/1000, -60/1000, -3/1000000, -6/1000000));
(function () {
    const quantity = 1000, delta_angle = 2 * Math.PI / quantity, vx_module = 0 / 1000, vy_module = 0 / 1000, ax_module = 9.81 / 1000000, ay_module = 9.81 / 1000000;
    for (let i = 0; i < quantity; i++) {
        const angle = i * delta_angle;
        particles.push(new Particle(0, /*(angle<Math.PI*0.5||angle>3*Math.PI*0.5 ? -particle_width : 0)*/ -particle_width * 0.5, /*(angle<Math.PI ? -particle_width : 0) +*/ particle_width * 0.5, vx_module * Math.cos(angle), vy_module * Math.sin(angle), ax_module * Math.cos(angle), ay_module * Math.sin(angle)));
    }
})();
set_scale(0.1);
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
