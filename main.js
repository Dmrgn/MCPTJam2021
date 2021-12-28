let maze;

function preload() {
    // initialize tools
    tools.init(); // utils/tools.js
    tileController.init(); // tilecontroller.js
}

function setup() {
    // create canvas so that it is the same size as its parent
    let parEl = $("#gameContainer");
    createCanvas(parEl.width(), parEl.height()).parent("gameContainer");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // draw pixel art without antialiasing
    // create maze
    maze = new Maze(10, Math.floor(Math.random() * 87238127893));
    // tileController.generateMap();
}

function draw() {
    background(0);
    tileController.preparePerimeter(floor(mouseX/Tile.WIDTH),floor(mouseY/Tile.HEIGHT), 9);
    tileController.drawTiles();
}

function mousePressed() {

}

// when the window is resized
function windowResized() {
    // resize the canvas to fill the parent element
    let parEl = $("#gameContainer");
    resizeCanvas(parEl.width(), parEl.height(), true);
}
