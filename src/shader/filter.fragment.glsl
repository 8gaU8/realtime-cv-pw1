precision highp float;

uniform int sizeDiv2;
uniform sampler2D image;
uniform float scale;
uniform float translateX;
uniform float translateY;
uniform int kernelSize;
uniform float sigma;

out vec4 out_FragColor;

#define PI 3.1415926
    
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

vec4 averageFilter(int centerX, int centerY) {
    vec4 textureValue = vec4(0.0);
    for (int i = -kernelSize/2; i < kernelSize/2; i++) {
        for (int j = -kernelSize/2 ; j< kernelSize/2; j++){
            textureValue += texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
        }
    }
    return textureValue / float(kernelSize * kernelSize);
}

vec4 gaussianFilter(int centerX, int centerY) {
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf
    vec4 textureValue = vec4(0.0);
    float twoSigmaSquare = 2.0 * sigma * sigma;
    float twoPiSigmaSquare = PI * twoSigmaSquare;
    for (int x = -kernelSize/2; x < kernelSize/2; x++) {
        for (int y = -kernelSize/2 ; y< kernelSize/2; y++){
            float weight = exp(-(float(x*x + y*y) / twoSigmaSquare)) / twoPiSigmaSquare;
            textureValue += texelFetch( image, ivec2(centerX + x, centerY + y), 0 ) * weight;
        }
    }
    return textureValue;
}

vec4 laplacian(int centerX, int centerY){
    // https://homepages.inf.ed.ac.uk/rbf/HIPR2/log.htm
    vec4 textureValue = vec4(0.0);
    for (int i = -kernelSize/2; i < kernelSize/2; i++) {
        for (int j = -kernelSize/2 ; j< kernelSize/2; j++){
            if (i == 0 && j == 0) {
                textureValue += texelFetch( image, ivec2(centerX + i, centerY + j), 0 ) * float(kernelSize*kernelSize-1);
            } else {
                textureValue -= texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
            }
        }
    }
    return textureValue / float(kernelSize * kernelSize);
}

vec4 separableGaussianFilter(int centerX, int centerY){
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf 3.6 Separability
    vec4 textureValue = vec4(0.0);
    float twoSigmaSquare = 2.0 * sigma * sigma;
    float sqrt2PiSigma = sqrt(2.0 * PI) * sigma;

    for (int x = -kernelSize/2; x < kernelSize/2; x++) {
        float weight = exp(-(float(x*x) / twoSigmaSquare)) / sqrt2PiSigma;
        textureValue += texelFetch( image, ivec2(centerX + x, centerY), 0 ) * weight;
    }
    for (int y = -kernelSize/2; y < kernelSize/2; y++) {
        float weight = exp(-(float(y*y) / twoSigmaSquare)) / sqrt2PiSigma;
        textureValue += texelFetch( image, ivec2(centerX, centerY + y), 0 ) * weight;
    }
    return textureValue;
}

vec4 medianFilter(int centerX, int centerY) {
    vec4 textureValues[16];
    int index = 0;
    // Collect texture values in a 2D array
    for (int i = -kernelSize/2; i < kernelSize/2; i++) {
        for (int j = -kernelSize/2 ; j< kernelSize/2; j++){
            textureValues[index] = texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
            index++;
        }
    }
    // bubble sort
    for (int i = 0; i < kernelSize * kernelSize - 1; i++) {
        for (int j = 0; j < kernelSize * kernelSize - i - 1; j++) {
            if (length(textureValues[j].rgb) > length(textureValues[j + 1].rgb)) {
                vec4 temp = textureValues[j];
                textureValues[j] = textureValues[j + 1];
                textureValues[j + 1] = temp;
            }
        }
    }
    return textureValues[kernelSize * kernelSize / 2];
}

void main(void) {
    ivec2 texSize2d = textureSize(image, 0);

    // Apply translation
    int leftX = int((gl_FragCoord.x + translateX * float(texSize2d.x))* scale ) % (texSize2d.x);
    int leftY = int((gl_FragCoord.y + translateY * float(texSize2d.y))* scale ) % texSize2d.y;

    // FILTER is macro defined at /src/shader.js
    vec4 leftTextureValue = FILTER(leftX, leftY);

    // int rightX = leftX + texSize2d.x / 2;
    // int rightY = leftY;
    // // FILTER is macro defined at /src/shader.js
    // vec4 rightTextureValue = FILTER(rightX, rightY);

    // Color Anaglyphs
    out_FragColor.a = 1.0;
    out_FragColor.rgb = leftTextureValue.rgb;
    // ANAGLYPH is macro defined at /src/shader.js
    // out_FragColor.rgb = ANAGLYPH(leftTextureValue.rgb, rightTextureValue.rgb);

}
