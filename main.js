let curState;

function preload() {
    tileController.init();
    world = new ExplorationWorld(1237123);
    litshader = loadShader("glsl/vert.glsl", "glsl/frag.glsl");
}

function setup() {
    // create canvas so that it is the same size as its parent
    let parEl = $("#gameContainer");
    createCanvas(parEl.width(), parEl.height()).parent("gameContainer");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // draw pixel art without antialiasing
    // tileController.generateMap();
    curState = new MainMenuState(new Shader(litshader));

    litscreen = createGraphics(width, height);
    offscreen = createGraphics(width/2, height/2, WEBGL);

}

let fr = null;

function draw() {
    curState.tick();
    curState.render();
    if (fr == null) {
        fr = frameRate();
    } else {
        fr += frameRate();
        fr /= 2;
        document.title = "FrameRate: " + fr;
    }
    frameRate(60);
}

function mousePressed() {
    curState.mousePressed();
    console.log(curState.world.getTile(floor(mouseX/Tile.WIDTH), floor(mouseY/Tile.HEIGHT)));
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
    curState = changeTo;
    changeTo.enterState();
}

// when the window is resized
function windowResized() {
    // resize the canvas to fill the parent element
    let parEl = $("#gameContainer");
    resizeCanvas(parEl.width(), parEl.height(), true);
}
