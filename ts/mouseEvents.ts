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
const _min_scale = 0.1,
      /** context: mouseEvents. Maximum scale value. */
      _max_scale = 5,
      _max_samples_per_frame = 3;

let _is_dragging = false,
    /** The selected particle is identified by its ID. */
    selected_particle = -1,
    no_mouse_mode = false;

function applyEventListeners(fps:number) {
    _drag_type = -1;
    _previous_mouse_position = null;
    scale_delta = 30 / fps;
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

function mousewheel(this:HTMLCanvasElement, e:WheelEvent) {
    if (_last_sample_frame === frame_count) return;

    set_scale(scale - Math.sign(e.deltaY) * scale_delta);
    _last_sample_frame = frame_count;
}

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

function mouseleave(this:HTMLCanvasElement, e:MouseEvent) {
    _drag_type = -1;
}