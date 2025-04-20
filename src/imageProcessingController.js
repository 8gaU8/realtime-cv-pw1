/**
 * Image Processing Material Controller Module
 * Controls the image processing pipeline, manages filter application,
 * and updates the display of processed and original videos
 */
import * as THREE from 'three'
import { ImageProcessing } from './imageProcessing.js'
import { removeObjectByName } from './utils.js'
import { VideoController } from './videoElement.js'

export class ImageProcessingMaterialController {
  /**
   * Creates a controller for managing image processing operations on video
   * @param {THREE.Scene} scene
   * @param {VideoController} videoController
   */
  constructor(scene, videoController) {
    this.scene = scene

    /** @type {VideoController} */
    this.videoController = videoController

    // Initialize image planes
    this.imageObjectProcessed = null
    this.imageObjectOriginal = null

    // Setup uniform values for shaders
    this.uniforms = {
      scale: { type: 'f', value: 1.0 },
      translateX: { type: 'f', value: 0.0 },
      translateY: { type: 'f', value: 0.0 },
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

    const imageProcessing = this._createPlane(name, posY)
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

    const imageProcessing = this._createPlane(name, posY)
    this.imageObjectOriginal = imageProcessing
  }

  /**
   * Creates a video plane with specified filters and position
   * @private
   * @param {string} name - Unique name for the mesh in the scene
   * @param {number} posY - Y position of the plane in the scene
   * @returns {ImageProcessing} The created image processing instance
   */
  _createPlane(name, posY) {
    // Remove any existing plane with this name to avoid duplicates
    removeObjectByName(this.scene, name)

    // Create a new image processing instance with the specified filters
    const imageProcessing = new ImageProcessing(
      this.videoController.getVideoTexture(),
      this.uniforms,
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

    this.updateOriginalPlane()
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
