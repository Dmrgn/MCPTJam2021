let curState;

function preload() {
<<<<<<< Updated upstream
    tileController.init();
=======
    world = new World(1237123);
    litshader = loadShader("glsl/vert.glsl", "glsl/frag.glsl");
>>>>>>> Stashed changes
}

function setup() {
    // create canvas so that it is the same size as its parent
    let parEl = $("#gameContainer");
    createCanvas(parEl.width(), parEl.height()).parent("gameContainer");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // draw pixel art without antialiasing
    // tileController.generateMap();
<<<<<<< Updated upstream
    curState = new MainMenuState();
}

function draw() {
    curState.tick();
    curState.render();
=======
    offscreen = createGraphics(width, height, WEBGL);
    litscreen = createGraphics(width,height);
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
    litscreen.background(0);
    world.render();
    runShader();
>>>>>>> Stashed changes
}

function mousePressed() {
    curState.mousePressed();
}

function mouseReleased(){
    curState.mouseReleased();
}

function keyReleased(){
    curState.keyReleased();
}

function keyPressed(){
    curState.keyPressed();
}

function changeState(changeTo){
    curState.exitState();
    changeTo.enterState();
    curState = changeTo;
}

// when the window is resized
function windowResized() {
    // resize the canvas to fill the parent element
    let parEl = $("#gameContainer");
    resizeCanvas(parEl.width(), parEl.height(), true);
}
