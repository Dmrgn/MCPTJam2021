// A screen to hold all light blocking objects
// Anything that should block light should be drawn here
let litscreen;
// temporary offscreen canvas
let offscreen;

let litshader;

// function initShader() {
//     litshader = loadShader("glsl/vert.glsl", "glsl/frag.glsl");
// }

function runShader () {
    offscreen.shader(litshader);
    litshader.setUniform('numlights',1);
    litshader.setUniform('reso',width/height);
    litshader.setUniform('texture',litscreen);
    litshader.setUniform('texOffset',[1/(width/4), 1/(height/4)]);
    litshader.setUniform('lightscontain',[mouseX/width,1-(-(mouseY-height)/height),0.4,0.4,0.4]);
    offscreen.rect(0,0,width,height);
    offscreen.resetShader();
    litscreen.drawingContext.drawImage(offscreen.drawingContext.canvas,0,0,width,height);
    // litscreen.filter(BLUR,1);
    blendMode(MULTIPLY);
    drawingContext.drawImage(litscreen.drawingContext.canvas,0,0,width,height);
    blendMode(BLEND);
}