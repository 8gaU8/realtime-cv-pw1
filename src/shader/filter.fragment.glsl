precision highp float;

uniform sampler2D image;
uniform float scale;
uniform float translateX;
uniform float translateY;
uniform int kernelSizeDiv2;
uniform float sigma;

out vec4 out_FragColor;

#define PI 3.1415926
#define MEDIAN_KERNEL_SIZE 49
    
vec4 averageFilter(int centerX, int centerY) {
    vec4 textureValue = vec4(0.0);
    for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++){
            textureValue += texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
        }
    }
    return textureValue / float(4 * kernelSizeDiv2 * (kernelSizeDiv2 + 4) + 1);
}

vec4 gaussianFilter(int centerX, int centerY) {
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf
    vec4 textureValue = vec4(0.0);
    float twoSigmaSquare = 2.0 * sigma * sigma;
    float twoPiSigmaSquare = PI * twoSigmaSquare;
    for (int x = -kernelSizeDiv2; x <= kernelSizeDiv2; x++) {
        for (int y = -kernelSizeDiv2; y <= kernelSizeDiv2; y++){
            float weight = exp(-(float(x*x + y*y) / twoSigmaSquare)) / twoPiSigmaSquare;
            textureValue += texelFetch( image, ivec2(centerX + x, centerY + y), 0 ) * weight;
        }
    }
    return textureValue;
}

vec4 laplacian(int centerX, int centerY){
    // https://homepages.inf.ed.ac.uk/rbf/HIPR2/log.htm

    // Kernel of Laplacian filter
    // [[0  -1  0]
    //  [-1  4 -1]
    //  [0  -1  0]]
    vec4 textureValue = vec4(0.0);
    textureValue += texelFetch( image, ivec2(centerX, centerY), 0 ) * 4.0;
    textureValue -= texelFetch( image, ivec2(centerX + 1, centerY + 0), 0 );
    textureValue -= texelFetch( image, ivec2(centerX - 1, centerY + 0), 0 );
    textureValue -= texelFetch( image, ivec2(centerX + 0, centerY + 1), 0 );
    textureValue -= texelFetch( image, ivec2(centerX + 0, centerY - 1), 0 );
    return textureValue;

}

vec4 separableGaussianFilter(int centerX, int centerY){
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf 3.6 Separability
    vec4 textureValue = vec4(0.0);
    float sigmaSquare = sigma * sigma;
    float twoSigmaSquare = 2.0 * sigmaSquare;
    float sqrt2PiSigma = sqrt(2.0 * PI * sigmaSquare);

    for (int kernelIdx = -kernelSizeDiv2; kernelIdx <= kernelSizeDiv2; kernelIdx++) {
        float weight = exp(-(float(kernelIdx*kernelIdx) / twoSigmaSquare)) / sqrt2PiSigma;
        textureValue += texelFetch( image, ivec2(centerX + kernelIdx, centerY), 0 ) * weight;
        textureValue += texelFetch( image, ivec2(centerX, centerY + kernelIdx), 0 ) * weight;
    }
    return textureValue;
}

vec4 medianFilter(int centerX, int centerY) {
    int kernelSizeDiv2 = min(kernelSizeDiv2, 3);

    float values[MEDIAN_KERNEL_SIZE];
    vec3 colors[MEDIAN_KERNEL_SIZE];
    int index = 0;
    for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
            vec3 color = texelFetch(image, ivec2(centerX + i, centerY + j), 0).rgb;
            colors[index] = color;
            values[index] = length(color);
            index++;
        }
    }
    // insertion sort
    for (int i = 1; i < MEDIAN_KERNEL_SIZE; ++i) {
        float key = values[i];
        vec3 col = colors[i];
        int j = i - 1;
        while (j >= 0 && values[j] > key) {
            values[j + 1] = values[j];
            colors[j + 1] = colors[j];
            j--;
        }
        values[j + 1] = key;
        colors[j + 1] = col;
    }
    return vec4(colors[index / 2], 1);
}


void main(void) {
    ivec2 texSize2d = textureSize(image, 0);

    // FILTER is macro defined at /src/shader.js
    vec4 textureValue = FILTER(int(gl_FragCoord.x), int(gl_FragCoord.y));

    out_FragColor = textureValue;

}
