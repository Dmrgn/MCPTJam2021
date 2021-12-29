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
    litshader.setUniform('texOffset',[1/width, 1/height]);
    litshader.setUniform('lightscontain',[mouseX/width,1-(-(mouseY-height)/height),0.5,0.5,0.5]);
    offscreen.rect(0,0,width,height);
    blendMode(MULTIPLY);
    drawingContext.drawImage(offscreen.drawingContext.canvas,0,0,width,height);
    blendMode(BLEND);
}

const offscreenInst = (p) => {
    p.setup = function () {
        p.createCanvas(width, height, WEBGL);
        // p.noStroke();
    }
    p.draw = function () {
        offscreen.shader(litshader);
        // console.log(litshader);
        // litshader.setUniform('numlights',1);
        // litshader.setUniform('reso',width/height);
        // litshader.setUniform('lightscontain',[mouseX,mouseY,255,255,255]);
        // litscreen.background(255);
        // offscreen.image(litscreen,0,0,width,height);
        offscreen.rect(-width/2,-height/2,width,height);
        // offscreen.resetShader()
    }
}