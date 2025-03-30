import filterFragmentShader from './shader/filter.fragment.glsl?raw'
import defaultVertexShader from './shader/vertex.glsl?raw'
import anaglyphFragmentShader from './shader/anaglyph.fragment.glsl?raw'

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
  'No Filter': null,
  gaussianFilter: { 'FILTER(X, Y)': 'gaussianFilter(X, Y)' },
  laplacian: { 'FILTER(X, Y)': 'laplacian(X, Y)' },
  separableGaussianFilter: {
    'FILTER(X, Y)': 'separableGaussianFilter(X, Y)',
  },
  medianFilter: { 'FILTER(X, Y)': 'medianFilter(X, Y)' },
}

export {
  filterFragmentShader,
  defaultVertexShader,
  anaglyphFragmentShader,
  anaglyphMacros,
  filterMacros,
}
