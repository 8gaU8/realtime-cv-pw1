uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

precision highp float;

in vec3 position;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}
