precision highp float;

uniform int sizeDiv2;
uniform sampler2D image;
uniform float scale;
uniform float translateX;
uniform float translateY;
uniform int kernelSize;

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

vec4 gaussianBlur(int centerX, int centerY, int kernelSize) {
    vec4 textureValue = vec4(0.0);
    for (int i = -kernelSize/2; i < kernelSize/2; i++) {
        for (int j = -kernelSize/2 ; j< kernelSize/2; j++){
            textureValue += texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
        }
    }
    return textureValue / float(kernelSize * kernelSize);
}

void main(void) {
    ivec2 texSize2d = textureSize(image, 0);


    // Apply translation
    int leftX = int((gl_FragCoord.x + translateX * float(texSize2d.x))* scale ) % (texSize2d.x / 2);
    int leftY = int((gl_FragCoord.y + translateY * float(texSize2d.y))* scale ) % texSize2d.y;
    leftX = int(gl_FragCoord.x);
    leftY = int(gl_FragCoord.y);

    vec4 leftTextureValue = gaussianBlur(leftX, leftY, kernelSize);
    int rightX = leftX + texSize2d.x / 2;
    int rightY = leftY;

    vec4 rightTextureValue = texelFetch( image, ivec2(rightX, rightY), 0 );

    // Color Anaglyphs
    out_FragColor.a = 1.0;
    out_FragColor.rgb = ANAGLYPH(leftTextureValue.rgb, rightTextureValue.rgb);

}
