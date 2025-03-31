/**
 * Image Processing Material Controller Module
 * Controls the image processing pipeline, manages filter application,
 * and updates the display of processed and original videos
 */
import * as THREE from 'three'
import { ImageProcessing } from './imageProcessing.js'
import { anaglyphMacros, filterMacros } from './shader.js'
import { removeObjectByName } from './utils.js'
import { VideoController } from './videoElement.js'

export class ImageProcessingMaterialController {
  /**
   * Creates a controller for managing image processing operations on video
   * @param {THREE.Scene} scene
   * @param {VideoController} videoController
   */
  constructor(scene, videoController, nbFilter) {
    this.scene = scene

    /** @type {VideoController} */
    this.videoController = videoController
    this.nbFilter = nbFilter

    // Initialize with the first anaglyph method
    const selectedAnaglyph = Object.keys(anaglyphMacros)[0]
    this.anaglyphDefine = anaglyphMacros[selectedAnaglyph]

    // Initialize with the first filter method
    const defaultFilterName = Object.keys(filterMacros)[0]

    // Array for holding filter defines (up to two filters can be applied)
    this.filterDefinesList = new Array(this.nbFilter)
    for (let i = 0; i < this.nbFilter; i++) {
      this.filterDefinesList[i] = filterMacros[defaultFilterName]
    }

    // Initialize image planes
    this.imageObjectProcessed = null
    this.imageObjectOriginal = null

    // Setup uniform values for shaders
    this.uniforms = {
      scale: { type: 'f', value: 1.0 },
      translateX: { type: 'f', value: 0.0 },
      translateY: { type: 'f', value: 0.0 },
      kernelSizeDiv2: { type: 'i', value: 3 },
      sigma: { type: 'f', value: 0.85 },
    }

    // Initialize with default video
    this.init(videoController.defaultVideoName)
  }

  init(videoName) {
    this.onVideoChange(videoName)
  }

  /**
   * Updates the processed video display with current filters applied
   */
  updateProcessedPlane() {
    // Use filters
    const name = 'videoPlaneProcessed'
    const posY = -this.videoController.getVideoConfig().posY
    const filterDefinesList = this.filterDefinesList

    const imageProcessing = this._createPlane(name, posY, filterDefinesList)
    this.imageObjectProcessed = imageProcessing
  }

  /**
   * Updates the original video display with only anaglyph effect
   */
  updateOriginalPlane() {
    const name = 'videoPlaneOriginal'
    const posY = this.videoController.getVideoConfig().posY
    const filterDefinesList = []

    const imageProcessing = this._createPlane(name, posY, filterDefinesList)
    this.imageObjectOriginal = imageProcessing
  }

  _createPlane(name, posY, filterDefinesList) {
    removeObjectByName(this.scene, name)
    // Don't apply any filter to the original video
    const imageProcessing = new ImageProcessing(
      this.videoController.getVideoTexture(),
      this.uniforms,
      filterDefinesList,
      this.anaglyphDefine,
      this.videoController.getVideoConfig(),
    )
    const plane = imageProcessing.createVideoPlane()
    plane.name = name
    plane.position.y = posY
    this.scene.add(plane)
    return imageProcessing
  }

  /**
   * Handles video change event
   * @param {string} videoName - Name of the video to switch to
   */
  async onVideoChange(videoName) {
    if (this.videoController.videoName === videoName) return

    console.log('videoName', videoName)
    await this.videoController.setVideo(videoName)

    this.sourceTexture = this.videoController.getVideoTexture()
    this.updateOriginalPlane()
    this.updateProcessedPlane()
  }

  /**
   * Handles anaglyph method change event
   * @param {string} value - Name of the anaglyph method to use
   */
  onAnaglyphChange(value) {
    const anaglyphDefine = anaglyphMacros[value]
    if (this.anaglyphDefine === anaglyphDefine) return

    this.anaglyphDefine = anaglyphDefine
    this.updateOriginalPlane()
    this.updateProcessedPlane()
  }

  /**
   * Handles filter change event
   * @param {string} selectedFilter - Name of the filter to apply
   * @param {number} filterIdx - Index of the filter slot (0 or 1)
   */
  onFilterChange(selectedFilter, filterIdx) {
    const filterDefine = filterMacros[selectedFilter]
    // Don't update if the same filter is selected
    if (this.filterDefinesList[filterIdx] === filterDefine) return

    // special case for separable filter
    if (selectedFilter === 'separableGaussianFilter') {
      this.setSeparatableFilter()
      return
    }
    this.filterDefinesList[filterIdx] = filterDefine
    this.updateProcessedPlane()
  }

  setSeparatableFilter() {
    this.filterDefinesList[0] = filterMacros.separableGaussianFilterHorizontal
    this.filterDefinesList[1] = filterMacros.separableGaussianFilterVertical
    this.updateProcessedPlane()
  }

  /**
   * Renders both original and processed video planes
   * @param {THREE.WebGLRenderer} renderer - WebGL renderer
   */
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
