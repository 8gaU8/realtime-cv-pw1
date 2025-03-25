import * as THREE from 'three'
import { RenderingPipelinePath } from './renderingPipeline.js'
import {
  anaglyphFragmentShader,
  anaglyphMacros,
  filterFragmentShader,
  filterMacros,
} from './shader.js'

class ImageProcessing {
  constructor(uniforms, selectedAnaglyph, selectedFilter, videoContoller) {
    this.uniforms = uniforms
    this.videoContoller = videoContoller
    this.selectedAnaglyph = selectedAnaglyph
    this.selectedFilter = selectedFilter

    const width = this.videoContoller.getVideoWidth()
    const height = this.videoContoller.getVideoHeight()

    this.dispWidth = this.videoContoller.getVideoWidth() / 2
    this.dispHeight = this.videoContoller.getVideoHeight()

    const sourceTexture = this.videoContoller.getVideoTexture()

    const filterUniforms = { ...this.uniforms }
    filterUniforms['image'] = { type: 't', value: sourceTexture }

    this.filterPath = new RenderingPipelinePath(
      width,
      height,
      filterUniforms,
      filterMacros[this.selectedFilter],
      filterFragmentShader,
    )

    const texture = this.filterPath.getTexture()
    console.log(texture)
    const anaglyphUniforms = { ...this.uniforms }
    anaglyphUniforms['image'] = { type: 't', value: texture }

    this.anaglyphPath = new RenderingPipelinePath(
      this.dispWidth,
      this.dispHeight,
      anaglyphUniforms,
      anaglyphMacros[this.selectedAnaglyph],
      anaglyphFragmentShader,
    )
  }

  createVideoPlane() {
    const hf = this.videoContoller.getHeightFactor()
    const wf = this.videoContoller.getWidthFactor()

    const aspectRatio = (this.dispHeight * hf) / (this.dispWidth * wf)

    // 処理済み映像の平面
    const geometry = new THREE.PlaneGeometry(1, aspectRatio)
    const material = new THREE.MeshBasicMaterial({
      map: this.anaglyphPath.getTexture(),
      side: THREE.FrontSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.receiveShadow = false
    plane.castShadow = false
    return plane
  }

  render(renderer) {
    this.filterPath.render(renderer)
    this.anaglyphPath.render(renderer)
  }
}

export { ImageProcessing }
