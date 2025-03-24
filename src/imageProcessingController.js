import { IVimageProcessing, setupVideoTexture } from './imageProcessing.js'

class ImageProcessingController {
  constructor(uniforms, scene, videoController) {
    this.uniforms = uniforms
    this.scene = scene
    this.videoController = videoController
    this.selectedMethod = 'trueAnaglyphs'

    this.imageProcessing = null
  }

  updateObjects() {
    console.log('updateObjects')
    const prevObject = this.scene.getObjectByName('videoPlane')
    if (prevObject) {
      this.scene.remove(prevObject)
      console.log('removed')
    }

    const imageProcessing = new IVimageProcessing(
      this.uniforms,
      this.selectedMethod,
      this.videoController,
    )
    const plane = imageProcessing.createVideoPlane()
    plane.name = 'videoPlane'
    this.scene.add(plane)

    this.imageProcessing = imageProcessing
  }

  async onVideoChange(videoName) {
    console.log('videoName', videoName)
    this.videoController.setVideo(videoName)
    const videoTexture = await this.videoController.setupVideoTexture()
    this.uniforms.image.value = videoTexture
    this.updateObjects()
  }

  onAnaglyphChange(value) {
    this.selectedMethod = value
    this.updateObjects()
  }

  render(renderer) {
    if (this.videoController.ready()) this.imageProcessing.IVprocess(renderer)
  }
}

export {ImageProcessingController}
