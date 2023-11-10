const GRID_CACHE = document.createElement("canvas"),
      _grid_ctx = GRID_CACHE.getContext("2d");

let grid_color = "rgba(255, 255, 255, 0.1)",
    grid_is_dotted = false;

function update_grid() {

    // let gridStart = world_to_screen_cell(offset_x + PARTICLE_WIDTH, offset_y + PARTICLE_WIDTH),
    //     gridEnd = world_to_screen_cell(offset_x + width + PARTICLE_WIDTH, offset_y + height + PARTICLE_WIDTH);

    let end_x = width,
        end_y = height,
        x_axis, y_axis;

    if (offset_y < 0 && offset_y + height > 0) {
        x_axis = -offset_y;
    }
    if (offset_x < 0 && offset_x + width > 0) {
        y_axis = -offset_x;
    }

    //console.log({ cell_offset_x, end_x, cell_offset_y, end_y, offset_x, offset_y, x_axis, y_axis })

    GRID_CACHE.width = width;
    GRID_CACHE.height = height;
    _grid_ctx.clearRect(0, 0, width, height);
    
    _grid_ctx.strokeStyle = grid_color;
    if (grid_is_dotted) _grid_ctx.setLineDash([Math.ceil(2*PARTICLE_WIDTH/10), PARTICLE_WIDTH - Math.ceil(2*PARTICLE_WIDTH/10)]);
    _grid_ctx.lineWidth = 1;

    _grid_ctx.beginPath();

    // vertical lines
    for (let x = cell_offset_x - PARTICLE_WIDTH; x<end_x; x += PARTICLE_WIDTH) {
        if (x === y_axis) continue;

        _grid_ctx.moveTo(x, 0);
        _grid_ctx.lineTo(x, height);
        //console.log({ start: [x,0], end: [x, height] });
    }

    // horizontal lines
    for (let y = cell_offset_y - PARTICLE_WIDTH; y<end_y; y += PARTICLE_WIDTH) {
        if (y === x_axis) continue;

        _grid_ctx.moveTo(0, y);
        _grid_ctx.lineTo(width, y);

        //console.log({ start: [0, j], end: [width, j] });
    }

    _grid_ctx.stroke();

    if (grid_is_dotted) _grid_ctx.setLineDash([width]);

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