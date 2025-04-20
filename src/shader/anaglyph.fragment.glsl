precision highp float;

uniform int sizeDiv2;
uniform sampler2D image;
uniform float scale;
uniform float translateX;
uniform float translateY;

out vec4 out_FragColor;

void main(void) {
    ivec2 texSize2d = textureSize(image, 0);

    // Apply translation
    int x = int((gl_FragCoord.x + translateX * float(texSize2d.x))* scale ) % texSize2d.x;
    int y = int((gl_FragCoord.y + translateY * float(texSize2d.y))* scale ) % texSize2d.y;

    vec4 textureValue = texelFetch(image, ivec2(x, y), 0 );

    out_FragColor = textureValue;

}
