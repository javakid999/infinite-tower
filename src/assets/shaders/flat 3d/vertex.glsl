#version 300 es

uniform mat4 world;
uniform mat4 view;
uniform mat4 proj;

in vec3 vertexPosition;
in vec3 vertexNormal;
in vec4 vertexColor;
out vec4 vColor;
out vec2 fragPos;

void main() {
    vec4 screenspace = proj * view * world * vec4(vertexPosition, 1.0);
    vec3 lightDir = (proj * view * world * vec4(0.0, 0.5, 1.0, 0.0)).xyz;
    vColor = vertexColor * clamp(dot(lightDir, vertexNormal)+0.2, 0.5, 1.5);
    fragPos = screenspace.xy/screenspace.w;
    gl_Position = screenspace;
}