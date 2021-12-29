//custom shader that renders light on the gpu

#define PROCESSING_TEXTURE_SHADER

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;
uniform vec2 texOffset;
uniform int numLights;
uniform float reso;
uniform float lightscontain[80]; //5 floats per light, x/y/red/green/blue with max 10 lights on screen at once
varying vec2 vertTexCoord;

void main () {
  if ((texture2D (texture, vec2(vertTexCoord.x,1.0-vertTexCoord.y)).rgb == vec3(0.0))) {
    
    vec3 col = vec3(0);
    float stepReduce = texOffset.x*reso;
    for (int li = 5; li >= 0; li--) {
      vec2 loc = vec2(lightscontain[li*5],  lightscontain[li*5+1]);
      vec2 distVec = ((loc - vec2(vertTexCoord.x,1.0-vertTexCoord.y))*2.0);
    //   loc = vec2(lightscontain[li*5] - distVec.x,  lightscontain[li*5+1] - distVec.y);
      vec2 dir = normalize(distVec) * -vec2(texOffset.x*reso,texOffset.y);
      float totDist = length(distVec);
      float step = (totDist);
      for (int i = 0; i < 299; i++) {
        if (i > int(step/stepReduce)) {
            break;
        }
        step -= stepReduce;
        if ((texture2D (texture, loc+=dir).rgb != vec3(0.0))) step = -100.0;
      }
      if (step > -100.0) {
        //red
        float val = clamp(1.0 - pow(totDist,lightscontain[li*5+2]),0.0,0.9);
        col.r = max(col.r,val)+ min(col.r,val)/8.0;
        col.r = clamp(col.r,0.0,0.9);
        //green
        val = clamp(1.0 - pow(totDist,lightscontain[li*5+3]),0.0,0.9);
        col.g = max(col.g,val)+ min(col.g,val)/8.0;
        col.g = clamp(col.g,0.0,0.9);
        //blue
        val = clamp(1.0 - pow(totDist,lightscontain[li*5+4]),0.0,0.9);
        col.b = max(col.b,val)+ min(col.b,val)/8.0;
        col.b = clamp(col.b,0.0,0.9);
      }
    };
    gl_FragColor.xyz = vec3(min(1.0, pow(col.r,3.0)),min(1.0, pow(col.g,3.0)),min(1.0, pow(col.b,3.0)));
    gl_FragColor.w = 1.0;
    } else {
    //   vec3 col = vec3(0);
    //   for (int li = 5; li >= 0; li--) {
    //     vec2 loc = vec2(lightscontain[li*5],  lightscontain[li*5 +1]);
    //     vec2 distVec = (loc - vec2(vertTexCoord.x,vertTexCoord.y));
    //     vec2 dir = normalize(distVec) * -vec2(texOffset.x*reso,texOffset.y);
    //     float totDist  =length(distVec);
    //     //red
    //     float val = clamp(1.0 - pow(totDist,lightscontain[li*5+2]),0.0,0.9);
    //     col.r = max(col.r,val)+ min(col.r,val)/8.0;
    //     col.r = clamp(col.r,0.0,0.9);
    //     //green
    //     val = clamp(1.0 - pow(totDist,lightscontain[li*5+3]),0.0,0.9);
    //     col.g = max(col.g,val)+ min(col.g,val)/8.0;
    //     col.g = clamp(col.g,0.0,0.9);
    //     //blue
    //     val = clamp(1.0 - pow(totDist,lightscontain[li*5+4]),0.0,0.9);
    //     col.b = max(col.b,val)+ min(col.b,val)/8.0;
    //     col.b = clamp(col.b,0.0,0.9);
    //   }
    //   gl_FragColor.xyz = vec3(min(1.0, pow(col.r,3.0)),min(1.0, pow(col.g,3.0)),min(1.0, pow(col.b,3.0)));
    //   gl_FragColor.w = 1.0;
        gl_FragColor.xyzw = vec4(0.0,0.0,0.0,1.0);
    }
  }
