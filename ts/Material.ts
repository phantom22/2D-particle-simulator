type materialCache = { [type:number]: HTMLCanvasElement };

/** This objects contains all the CanvasImageSources that pre-rendered all the avaiable particle materials. */
const MATERIAL_CACHE = [] as materialCache;

class Material {
    static MATERIALS = {
        sand: "#C2B280",
        stone: "#888C8D"
    };
    static MAX_TYPE_VALUE = Object.keys(Material.MATERIALS).length - 1;
    static TYPE_TO_NAME: (type:number) => string;

    type: number;

    constructor(type:number) {
        if (type === undefined || type < 0 || type > Material.MAX_TYPE_VALUE) throw `${type} is not a valid material type index!`;
        this.type = type;
    }
}

(function() {

    const keys = Object.keys(Material.MATERIALS),
          size = particle_width;

    for (let i=0; i<keys.length; i++) {
        let material = keys[i],
            canvas = document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        let ctx = canvas.getContext("2d");
        ctx.fillStyle = Material.MATERIALS[material];
        ctx.fillRect(0,0,size,size);

        MATERIAL_CACHE[i] = canvas;
    }

    Material.MAX_TYPE_VALUE = keys.length - 1;
    Material.TYPE_TO_NAME = (type:number) => keys[type]||"invalid type";

})();
