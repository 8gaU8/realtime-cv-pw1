export class ImageProcessingParameters {
  constructor(uniforms) {
    this.uniforms = uniforms;
    this.video = null;
    this.videoConfig = null;
    this.selectedMethod = "trueAnaglyphs";
    this.renderFunc = null;
  }
}
