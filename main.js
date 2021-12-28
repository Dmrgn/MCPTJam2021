// Tools class
class Tools {
    // stores the images
    images={};
    constructor(){
        // loads images from the json file
        loadJSON("data/manifest.json", function(manifest){
            for(let name in manifest){
                tool.images[name] = loadImage("data/" + manifest[name]);
            }
        });
    }
}

let tool; // tools
let img; // shorthand for getting an image

function preload() {
    // initialize tools and our img function
    tool = new Tools();
    img = function(id) {return tool.images[id]};
}

function setup() {
    // create canvas so that it is the same size as its parent
    let parEl = $("#gameContainer");
    createCanvas(parEl.width(), parEl.height()).parent("gameContainer");
    background(0);
}

// sample animation for draw
let x = 0

function draw() {
    background(0);
    fill(255);
    rect(x, 100, 100, 100);
    x++;
}

function mousePressed(){

}

// when the window is resized
function windowResized(){
    // resize the canvas to fill the parent element
    let parEl = $("#gameContainer");
    resizeCanvas(parEl.width(), parEl.height(), true);
}
