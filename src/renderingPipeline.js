import * as THREE from 'three'
import { defaultVertexShader } from './shader.js'

export class RenderingPipelinePath {
  constructor(targetWidth, targetHeight, uniforms, defines, fragmentShader) {
    // init instances
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    this.renderTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, options)

    this._buildPipeline(uniforms, defines, fragmentShader)
  }

  getTexture() {
    return this.renderTarget.texture
  }

  _buildPipeline(uniforms, defines, fragmentShader) {
    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: defaultVertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
      defines: defines,
    })

    // 5 create a plane
    const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
    const positionsAttribute = new THREE.BufferAttribute(positions, 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', positionsAttribute)
    const plane = new THREE.Mesh(geom, imageProcessingMaterial)
    this.scene.add(plane)
  }

  render(renderer) {
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }
}
