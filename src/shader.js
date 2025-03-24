import fragmentShader from './shader/fragment.glsl?raw'
import vertexShader from './shader/vertex.glsl?raw'

const anaglyphMacros = {
  trueAnaglyphs: { 'ANAGLYPH(left, right)': 'trueAnaglyph(left, right)' },
  colorAnaglyphs: { 'ANAGLYPH(left, right)': 'colorAnaglyph(left, right)' },
  grayAnaglyphs: { 'ANAGLYPH(left, right)': 'grayAnaglyph(left, right)' },
  halfColorAnaglyphs: {
    'ANAGLYPH(left, right)': 'halfColorAnaglyph(left, right)',
  },
  optimizedAnaglyphs: {
    'ANAGLYPH(left, right)': 'optimizedAnaglyph(left, right)',
  },
}

const filterMacros = {
  gaussianFilter: { 'FILTER(X, Y)': 'gaussianFilter(X, Y)' },
  laplacian: { 'FILTER(X, Y)': 'laplacian(X, Y)' },
  separableGaussianFilter: {
    'FILTER(X, Y)': 'separableGaussianFilter(X, Y)',
  },
  medianFilter: { 'FILTER(X, Y)': 'medianFilter(X, Y)' },
  original: { 'FILTER(X, Y)': 'texelFetch(image, ivec2(X, Y), 0 );' },
}

export { fragmentShader, vertexShader, anaglyphMacros, filterMacros }
