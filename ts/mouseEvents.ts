    /** context: mouseEvents. -1 = none, 0 = drawing, 1 = moving, 2 = removing/inspecting */
let _drag_type: -1|0|1|2,
    /** context: mouseEvents. Needed for mouse drag functionality. */
    _previous_mouse_position: [x:number, y:number],
    /** context: mouseEvents. Needed to reduce lag from the mouse Move event. Indicates last frame in which the event was registered. */
    _last_sample_frame: number,
    _sample_counter: number,
    /** Current canvas scale. 1 is the default value. */
    scale: number,
    inv_scale: number,
    /** context: mouseEvents. How much can the scale change in a second. */
    scale_delta: number;
      /** context: mouseEvents. Minimun scale value. */
const _min_scale = 0.05,
      /** context: mouseEvents. Maximum scale value. */
      _max_scale = 10,
      _max_samples_per_frame = 3;

let _is_dragging = false,
    /** The selected particle is identified by its ID. */
    selected_particle = -1,
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
 * Resets all the helper variables and flags to their default values; if scale or selected_particle was already defined, do not reset them.
 */
function applyEventListeners(fps:number) {
    _drag_type = -1;
    _previous_mouse_position = null;
    scale_delta = 15 / fps;
    _last_sample_frame = -1;
    scale = scale ?? 1;
    inv_scale = 1 / scale;
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
 * This function will update the `scale` value in the following way:
 * 
 * - if the scroll wheel was moved forward, then zoom out.
 * - otherwise, zoom in.
 * 
 * The scale update rate is capped to the `Display.fps` refresh rate by `_last_sample_frame` which is updated each time
 * this function is succesfully triggered.
 */
function mousewheel(this:HTMLCanvasElement, e:WheelEvent) {
    if (_last_sample_frame === frame_count) return;

    set_scale(scale - Math.sign(e.deltaY) * scale_delta);
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