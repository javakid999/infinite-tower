#version 300 es

in vec2 vertexPosition;
in vec3 vertexColor;
out vec3 vColor;

void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    vColor = vertexColor;
}