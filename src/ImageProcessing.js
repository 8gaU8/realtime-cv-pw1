import * as THREE from 'three'
import { RenderingPipelinePass } from './renderingPipeline.js'
import { anaglyphFragmentShader, filterFragmentShader } from './shader.js'

export class ImageProcessing {
  constructor(sourceTexture, uniforms, filterDefinesList, anaglyphDefine, videoConfig) {
    this.sourceTexture = sourceTexture
    this.uniforms = uniforms
    this.videoConfig = videoConfig

    const sourceVideoWidth = this.videoConfig.width
    const sourceVideoHeight = this.videoConfig.height

    this.targetWidth = sourceVideoWidth / 2
    this.targetHeight = sourceVideoHeight

    this.filterPipeline = []

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

  createVideoPlane() {
    const hf = this.videoConfig.heightFactor
    const wf = this.videoConfig.widthFactor

    const aspectRatio = (this.targetHeight * hf) / (this.targetWidth * wf)

    const lastTexture = this.anaglyphPath.getTexture()

    // 処理済み映像の平面
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

  render(renderer) {
    this.filterPipeline.forEach((pipeline) => {
      pipeline.render(renderer)
    })
    this.anaglyphPath.render(renderer)
  }
}
