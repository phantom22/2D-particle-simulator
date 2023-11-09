const GRID_CACHE = document.createElement("canvas"),
      _grid_ctx = GRID_CACHE.getContext("2d");

let gridColor = "rgba(255, 255, 255, 0.5)";

function update_grid() {
    let gridStart = world_to_cell(offset_x + PARTICLE_WIDTH, offset_y + PARTICLE_WIDTH),
        gridEnd = world_to_cell(offset_x + width + PARTICLE_WIDTH, offset_y + height + PARTICLE_WIDTH);

    GRID_CACHE.width = width;
    GRID_CACHE.height = height;
    _grid_ctx.strokeStyle = gridColor;
    _grid_ctx.setLineDash([1, 9]);

    _grid_ctx.beginPath();

    // vertical lines
    for (let i = gridStart[0]; i<gridEnd[0]; i += PARTICLE_WIDTH) {
        _grid_ctx.moveTo(i, 0);
        _grid_ctx.lineTo(i, height);

        //console.log({ start: [i,0], end: [i, height] });
    }

    // horizontal lines
    for (let j = gridStart[1]; j<gridEnd[1]; j += PARTICLE_WIDTH) {
        _grid_ctx.moveTo(0, j);
        _grid_ctx.lineTo(width, j);

        //console.log({ start: [0, j], end: [width, j] });
    }

    _grid_ctx.stroke();

}