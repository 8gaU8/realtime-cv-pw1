import * as THREE from 'three'
import { anaglyphMacros, filterMacros, fragmentShader, vertexShader } from './shader.js'
import { VideoController } from './videoElement.js'

class ImageProcessing {
  /**
   *
   * @param {ImageProcessingController.uniforms} uniforms
   * @param {ImageProcessingController.selectedMethod} selectedAnaglyph
   * @param {VideoController} videoContoller
   */
  constructor(uniforms, selectedAnaglyph, selectedFilter, videoContoller) {
    this.videoContoller = videoContoller
    const anaglyphDefine = anaglyphMacros[selectedAnaglyph]
    const convolutionDefine = filterMacros[selectedFilter]
    const defines = {
      ...anaglyphDefine,
      ...convolutionDefine,
    }
    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
      defines: defines,
    })

    console.log(defines)

    this.height = videoContoller.getVideoHeight()
    this.width = videoContoller.getVideoWidth() / 2

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
    this.rtt = new THREE.WebGLRenderTarget(this.width, this.height, options)

    const geom = new THREE.BufferGeometry()
    geom.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]),
        3,
      ),
    )
    this.scene.add(new THREE.Mesh(geom, imageProcessingMaterial))
  }

  createVideoPlane() {
    const hf = this.videoContoller.getHeightFactor()
    const wf = this.videoContoller.getWidthFactor()

    const aspectRatio = (this.height * hf) / (this.width * wf)

    // 処理済み映像の平面
    const geometry = new THREE.PlaneGeometry(1, aspectRatio)
    const material = new THREE.MeshBasicMaterial({
      map: this.rtt.texture,
      side: THREE.FrontSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = false
    plane.castShadow = false
    return plane
  }

  render(renderer) {
    renderer.setRenderTarget(this.rtt)
    renderer.render(this.scene, this.orthoCamera)
    renderer.setRenderTarget(null)
  }
}

export { ImageProcessing }
