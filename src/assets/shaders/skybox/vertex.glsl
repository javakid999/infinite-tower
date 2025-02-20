#version 300 es
precision highp float;

in vec2 screenPosition;

out vec4 position;

void main() {
    position = vec4(screenPosition, 1.0, 1.0);
    gl_Position = vec4(screenPosition, 1.0, 1.0);
}