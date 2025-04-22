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

const anaglyphMacrosName = Object.keys(anaglyphMacros)

const filterMacros = {
  'No Filter': null,
  gaussianFilter: {
    'FILTER(X, Y, sizeX, sizeY)': 'gaussianFilter(X, Y, sizeX, sizeY)',
  },
  laplacianFilter: {
    'FILTER(X, Y, sizeX, sizeY)': 'laplacianFilter(X, Y, sizeX, sizeY)',
  },
  separableGaussianFilterHorizontal: {
    'FILTER(X, Y, sizeX, sizeY)': 'separableGaussianFilterHorizontal(X, Y, sizeX, sizeY)',
  },
  separableGaussianFilterVertical: {
    'FILTER(X, Y, sizeX, sizeY)': 'separableGaussianFilterVertical(X, Y, sizeX, sizeY)',
  },
  medianFilter: {
    'FILTER(X, Y, sizeX, sizeY)': 'medianFilter(X, Y, sizeX, sizeY)',
  },
}

const filterMacrosName = [
  'No Filter',
  'gaussianFilter',
  'laplacianFilter',
  'separableGaussianFilter',
  'medianFilter',
  'Gaussian Filter + Laplacian Filter',
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
