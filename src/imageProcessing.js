import * as THREE from 'three'
import { RenderingPipelinePass } from './renderingPipeline.js'
import { anaglyphFragmentShader, filterFragmentShader } from './shader.js'

/**
 * ImageProcessing class handles the processing pipeline for creating anaglyph effects.
 * It applies filters to video textures and creates a 3D anaglyph representation.
 */
export class ImageProcessing {
  /**
   * Creates a new image processing pipeline with filters and anaglyph effect
   *
   * @param {THREE.Texture} sourceTexture - The source video texture to process
   * @param {Object} uniforms - Shader uniforms for image processing
   * @param {Array<Object|null>} filterDefinesList - List of shader macro definitions for filters
   * @param {Object} anaglyphDefine - Shader macro definition for anaglyph effect
   * @param {Object} videoConfig - Configuration parameters for the video
   * @param {number} videoConfig.width - Width of the video
   * @param {number} videoConfig.height - Height of the video
   * @param {number} videoConfig.widthFactor - Width scaling factor for display
   * @param {number} videoConfig.heightFactor - Height scaling factor for display
   */
  constructor(sourceTexture, uniforms, filterDefinesList, anaglyphDefine, videoConfig) {
    this.sourceTexture = sourceTexture
    this.uniforms = uniforms
    this.videoConfig = videoConfig

    const sourceVideoWidth = this.videoConfig.width
    const sourceVideoHeight = this.videoConfig.height

    // Anaglyph requires splitting the image into left and right views
    this.targetWidth = sourceVideoWidth / 2
    this.targetHeight = sourceVideoHeight

    this.filterPipeline = []

    // Build the filter pipeline by sequentially applying each filter
    let texture = sourceTexture
    filterDefinesList.forEach((define) => {
      console.log('filterDefine:', define)
      if (define === null) {
        console.log('define is null')
        return
      }
      const pipelinePass = new RenderingPipelinePass(
        texture,
        sourceVideoWidth,
        sourceVideoHeight,
        this.uniforms,
        define,
        filterFragmentShader,
      )
      this.filterPipeline.push(pipelinePass)
      texture = pipelinePass.getTexture()
    })
    console.log('Length of filterPipeline:', this.filterPipeline.length)

    // Create the final anaglyph processing pass
    const anaglyphPath = new RenderingPipelinePass(
      texture,
      this.targetWidth,
      this.targetHeight,
      this.uniforms,
      anaglyphDefine,
      anaglyphFragmentShader,
    )
    this.anaglyphPath = anaglyphPath
  }

  /**
   * Creates a Three.js plane with the processed video texture
   *
   * @returns {THREE.Mesh} A plane mesh with the processed video texture applied
   */
  createVideoPlane() {
    const hf = this.videoConfig.heightFactor
    const wf = this.videoConfig.widthFactor

    // Calculate aspect ratio based on the video dimensions and factors
    const aspectRatio = (this.targetHeight * hf) / (this.targetWidth * wf)

    const lastTexture = this.anaglyphPath.getTexture()

    // Create a plane for displaying the processed video
    const geometry = new THREE.PlaneGeometry(1, aspectRatio)
    const material = new THREE.MeshBasicMaterial({
      map: lastTexture,
      side: THREE.FrontSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = false
    plane.castShadow = false
    return plane
  }

  /**
   * Renders the complete processing pipeline
   *
   * @param {THREE.WebGLRenderer} renderer - The WebGL renderer used to render the pipeline
   */
  render(renderer) {
    // First render all filters in the pipeline
    this.filterPipeline.forEach((pipeline) => {
      pipeline.render(renderer)
    })
    // Then render the anaglyph effect
    this.anaglyphPath.render(renderer)
  }
}
