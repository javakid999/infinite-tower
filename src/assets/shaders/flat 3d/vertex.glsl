#version 300 es

uniform mat4 world;
uniform mat4 view;
uniform mat4 proj;

in vec3 vertexPosition;
in vec4 vertexColor;
out vec4 vColor;

void main() {
    gl_Position = proj * view * world * vec4(vertexPosition, 1.0);
    vColor = vertexColor;
}