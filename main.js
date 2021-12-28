function preload() {
    // initialize tools
    tileController.init(); // tilecontroller.js
}

let world = new World(1237123);

function setup() {
    // create canvas so that it is the same size as its parent
    let parEl = $("#gameContainer");
    createCanvas(parEl.width(), parEl.height()).parent("gameContainer");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // draw pixel art without antialiasing
    // tileController.generateMap();
}

// temp
let mousepos = {
    x:0,
    y:0
}
let prevmousepos = {
    x:-1,
    y:-1
}

function draw() {
    world.tick();
    background(0);
    world.render();
}

function mousePressed() {

}

function keyPressed(){

}

// when the window is resized
function windowResized() {
    // resize the canvas to fill the parent element
    let parEl = $("#gameContainer");
    resizeCanvas(parEl.width(), parEl.height(), true);
}
