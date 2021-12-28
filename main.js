class Tools {
    images={}
    constructor(){
        loadJSON("data/manifest.json", function(manifest){
            for(let name in manifest){
                tool.images[name] = loadImage("data/" + manifest[name])
            }
        })
    }
}

let tool;
let img;

function preload() {
    tool = new Tools();
    img = function(id) {return tool.images[id]}
}

function setup() {
    createCanvas(512, 512);
    background(0);
}

function draw() {
    background(0)
    fill(255)
    rect(200, 100, 100, 100)
    image(img("player"), 0, 0, 100, 100)
}
