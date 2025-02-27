#version 300 es
precision highp float;

uniform samplerCube skybox;
uniform samplerCube skybox2;
uniform samplerCube skybox3;
uniform sampler2D ascii;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 world;
uniform float time;
in vec4 position;

out vec4 fragColor;


float random2f (ivec2 _st) {
    return fract(sin(dot(vec2(float(_st.x), float(_st.y)),vec2(12.9898,78.233)))*43758.5453123);
}

vec4 sky() {
    vec4 t = inverse(proj * world) * floor(position*80.0)/80.0;
    return texture(skybox, normalize(-t.xyz / t.w));
}

vec4 sky2() {
    vec4 t = inverse(proj * world) * floor(position*80.0)/80.0;
    return 2.0*texture(skybox2, normalize(-t.xyz / t.w));
}

vec4 sky3() {
    vec4 t = inverse(proj * world) * floor(position*80.0)/80.0;
    return 2.0*texture(skybox3, normalize(-t.xyz / t.w));
}

float voronoiDistance( vec2 x ) {
    ivec2 p = ivec2(floor( x ));
    vec2  f = fract( x );

    ivec2 mb;
    vec2 mr;

    float res = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        ivec2 b = ivec2(i, j);
        vec2  r = vec2(b) + random2f(p+b)-f;
        float d = dot(r,r);

        if( d < res )
        {
            res = d;
            mr = r;
            mb = b;
        }
    }

    res = 8.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        ivec2 b = mb + ivec2(i, j);
        vec2  r = vec2(b) + random2f(p+b) - f;
        float d = dot(0.5*(mr+r), normalize(r-mr));

        res = min( res, d );
    }

    return res;
}

void main() {
    vec4 bgs[5] = vec4[5](
        sky(), 
        vec4(1.0, 0.1, 0.1, 1.0) * voronoiDistance(floor(position.xy*80.0*6.0)/80.0 + vec2(time*2.0))-voronoiDistance(floor(position.xy*80.0*2.0)/80.0 - vec2(time/4.0)), 
        sky2(), 
        vec4(0.2, 1.0, 0.3, 1.0) * voronoiDistance(floor(position.xy*80.0*3.0)/80.0 - vec2(time*0.4))-voronoiDistance(floor(position.xy*80.0*10.0)/80.0 - vec2(time*3.0)), 
        sky3()
    );

    float t = mod(10.0*max(mod(time/13.0,1.0)-0.9, 0.0)+floor(time/13.0), 5.0);
    vec4 sColor = mix(bgs[int(t)], bgs[(int(mod(t+1.0, 5.0)))], fract(t));

    vec2 uv = (position.xy/2.0 + 0.5)*80.0;
    vec3 q = floor(sColor.xyz*4.0)/4.0;
    vec3 h = floor(clamp(length(sColor.xyz) == 0.0 ? sColor.xyz+0.58 : sColor.xyz * 2.0, 0.0, 1.0)*4.0)/4.0;
    float sum_c = (sColor.x + sColor.y + sColor.z) / 3.0;
    float sum_q = (q.x + q.y + q.z) / 3.0;
    float sum_h = (h.x + h.y + h.z) / 3.0;

    float x = (sum_q == sum_h) ? 0.0 : floor((sum_c - sum_q)/(sum_h - sum_q)*10.0)/10.0;

    float ascii_val = texture(ascii, vec2(x+fract(uv.x)/10.0, fract(uv.y))).x;

    fragColor = vec4((ascii_val == 0.0) ? q : h, 1.0);
    //fragColor = vec4(uv, 0.0, 1.0);
}