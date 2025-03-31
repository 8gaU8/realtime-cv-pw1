/**
 * Rendering Pipeline Pass Module
 * Creates an individual rendering pass for processing images with shaders
 * Each pass takes an input texture, applies a shader, and renders to a target
 */
import * as THREE from 'three'
import { defaultVertexShader } from './shader.js'

export class RenderingPipelinePass {
  /**
   * Creates a rendering pass with defined shaders and settings
   * @param {THREE.Texture} sourceTexture - Input texture for the pass
   * @param {number} targetWidth - Width of the render target
   * @param {number} targetHeight - Height of the render target
   * @param {Object} uniforms - Shader uniforms
   * @param {Object} defines - Shader preprocessor defines
   * @param {string} fragmentShader - GLSL fragment shader code
   */
  constructor(sourceTexture, targetWidth, targetHeight, uniforms, defines, fragmentShader) {
    // Initialize scene and camera for this render pass
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)

    // Configure render target with appropriate settings for image processing
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    this.renderTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, options)

    // Set up uniforms including the source texture
    this.uniforms = { ...uniforms }
    this.uniforms['image'] = { type: 't', value: sourceTexture }

    this.defines = defines
    this.fragmentShader = fragmentShader

    // Create the rendering components
    this._buildPipeline()
  }

  /**
   * Get the output texture from this render pass
   * @returns {THREE.Texture} The rendered texture
   */
  getTexture() {
    return this.renderTarget.texture
  }

  /**
   * Create the internal scene with a shader material and plane
   * @private
   */
  _buildPipeline() {
    // Create a material using the provided shaders and defines
    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: defaultVertexShader,
      fragmentShader: this.fragmentShader,
      glslVersion: THREE.GLSL3,
      defines: this.defines,
    })

    // Create a full-screen plane to render the shader effect
    const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
    const positionsAttribute = new THREE.BufferAttribute(positions, 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', positionsAttribute)
    const plane = new THREE.Mesh(geom, imageProcessingMaterial)
    this.scene.add(plane)
  }

  /**
   * Execute the render pass
   * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
   */
  render(renderer) {
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }
}
