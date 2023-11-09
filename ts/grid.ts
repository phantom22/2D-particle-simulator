const GRID_CACHE = document.createElement("canvas"),
      _grid_ctx = GRID_CACHE.getContext("2d");

let gridColor = "rgba(255, 255, 255, 0.1)";

function update_grid() {

    // let gridStart = world_to_screen_cell(offset_x + PARTICLE_WIDTH, offset_y + PARTICLE_WIDTH),
    //     gridEnd = world_to_screen_cell(offset_x + width + PARTICLE_WIDTH, offset_y + height + PARTICLE_WIDTH);

    let end_x = width - width % PARTICLE_WIDTH,
        end_y = height - height % PARTICLE_WIDTH,
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
    
    _grid_ctx.strokeStyle = gridColor;
    //_grid_ctx.setLineDash([1, 9]);
    _grid_ctx.lineWidth = 1;

    _grid_ctx.beginPath();

    // vertical lines
    for (let x = cell_offset_x; x<end_x; x += PARTICLE_WIDTH) {
        if (x === y_axis) continue;

        _grid_ctx.moveTo(x, 0);
        _grid_ctx.lineTo(x, height);
        //console.log({ start: [x,0], end: [x, height] });
    }

    // horizontal lines
    for (let y = cell_offset_y; y<end_y; y += PARTICLE_WIDTH) {
        if (y === x_axis) continue;

        _grid_ctx.moveTo(0, y);
        _grid_ctx.lineTo(width, y);

        //console.log({ start: [0, j], end: [width, j] });
    }

    _grid_ctx.stroke();


    if (x_axis !== undefined) {
        _grid_ctx.strokeStyle = "rgba(255,255,255,0.5)";
        _grid_ctx.lineWidth = 4;
        _grid_ctx.beginPath();
        _grid_ctx.moveTo(0, x_axis);
        _grid_ctx.lineTo(width, x_axis);
        _grid_ctx.stroke();
    }

    if (y_axis !== undefined) {
        _grid_ctx.strokeStyle = "rgba(255,255,255,0.5)";
        _grid_ctx.lineWidth = 4;
        _grid_ctx.beginPath();
        _grid_ctx.moveTo(y_axis, 0);
        _grid_ctx.lineTo(y_axis, height);
        _grid_ctx.stroke();
    }
}