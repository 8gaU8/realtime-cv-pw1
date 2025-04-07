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
    
ivec2 clampCoord(ivec2 coord, int sizeX, int sizeY){
    if (coord.x < sizeX/2){
        return ivec2(clamp(coord.x, 0, sizeX/2 - 1), clamp(coord.y, 0, sizeY - 1));
    }
    return ivec2(clamp(coord.x, sizeX/2, sizeX - 1), clamp(coord.y, 0, sizeY - 1));

}

vec4 averageFilter(int centerX, int centerY, int sizeX, int sizeY){
    vec4 textureValue = vec4(0.0);
    for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++){
            textureValue += texelFetch( image, ivec2(centerX + i, centerY + j), 0 );
        }
    }
    return textureValue / float(4 * kernelSizeDiv2 * (kernelSizeDiv2 + 4) + 1);
}

vec4 gaussianFilter(int centerX, int centerY, int sizeX, int sizeY){
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf
    vec4 textureValue = vec4(0.0);
    float twoSigmaSquare = 2.0 * sigma * sigma;
    float twoPiSigmaSquare = PI * twoSigmaSquare;
    for (int x = -kernelSizeDiv2; x <= kernelSizeDiv2; x++) {
        for (int y = -kernelSizeDiv2; y <= kernelSizeDiv2; y++){
            float weight = exp(-(float(x*x + y*y) / twoSigmaSquare)) / twoPiSigmaSquare;
            ivec2 clamped = clampCoord(ivec2(centerX + x, centerY + y), sizeX, sizeY);
            textureValue += texelFetch( image, clamped, 0 ) * weight;
        }
    }
    return textureValue;
}

vec4 laplacianFilter(int centerX, int centerY, int sizeX, int sizeY){
    // https://homepages.inf.ed.ac.uk/rbf/HIPR2/log.htm

    // Kernel of Laplacian filter
    // [[0  -1  0]
    //  [-1  4 -1]
    //  [0  -1  0]]
    vec4 textureValue = vec4(0.0);
    textureValue += texelFetch( image, clampCoord(ivec2(centerX + 0, centerY + 0), sizeX, sizeY), 0 ) * 4.0;
    textureValue -= texelFetch( image, clampCoord(ivec2(centerX + 1, centerY + 0), sizeX, sizeY), 0 );
    textureValue -= texelFetch( image, clampCoord(ivec2(centerX - 1, centerY + 0), sizeX, sizeY), 0 );
    textureValue -= texelFetch( image, clampCoord(ivec2(centerX + 0, centerY + 1), sizeX, sizeY), 0 );
    textureValue -= texelFetch( image, clampCoord(ivec2(centerX + 0, centerY - 1), sizeX, sizeY), 0 );
    return textureValue;

}

vec4 separableGaussianFilterVertical(int centerX, int centerY, int sizeX, int sizeY){
    
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf 3.6 Separability
    vec4 textureValue = vec4(0.0);
    float sigmaSquare = sigma * sigma;
    float twoSigmaSquare = 2.0 * sigmaSquare;
    float sqrt2PiSigma = sqrt(2.0 * PI * sigmaSquare);

    // for (int kernelIdx = lowerConvBound; kernelIdx <= upperConvBound; kernelIdx++) {
    for (int kernelIdx = -kernelSizeDiv2; kernelIdx <= kernelSizeDiv2; kernelIdx++) {
        float weight = exp(-(float(kernelIdx*kernelIdx) / twoSigmaSquare)) / sqrt2PiSigma;
        ivec2 clamped = clampCoord(ivec2(centerX, centerY + kernelIdx), sizeX, sizeY);
        textureValue += texelFetch( image, clamped, 0 ) * weight;
    }
    return textureValue;
}

vec4 separableGaussianFilterHorizontal(int centerX, int centerY, int sizeX, int sizeY){
    // https://pages.stat.wisc.edu/~mchung/teaching/MIA/reading/diffusion.gaussian.kernel.pdf.pdf 3.6 Separability
    vec4 textureValue = vec4(0.0);
    float sigmaSquare = sigma * sigma;
    float twoSigmaSquare = 2.0 * sigmaSquare;
    float sqrt2PiSigma = sqrt(2.0 * PI * sigmaSquare);

    // for (int kernelIdx = leftConvBound; kernelIdx <= rightConvBound; kernelIdx++) {
    for (int kernelIdx = -kernelSizeDiv2; kernelIdx <= kernelSizeDiv2; kernelIdx++) {
        float weight = exp(-(float(kernelIdx*kernelIdx) / twoSigmaSquare)) / sqrt2PiSigma;
        ivec2 clamped = clampCoord(ivec2(centerX + kernelIdx, centerY ), sizeX, sizeY);
        textureValue += texelFetch( image, clamped, 0 ) * weight;
    }
    return textureValue;
}

vec4 medianFilter(int centerX, int centerY, int sizeX, int sizeY){
    int kernelSizeDiv2 = min(kernelSizeDiv2, 3);

    float values[MEDIAN_KERNEL_SIZE];
    vec3 colors[MEDIAN_KERNEL_SIZE];
    int index = 0;
    for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++) {
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
            ivec2 clamped = clampCoord(ivec2(centerX + i, centerY + j), sizeX, sizeY);
            vec3 color = texelFetch(image, clamped, 0).rgb;
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
    vec4 textureValue = vec4(0.0);

    // FILTER is macro defined at /src/shader.js
    int x = int(gl_FragCoord.x);
    int y = int(gl_FragCoord.y);


    x = x % (texSize2d.x/2);

    textureValue = FILTER(int(gl_FragCoord.x), int(gl_FragCoord.y), texSize2d.x, texSize2d.y);

    out_FragColor = textureValue;

    // if( leftConvBound == rightConvBound){
    //     out_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // }


}
