precision highp float;

uniform int sizeDiv2;
uniform sampler2D image;
uniform float scale;
uniform float translateX;
uniform float translateY;

out vec4 out_FragColor;

vec3 trueAnaglyph(vec3 left, vec3 right){
    vec3 color = vec3(0.0);
    color.r = 0.299 * left.r + 0.587 * left.g + 0.114 * left.b;
    color.b = 0.299 * right.r + 0.587 * right.g + 0.114 * right.b;
    return color;
}


vec3 grayAnaglyph(vec3 left, vec3 right){
    vec3 color = vec3(0.0);
    color.r = 0.299 * left.r + 0.587 * left.g + 0.114 * left.b;
    color.g = 0.299 * right.r + 0.587 * right.g + 0.114 * right.b;
    color.b = 0.299 * right.r + 0.587 * right.g + 0.114 * right.b;
    return color;
}

vec3 colorAnaglyph(vec3 left, vec3 right) {
    vec3 color = vec3(0.0);
    color.r = left.r;
    color.g = right.g;
    color.b = right.b;
    return color;
}

vec3 halfColorAnaglyph(vec3 left, vec3 right) {
    vec3 color = vec3(0.0);
    color.r = 0.299 * left.r + 0.587 * left.g + 0.114 * left.b;
    color.g = right.g;
    color.b = right.b;
    return color;
}

vec3 optimizedAnaglyph(vec3 left, vec3 right) {
    vec3 color = vec3(0.0);
    color.r = 0.7 * left.r + 0.3 * left.r;
    color.g = right.g;
    color.b = right.b;
    return color;
}


void main(void) {
    ivec2 texSize2d = textureSize(image, 0);

    // Apply translation
    int leftX = int((gl_FragCoord.x + translateX * float(texSize2d.x))* scale ) % (texSize2d.x / 2);
    int leftY = int((gl_FragCoord.y + translateY * float(texSize2d.y))* scale ) % texSize2d.y;

    vec4 leftTextureValue = texelFetch(image, ivec2(leftX, leftY), 0 );

    int rightX = leftX + texSize2d.x / 2;
    int rightY = leftY;
    vec4 rightTextureValue = texelFetch(image, ivec2(rightX, rightY), 0 );

    // Color Anaglyphs
    out_FragColor.a = 1.0;
    // ANAGLYPH is macro defined at /src/shader.js
    out_FragColor.rgb = ANAGLYPH(leftTextureValue.rgb, rightTextureValue.rgb);

}
