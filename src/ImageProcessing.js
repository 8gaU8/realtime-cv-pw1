import * as THREE from 'https://unpkg.com/three@0.172.0/build/three.module.js'

import { anaglyphMacros, fragmentShader, vertexShader } from './shader.js'

// 画像処理クラス
export class IVimageProcessing {
  constructor(parameters) {
    this.parameters = parameters
    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: parameters.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
      defines: anaglyphMacros[parameters.selectedMethod],
    })

    console.log(anaglyphMacros[parameters.selectedMethod])

    this.height = parameters.video.videoHeight
    this.width = parameters.video.videoWidth / 2

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
    const hf = this.parameters.videoConfig.heightFactor
    const wf = this.parameters.videoConfig.widthFactor

    const aspectRatio = (this.height * hf) / (this.width * wf)

    // 処理済み映像の平面
    const geometry = new THREE.PlaneGeometry(1, aspectRatio)
    const material = new THREE.MeshBasicMaterial({
      map: this.rtt.texture,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.position.z = 0.55
    plane.receiveShadow = false
    plane.castShadow = false
    return plane
  }

  IVprocess(renderer) {
    renderer.setRenderTarget(this.rtt)
    renderer.render(this.scene, this.orthoCamera)
    renderer.setRenderTarget(null)
  }
}
// ビデオテクスチャの設定
export function setupVideoTexture(video) {
  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.minFilter = THREE.NearestFilter
  videoTexture.magFilter = THREE.NearestFilter
  videoTexture.generateMipmaps = false
  videoTexture.format = THREE.RGBAFormat
  return videoTexture
}
