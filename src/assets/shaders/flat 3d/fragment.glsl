#version 300 es

precision highp float;

uniform sampler2D ascii;

in vec4 vColor;
in vec2 fragPos;
out vec4 fragColor;

void main() {
    vec2 uv = fragPos*20.0;
    uv.x *= 16.0/9.0;
    vec3 q = floor(vColor.xyz*4.0)/4.0;
    vec3 h = floor(clamp(length(vColor.xyz) == 0.0 ? vColor.xyz+0.58 : vColor.xyz * 1.5, 0.0, 1.0)*4.0)/4.0;
    float sum_c = (vColor.x + vColor.y + vColor.z) / 3.0;
    float sum_q = (q.x + q.y + q.z) / 3.0;
    float sum_h = (h.x + h.y + h.z) / 3.0;

    float x = (sum_q == sum_h) ? 0.0 : floor((sum_c - sum_q)/(sum_h - sum_q)*10.0)/10.0;

    float ascii_val = texture(ascii, vec2(x+fract(uv.x)/10.0, fract(uv.y))).x;

    fragColor = vec4((ascii_val == 0.0) ? q : h, 1.0);
    //fragColor = texture(ascii, vec2(floor(v*10.0)/10.0+fract(uv.x*10.0)/10.0, fract(uv.y)));
    //fragColor = texture(ascii, vec2(floor(x*10.0)/10.0+fract(uv.x*10.0), fract(uv.y)));
    //fragColor = texture(ascii, floor(v*10.0)/10.0*vec2(fract(uv.x/10.0), fract(uv.y)));
    //fragColor = vec4(vColor);
}