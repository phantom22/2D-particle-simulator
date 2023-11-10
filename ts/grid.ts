    /** This object contains the pre-rendered CanvasImageSource of the grid to be drawn on screen. */
const GRID_CACHE = document.createElement("canvas"),
      _grid_ctx = GRID_CACHE.getContext("2d");

let grid_color = "#0f0f0f";

/** This function updates the cached grid with a new one. */
function update_grid() {

    let end_x = width,
        end_y = height,
        x_axis, y_axis;

    if (offset_y < 0 && offset_y + height > 0) {
        x_axis = -offset_y;
    }
    if (offset_x < 0 && offset_x + width > 0) {
        y_axis = -offset_x;
    }

    GRID_CACHE.width = width;
    GRID_CACHE.height = height;
    _grid_ctx.clearRect(0, 0, width, height);
    
    _grid_ctx.strokeStyle = grid_color;
    _grid_ctx.lineWidth = 1.5;
    _grid_ctx.beginPath();

    // vertical lines
    for (let x = cell_offset_x - particle_width; x<end_x; x += particle_width) {
        if (x === y_axis) continue;

        _grid_ctx.moveTo(x, 0);
        _grid_ctx.lineTo(x, height);
    }

    // horizontal lines
    for (let y = cell_offset_y - particle_width; y<end_y; y += particle_width) {
        if (y === x_axis) continue;

        _grid_ctx.moveTo(0, y);
        _grid_ctx.lineTo(width, y);

    }

    _grid_ctx.stroke();

    _grid_ctx.strokeStyle = "rgba(255,255,255,0.5)";
    _grid_ctx.lineWidth = 4;
    _grid_ctx.beginPath();

    if (x_axis !== undefined) {
        _grid_ctx.moveTo(0, x_axis);
        _grid_ctx.lineTo(width, x_axis);
    }

    if (y_axis !== undefined) {
        _grid_ctx.moveTo(y_axis, 0);
        _grid_ctx.lineTo(y_axis, height);
    }

    _grid_ctx.stroke();
}