// On window resize, trigger adapting canvas resolution.
window.addEventListener("resize", _ => _update_canvas_size = true);

window.addEventListener("keydown", e => {
    if (_last_sample_frame === frame_count) return;
    switch (e.key) {
        // On spacebar key press, toggle pause.
        case " ":
            unpaused = !unpaused;
            if (unpaused === true && time_scale === 0) {
                set_time_scale(1);
            }
            _last_sample_frame = frame_count;
            break;
        // On right arrow key down, cycle clockwise between the particles by selecting them.
        case "ArrowRight":
            if (selected_particle ===  particles.length - 1) selected_particle = -1;
            else selected_particle++;
            break;
        // On left arrow key down, cycle anti-clockwise between the particles by selecting them.
        case "ArrowLeft":
            if (selected_particle === -1) selected_particle = selected_particle = particles.length - 1;
            else selected_particle--;
            break;
        // On ctrl key down, reset selected particle. 
        case "Control":
            selected_particle = -1;
            break;
        // On g key down, toggle snap_to_grid.
        case "g":
            snap_to_grid = !snap_to_grid;
            _last_sample_frame = frame_count;
            break;
        default:
            break;
    }
});

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
     * How much scolling the wheel will change a value in a second. Read-only.
     * 
     * the value depends on the detected frame rate.
     */
    scroll_wheel_delta:number;
      /** Minimun `scale` value. */
const _min_scale = 0.08,
      /** Maximum `scale` value. */
      _max_scale = 6.25,
      /** Maximum number of mousemove events processed per frame. */
      _max_samples_per_frame = 3,
      /** Minimum `time_scale` value. */
      _min_time_scale = 0,
      /** Minimum `time_scale` value. */
      _max_time_scale = 5;

    /** Has the user began a drag event? */
let _is_dragging = false,
    /** 
     * The selected particle is identified by its ID, which is its position in the `particles` array. 
     * 
     * won't reset if already defined.
     */
    selected_particle:number,
    /** Helps laptop users; if set to true, M1 instead of M3 is used to move around the grid. */
    no_mouse_mode = false;

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
    scroll_wheel_delta = 15 / fps;
    _last_sample_frame = -1;
    scale = scale ?? 1;
    inv_scale = 1 / scale;
    time_scale = time_scale ?? 1;
    _is_dragging = false;
    selected_particle = selected_particle ?? -1,
    _sample_counter = 0;

    canvas.addEventListener("wheel", mousewheel);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseleave", mouseleave);
}

/**
 * This function will update the `scale` value (if the shift key was not pressed) in the following way:
 * 
 * - if the scroll wheel was moved forward, then zoom-out.
 * - zoom-in, otherwise.
 * 
 * If the shift key was pressed, update the `time_scale` value:
 * 
  - if the scroll wheel was moved forward, then speed-up the simulation.
  - slow-down otherwise
 *
 * The scale update rate is capped to the `Display.fps` refresh rate by `_last_sample_frame` which is updated each time
 * this function is succesfully triggered.
 */
function mousewheel(this:HTMLCanvasElement, e:WheelEvent) {
    if (_last_sample_frame === frame_count) return;

    const change = -Math.sign(e.deltaY) * scroll_wheel_delta;

    if (e.shiftKey) {
        set_time_scale(time_scale + change);
        if (time_scale === 0 && unpaused === true) {
            unpaused = false;
        }
        else if (time_scale > 0 && unpaused === false) {
            unpaused = true;
        }
    }
    else {
        set_scale(scale + change);
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
            if (no_mouse_mode) set_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
            break;
        // Wheel/Middle button
        case 1:
            if (!no_mouse_mode) set_offset(offset_x + _previous_mouse_position[0] - currentPos[0], offset_y + _previous_mouse_position[1] - currentPos[1]);
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
}