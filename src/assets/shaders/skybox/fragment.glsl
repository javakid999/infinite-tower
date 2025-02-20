#version 300 es
precision highp float;

uniform samplerCube skybox;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 world;
in vec4 position;

out vec4 fragColor;

void main() {
    vec4 t = inverse(proj * view * world) * position;
    fragColor = texture(skybox, normalize(-t.xyz / t.w));
}