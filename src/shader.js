import fragmentShader from "./shader/fragment.glsl?raw";
import vertexShader from "./shader/vertex.glsl?raw";

const anaglyphMacros = {
  trueAnaglyphs: { "ANAGLYPH(left, right)": "trueAnaglyphs(left, right)" },
  colorAnaglyphs: { "ANAGLYPH(left, right)": "colorAnaglyphs(left, right)" },
};

export { fragmentShader, vertexShader, anaglyphMacros };
