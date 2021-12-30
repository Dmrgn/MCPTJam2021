let curState;
let seed = Math.floor(Math.random() * 71828123897187231);

function preload() {
    tileController.init();
    litshader = loadShader("glsl/vert.glsl", "glsl/frag.glsl");
    loadSprites();
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
    frameRate(60);
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
}

let didAutoplay = false;

function mousePressed() {
    getSprite("splash").play();
    if(didAutoplay){
        curState.mousePressed();
    }
    didAutoplay = true;
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
