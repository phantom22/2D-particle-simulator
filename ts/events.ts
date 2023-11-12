/** What type of mousemove event is happening right now?
 * 
 * - -1 = none
 * - 0 = TBD
 * - 1 = moving
 * - 2 = TBD */ 
// 0 = drawing, 2 = removing/inspecting
let _drag_type: -1|0|1|2,
    /** Needed for mouse drag functionality. */
    _previous_mouse_position:[x:number, y:number],
    /** Needed to reduce lag from the mouse Move event. Indicates last frame in which the event was registered. */
    _last_sample_frame:number,
    _sample_counter:number,
    /** 
     * Current rendering scale. Read-only. 
     * 
     * ---
     * use `set_scale(value)` to change this value; won't reset if already defined.
     */
    scale:number,
    /** 
     * Inverse of the current canvas scale value. Read-only.
     *
     * ---
     * this value is changed by `set_scale(value)`.
     */
    inv_scale:number,
    /** 
     * Current physics time scale. Read-only. 
     * 
     * ---
     * use `set_time_scale(value)` to change this value; won't reset if already defined.
     */
    time_scale:number,
    /** 
     * How much scrolling the wheel will change the `scale` per second of scrolling. Read-only.
     * 
     * the value depends on the detected frame rate.
     */
    scale_scroll_wheel_delta:number,
    /** 
     * How much scrolling the wheel will change the `time_scale` per second of scrolling. Read-only.
     * 
     * the value depends on the detected frame rate.
     */
    time_scale_scroll_wheel_delta:number;
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
      _ctrl_wheel_slow_down = 1/10,
      /** When pressing shift and scrolling the mouse wheel, this multiplier is applied to `scale_scroll_wheel_delta` and `time_scale_scroll_wheel_delta`. */
      _shift_wheel_speed_up = 3,
      /** Maximum number of mousemove events processed per frame. */
      _max_samples_per_frame = 3.

    /** Is the user in the middle of a drag event? */
let _is_dragging:boolean,
    /** Is the user currently pressing the T button, enabling `time_scale` modification? */
    _is_pressing_time_scale_button:boolean,
    /** 
     * The selected particle is identified by its ID, which is its position in the `particles` array. 
     * 
     * won't reset if already defined.
     */
    selected_particle:number,
    selected_particle_camera_offset:[x:number, y:number],
    /** Helps laptop users; if set to true, M1 instead of M3 is used to move around the grid. */
    no_mouse_mode = false;


console.warn("selected_particle_camera_offset is yet to be implemented on mouse move when selected_particle is greater than -1!")
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
function applyEventListeners(fps:number) {
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
    if (e.ctrlKey) e.preventDefault() 
}, { passive:false }); // passive:false => enable preventDefault().

/**
 * This functions checks for keyboard input; the following keys are mapped:
 * - SPACEBAR: 
 *      toggle pause. If, after toggling, `unpaused` is set to true and `time_scale` is set to 0,
 *          simply reset it to 1.
 * - RIGHT ARROW: cycle clockwise through the particles by assigning them to `selected_particle`.
 * - LEFT ARROW: cycle anti-clockwise through the particles by assigning them to `selected_particle`.
 * - Esc: disable its default behaviour and set `selected_particle` to -1.
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
        case "Esc":
            selected_particle = -1;
            return;
        case "ArrowRight":
            if (selected_particle ===  particles.length - 1) selected_particle = -1;
            else selected_particle++;
            return;
        case "ArrowLeft":
            if (selected_particle === -1) selected_particle = selected_particle = particles.length - 1;
            else selected_particle--;
            return;
    }

    if (_last_sample_frame === frame_count) return;
    // events that need to be capped to the refresh rate.
    switch (e.key) {
        case " ":
            unpaused = !unpaused;
            if (unpaused === true && time_scale === 0) {
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
}, { passive:false });

window.addEventListener("keyup", e  => {
    switch (e.key) {
        case "t":
            _is_pressing_time_scale_button = false;
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
function mousewheel(this:HTMLCanvasElement, e:WheelEvent) {
    if (_last_sample_frame === frame_count) return;

    const multiplier = e.shiftKey ? _shift_wheel_speed_up : (e.ctrlKey ? _ctrl_wheel_slow_down : 1),
          change_dir = -Math.sign(e.deltaY) * multiplier;

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
function mousedown(this:HTMLCanvasElement, e:MouseEvent) {
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
function mousemove(this:HTMLCanvasElement, e:MouseEvent) {
    if (_drag_type === -1 || _last_sample_frame === frame_count && _sample_counter === _max_samples_per_frame) return;

    const currentPos = [e.clientX, e.clientY] as [x:number, y:number];
    switch (_drag_type) {
        // Left button
        case 0:
            if (no_mouse_mode) set_world_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
            break;
        // Wheel/Middle button
        case 1:
            if (!no_mouse_mode) set_world_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
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
function mouseup(this:HTMLCanvasElement, e:MouseEvent) {
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
function mouseleave(this:HTMLCanvasElement, e:MouseEvent) {
    _drag_type = -1;
    _is_pressing_time_scale_button = false;
}