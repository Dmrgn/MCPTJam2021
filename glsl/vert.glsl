// vertex position
// our vertex data
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vertTexCoord;

void main() {

    // copy the position data into a vec4, using 1.0 as the w component
    vec4 positionVec4 = vec4(aPosition, 1.0);

    vertTexCoord = positionVec4.xy;
    // scale the rect by two, and move it to the center of the screen
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    

    // send the vertex to the frag shader
    gl_Position = positionVec4;
}