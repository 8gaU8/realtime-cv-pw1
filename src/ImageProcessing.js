import * as THREE from 'three'
import { anaglyphMacros, filterMacros, fragmentShader, vertexShader } from './shader.js'
import { VideoController } from './videoElement.js'
import { ImageProcessingMaterialController } from './imageProcessingController.js'

class ImageProcessing {
  /**
   *
   * @param {ImageProcessingMaterialController.uniforms} uniforms
   * @param {string} selectedAnaglyph
   * @param {string} selectedFilter
   * @param {VideoController} videoContoller
   */
  constructor(uniforms, selectedAnaglyph, selectedFilter, videoContoller) {
    this.videoContoller = videoContoller

    // Define the macros for anaglyph and filter
    const anaglyphDefine = anaglyphMacros[selectedAnaglyph]
    const filterDefine = filterMacros[selectedFilter]
    const defines = {
      ...anaglyphDefine,
      ...filterDefine,
    }
    console.log(defines)

    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
      defines: defines,
    })


    //3 rtt setup
    this.scene = new THREE.Scene()
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)

    //4 create a target texture
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    this.height = this.videoContoller.getVideoHeight()
    this.width = this.videoContoller.getVideoWidth() / 2
    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, options)

    //5 create a plane
    const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
    const positionsAttribute = new THREE.BufferAttribute(positions, 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', positionsAttribute)
    const plane = new THREE.Mesh(geom, imageProcessingMaterial)
    this.scene.add(plane)
  }

  createVideoPlane() {
    const hf = this.videoContoller.getHeightFactor()
    const wf = this.videoContoller.getWidthFactor()

    const aspectRatio = (this.height * hf) / (this.width * wf)

    // 処理済み映像の平面
    const geometry = new THREE.PlaneGeometry(1, aspectRatio)
    const material = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      side: THREE.FrontSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = false
    plane.castShadow = false
    return plane
  }

  render(renderer) {
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.orthoCamera)
    renderer.setRenderTarget(null)
  }
}

export { ImageProcessing }
