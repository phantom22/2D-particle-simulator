    /** context: mouseEvents. -1 = none, 0 = drawing, 1 = moving, 2 = removing/inspecting */
let _drag_type: -1|0|1|2,
    /** context: mouseEvents. Needed for mouse drag functionality. */
    _previousMousePosition: [x:number, y:number],
    /** context: mouseEvents. Needed to reduce lag from the mouse Move event. Indicates last frame in which the event was registered. */
    _lastSampleFrame: number,
    /** Current canvas scale. 1 is the default value. */
    scale = 1,
    /** context: mouseEvents. How much can the scale change in a second. */
    scaleDelta: number;
      /** context: mouseEvents. Minimun scale value. */
const _minScale = 0.1,
      /** context: mouseEvents. Maximum scale value. */
      _maxScale = 5;

function applyEventListeners(fps:number) {
    _drag_type = -1;
    _previousMousePosition = null;
    scaleDelta = 1 / fps;
    _lastSampleFrame = -1;

    canvas.addEventListener("wheel", mousewheel);
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mouseleave", mouseleave);
}

function mousewheel(this:HTMLCanvasElement, e:WheelEvent) {
    scale = Math.min(_minScale, Math.max(scale - Math.sign(e.deltaY) * scaleDelta, _maxScale));
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
    _previousMousePosition = [e.clientX, e.clientY];
}

function mousemove(this:HTMLCanvasElement, e:MouseEvent) {
    if (_drag_type === -1 || frameCount === _lastSampleFrame) return;

    const currentPos = [e.clientX, e.clientY] as [x:number, y:number];
    switch (_drag_type) {
        // Left button
        case 0:
            break;
        // Wheel/Middle button
        case 1:
            set_offset(offset_x + _previousMousePosition[0] - currentPos[0], offset_y + _previousMousePosition[1] - currentPos[1]);
            break;
        // Right button
        case 2:
            break;
        // Any other auxiliary button
        default:
            _drag_type = -1;
            return;
    }

    _previousMousePosition = currentPos;
    _lastSampleFrame = frameCount;
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
}

function mouseleave(this:HTMLCanvasElement, e:MouseEvent) {
    _drag_type = -1;
}