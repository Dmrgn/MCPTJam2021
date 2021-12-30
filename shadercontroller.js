// A screen to hold all light blocking objects
// Anything that should block light should be drawn here
let litscreen;
// temporary offscreen canvas
let offscreen;

let litshader;

class Shader {
    lights = [];
    constructor(_shader) {
        this.shader = _shader;
    }
    // push any present shader frame onto the current canvas
    pushShader() {
        litscreen.drawingContext.drawImage(offscreen.drawingContext.canvas,0,0,width,height);
        blendMode(MULTIPLY);
        drawingContext.drawImage(litscreen.drawingContext.canvas,0,0,width,height);
        blendMode(BLEND);
        this.lights=[];
    }
    // runs the shader and stores the output on offscreen
    runShader() {
        offscreen.shader(this.shader);
        litshader.setUniform('numlights',this.lights.length);
        litshader.setUniform('reso',width/height);
        litshader.setUniform('texture',litscreen);
        litshader.setUniform('texOffset',[1/(width/2), 1/(height/2)]);
        const formatedlights = [];
        this.lights.forEach((light)=>{
            formatedlights.push(...light.format());
        });
        litshader.setUniform('lightscontain',formatedlights);
        offscreen.rect(0,0,offscreen.width,offscreen.height);
        offscreen.resetShader();
    }
    // adds a light to be drawn by the shader
    addLight(x,y,r,g,b) {
        this.lights.push(new Light(x,y,r,g,b));
    }
}

class Light{
    r;
    g;
    b;
    x;
    y;
    constructor(_x,_y,_r,_g,_b) {
        this.r = _r;
        this.g = _g;
        this.b = _b;
        this.x = _x;
        this.y = _y;
    }
    format() {
        let arr = [];
        arr.push(this.x/width);
        arr.push(1-(-(this.y-height)/height));
        arr.push(this.r/255);
        arr.push(this.g/255);
        arr.push(this.b/255);
        return arr;
    }
    // changes the lights brightness by a factor of factor
    brighter(factor) {
        this.r*=factor;
        this.g*=factor;
        this.b*=factor;
        min(max(this.r, 0), 255);
        min(max(this.g, 0), 255);
        min(max(this.b, 0), 255);
    }
}