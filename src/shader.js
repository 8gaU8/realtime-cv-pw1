import anaglyphFragmentShader from './shader/anaglyph.fragment.glsl?raw'
import filterFragmentShader from './shader/filter.fragment.glsl?raw'
import defaultVertexShader from './shader/vertex.glsl?raw'

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

const anaglyphMacrosName = [
  'trueAnaglyph',
  'colorAnaglyph',
  'grayAnaglyph',
  'half ColorAnaglyph',
  'optimizedAnaglyph',
]

const filterMacros = {
  'No Filter': null,
  gaussianFilter: { 'FILTER(X, Y)': 'gaussianFilter(X, Y)' },
  laplacianFilter: { 'FILTER(X, Y)': 'laplacianFilter(X, Y)' },
  separableGaussianFilterHorizontal: {
    'FILTER(X, Y)': 'separableGaussianFilterHorizontal(X, Y)',
  },
  separableGaussianFilterVertical: {
    'FILTER(X, Y)': 'separableGaussianFilterVertical(X, Y)',
  },
  medianFilter: { 'FILTER(X, Y)': 'medianFilter(X, Y)' },
}

const filterMacrosName = [
  'No Filter',
  'gaussianFilter',
  'laplacianFilter',
  'separableGaussianFilter',
  'medianFilter',
]

export {
  anaglyphFragmentShader,
  anaglyphMacros,
  anaglyphMacrosName,
  defaultVertexShader,
  filterFragmentShader,
  filterMacros,
  filterMacrosName,
}
