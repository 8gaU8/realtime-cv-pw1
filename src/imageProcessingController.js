import * as THREE from 'three'
import { ImageProcessing } from './imageProcessing.js'
import { anaglyphMacros, filterMacros } from './shader.js'
import { VideoController } from './videoElement.js'

export class ImageProcessingMaterialController {
  /**
   * @param {THREE.Scene} scene - メインシーン
   * @param {VideoController} videoController - ビデオコントローラー
   */
  constructor(scene, videoController) {
    this.scene = scene
    /** @type {VideoController} */
    this.videoController = videoController
    this.selectedAnaglyph = Object.keys(anaglyphMacros)[0]
    this.selectedFilter = Object.keys(filterMacros)[0]
    this.imageObjectProcessed = null
    this.imageObjectProcessed = null

    this.uniforms = {
      sizeDiv2: { type: 'i', value: 5 },
      scale: { type: 'f', value: 1.0 },
      translateX: { type: 'f', value: 0.0 },
      translateY: { type: 'f', value: 0.0 },
      image: { type: 't', value: null },
      kernelSize: { type: 'i', value: 5 },
      sigma: { type: 'f', value: 0.85 },
    }

    this.onVideoChange(videoController.defaultVideoName)
  }

  removeIfExists(name) {
    const prevObject = this.scene.getObjectByName(name)
    if (prevObject) {
      this.scene.remove(prevObject)
      console.log('removed')
    }
  }

  updateProcessedProcessed() {
    const name = 'videoPlaneProcessed'
    this.removeIfExists(name)

    const imageProcessing = new ImageProcessing(
      this.uniforms,
      this.selectedAnaglyph,
      this.selectedFilter,
      this.videoController,
    )
    const plane = imageProcessing.createVideoPlane()
    plane.name = name
    plane.position.x = 0
    plane.position.y = -this.videoController.getPosY()
    plane.position.z = 0.2
    this.scene.add(plane)
    this.imageObjectProcessed = imageProcessing
  }

  updateProcessedOriginal() {
    const name = 'videoPlaneOriginal'
    this.removeIfExists(name)

    const imageProcessing = new ImageProcessing(
      this.uniforms,
      this.selectedAnaglyph,
      'original',
      this.videoController,
    )
    const plane = imageProcessing.createVideoPlane()
    plane.name = name
    plane.position.x = 0
    plane.position.y = this.videoController.getPosY()
    plane.position.z = 0.2
    this.scene.add(plane)
    this.imageObjectOriginal = imageProcessing
  }

  async onVideoChange(videoName) {
    if (this.videoController.videoName === videoName) return

    console.log('videoName', videoName)
    this.videoController.setVideo(videoName)
    this.uniforms.image.value = await this.videoController.setupVideoTexture()
    this.updateProcessedOriginal()
    this.updateProcessedProcessed()
  }

  onAnaglyphChange(value) {
    if (this.selectedAnaglyph === value) return

    this.selectedAnaglyph = value
    this.updateProcessedOriginal()
    this.updateProcessedProcessed()
  }

  onFilterChange(value) {
    if (this.selectedFilter === value) return

    this.selectedFilter = value
    this.updateProcessedProcessed()
  }

  render(renderer) {
    if (this.videoController.ready()) {
      if (this.imageObjectProcessed) {
        this.imageObjectProcessed.render(renderer)
      }
      if (this.imageObjectOriginal) {
        this.imageObjectOriginal.render(renderer)
      }
    }
  }
}
