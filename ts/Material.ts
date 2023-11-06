type materialCache = { [type:number]: HTMLCanvasElement };

const _particleWidth = 10,
      _cache = [] as materialCache;

class Material {
    static maxTypeValue: number;
    static typeToName: (type:number) => string;

    type: number;
    position: [x:number, y:number];
    acceleration: [x:number, y:number];

    constructor(type:number, x:number, y:number) {
        if (typeof type==="undefined"|| type < 0 || type > Material.maxTypeValue) throw `${type} is not a valid material type index!`;
        this.type = type;
        this.position = [x,y];
        this.acceleration = [0,0];
    }
}

(function(){
    let colors = {
        sand: "#C2B280",
        stone: "#888C8D"
    },
        keys = Object.keys(colors),
        cache = [];

    for (let i=0; i<keys.length; i++) {
        let material = keys[i];
        let canvas = document.createElement("canvas");
        canvas.width = _particleWidth;
        canvas.height = _particleWidth;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = colors[material];
        ctx.fillRect(0,0,_particleWidth,_particleWidth);
        _cache[i] = canvas;
    }

    Material.maxTypeValue = keys.length - 1;
    Material.typeToName = (type:number) => keys[type]||"invalid type";
})()
