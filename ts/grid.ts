    /** This object contains the pre-rendered CanvasImageSource of the grid to be drawn on screen. */
const GRID_CACHE = document.createElement("canvas"),
      _grid_ctx = GRID_CACHE.getContext("2d");

    /**
     * Cached value of `particle_width - x_offset % particle_width`, needed for `update_grid()`. Read-only. 
     * 
     * ---
     * this value is changed by `set_world_offset(x,y)`.
     */
let cell_offset_x:number,
    /** 
     * Cached value of `particle_height - y_offset % particle_width`, needed for `update_grid()`. Read-only. 
     * 
     * ---
     * this value is changed by `set_world_offset(x,y)`.
     */
    cell_offset_y:number,
    ui_axis_color = "#9c9c9c",
    ui_grid_color = "#0c0c0c",
    /** If the current particle width is less than this treshold, stop drawing the gridlines. */
    no_grid_treshold = PARTICLE_RESOLUTION;

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
    
    // prevent very fine grid lines
    if (particle_width >= no_grid_treshold) {

        _grid_ctx.strokeStyle = ui_grid_color;
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

    }

    _grid_ctx.strokeStyle = ui_axis_color;
    _grid_ctx.fillStyle = ui_axis_color;
    _grid_ctx.lineWidth = 3;
    _grid_ctx.font = `${ui_font_size}px ${UI_FONT}`;
    _grid_ctx.beginPath();

    if (x_axis !== undefined) {
        _grid_ctx.moveTo(0, x_axis);
        _grid_ctx.lineTo(width, x_axis);
        _grid_ctx.fillText("x", width - ui_padding - ui_margin , x_axis - ui_padding - ui_margin);
    }

    if (y_axis !== undefined) {
        _grid_ctx.moveTo(y_axis, 0);
        _grid_ctx.lineTo(y_axis, height);
        _grid_ctx.fillText("y", y_axis + ui_padding + ui_margin, ui_padding + ui_margin);
    }

    _grid_ctx.stroke();
}