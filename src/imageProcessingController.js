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
      laplacianFactor: { type: 'f', value: 0.5 },
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
    const name = 'videoPlaneProcessed'
    const posY = -this.videoController.getVideoConfig().posY
    // Apply selected filters

    const imageProcessing = this._createPlane(name, posY, this.filterDefinesList)
    // Store the created image processing instance for later rendering
    this.imageObjectProcessed = imageProcessing
  }

  /**
   * Updates the original video display with only anaglyph effect
   * Creates a new plane with the original video texture using only the anaglyph effect without filters
   * This provides a comparison view to the processed version
   */
  updateOriginalPlane() {
    const name = 'videoPlaneOriginal'
    const posY = this.videoController.getVideoConfig().posY
    // Don't apply any filter to the original video
    const filterDefinesList = []

    const imageProcessing = this._createPlane(name, posY, filterDefinesList)
    this.imageObjectOriginal = imageProcessing
  }

  /**
   * Creates a video plane with specified filters and position
   * @private
   * @param {string} name - Unique name for the mesh in the scene
   * @param {number} posY - Y position of the plane in the scene
   * @param {Array<Object|null>} filterDefinesList - List of shader defines for filters to apply
   * @returns {ImageProcessing} The created image processing instance
   */
  _createPlane(name, posY, filterDefinesList) {
    // Remove any existing plane with this name to avoid duplicates
    removeObjectByName(this.scene, name)

    // Create a new image processing instance with the specified filters
    const imageProcessing = new ImageProcessing(
      this.videoController.getVideoTexture(),
      this.uniforms,
      filterDefinesList,
      this.anaglyphDefine,
      this.videoController.getVideoConfig(),
    )

    // Get the rendered plane and configure its properties
    const plane = imageProcessing.createVideoPlane()
    plane.name = name
    plane.position.y = posY
    this.scene.add(plane)

    return imageProcessing
  }

  /**
   * Handles video change event
   * Loads the new video and updates both the original and processed planes
   * @async
   * @param {string} videoName - Name of the video to switch to
   * @returns {Promise<void>}
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

    this.filterDefinesList[filterIdx] = filterDefine
    this.updateProcessedPlane()
  }

  setSeparatableFilter(filterIdx) {
    if (filterIdx + 1 >= this.filterDefinesList.length)
      throw new Error('Invalid position of separable filter')
    this.filterDefinesList[filterIdx] = filterMacros.separableGaussianFilterHorizontal
    this.filterDefinesList[filterIdx + 1] = filterMacros.separableGaussianFilterVertical
    this.updateProcessedPlane()
  }

  /**
   * Renders both original and processed video planes
   * @param {THREE.WebGLRenderer} renderer - WebGL renderer
   */
  render(renderer) {
    if (this.videoController.ready()) {
      if (this.imageObjectProcessed) this.imageObjectProcessed.render(renderer)
      if (this.imageObjectOriginal) this.imageObjectOriginal.render(renderer)
    }
  }
}
