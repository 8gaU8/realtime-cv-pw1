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

export { fragmentShader, vertexShader, anaglyphMacros }
