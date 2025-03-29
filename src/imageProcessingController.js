import * as THREE from 'three'
import { ImageProcessing } from './imageProcessing.js'
import { anaglyphMacros, filterMacros } from './shader.js'
import { removeIfExists } from './utils.js'
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
    const selectedAnaglyph = Object.keys(anaglyphMacros)[0]
    this.anaglyphDefine = anaglyphMacros[selectedAnaglyph]
    const selectedFilter = Object.keys(filterMacros)[0]

    this.filterDefinesList = [filterMacros[selectedFilter], null]
    this.imageObjectProcessed = null
    this.imageObjectOriginal = null

    this.uniforms = {
      scale: { type: 'f', value: 1.0 },
      translateX: { type: 'f', value: 0.0 },
      translateY: { type: 'f', value: 0.0 },
      kernelSizeDiv2: { type: 'i', value: 3 },
      sigma: { type: 'f', value: 0.85 },
    }

    this.onVideoChange(videoController.defaultVideoName)
  }

  updateProcessedProcessed() {
    // Use filters
    const name = 'videoPlaneProcessed'
    removeIfExists(this.scene, name)

    const imageProcessing = new ImageProcessing(
      this.videoController.getVideoTexture(),
      this.uniforms,
      this.filterDefinesList,
      this.anaglyphDefine,
      this.videoController.getVideoConfig(),
    )
    const plane = imageProcessing.createProcessedVideoPlane()
    plane.name = name
    plane.position.y = -this.videoController.getPosY()
    this.scene.add(plane)
    this.imageObjectProcessed = imageProcessing
  }

  updateProcessedOriginal() {
    const name = 'videoPlaneOriginal'
    removeIfExists(this.scene, name)
    // Don't apply any filter to the original video
    const emptyFilterDefinesList = []
    const imageProcessing = new ImageProcessing(
      this.videoController.getVideoTexture(),
      this.uniforms,
      emptyFilterDefinesList,
      this.anaglyphDefine,
      this.videoController.getVideoConfig(),
    )
    const plane = imageProcessing.createProcessedVideoPlane()
    plane.name = name
    plane.position.y = this.videoController.getPosY()
    this.scene.add(plane)
    this.imageObjectOriginal = imageProcessing
  }

  async onVideoChange(videoName) {
    if (this.videoController.videoName === videoName) return

    console.log('videoName', videoName)
    await this.videoController.setVideo(videoName)

    this.sourceTexture = this.videoController.getVideoTexture()
    this.updateProcessedOriginal()
    this.updateProcessedProcessed()
  }

  onAnaglyphChange(value) {
    const anaglyphDefine = anaglyphMacros[value]
    if (this.anaglyphDefine === anaglyphDefine) return

    this.anaglyphDefine = anaglyphDefine
    this.updateProcessedOriginal()
    this.updateProcessedProcessed()
  }

  onFilterChange(selectedFilter, filterIdx) {
    const filterDefine = filterMacros[selectedFilter]
    // Don't update if the same filter is selected
    if (this.filterDefinesList[filterIdx] === filterDefine) return
    // "original" filter is a special case, it will be skipped in the rendereing pipeline
    if (selectedFilter === 'original') {
      this.filterDefinesList[filterIdx] = null
    } else {
      this.filterDefinesList[filterIdx] = filterDefine
    }
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
