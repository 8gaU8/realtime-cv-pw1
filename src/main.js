import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { ImageProcessingController } from './imageProcessingController.js'
import { initCamera, initRenderer } from './init.js'
import { initGUI } from './initGUI.js'
import { onWindowResizeFactory } from './utils.js'
import { VideoController } from './videoElement.js'

async function main() {
  const renderer = initRenderer()
  const camera = initCamera()
  const scene = new THREE.Scene()

  window.addEventListener('resize', onWindowResizeFactory(camera, renderer), false)
  const videoController = new VideoController()

  const uniforms = {
    sizeDiv2: { type: 'i', value: 5 },
    scale: { type: 'f', value: 1.0 },
    translateX: { type: 'f', value: 0.0 },
    translateY: { type: 'f', value: 0.0 },
    image: { type: 't', value: null },
    kernelSize: { type: 'i', value: 5 },
  }

  const controller = new ImageProcessingController(uniforms, scene, videoController)

  const rootGui = new GUI()
  initGUI(rootGui, controller, videoController)

  await controller.onVideoChange('sf.mp4')

  function animate() {
    requestAnimationFrame(animate)
    renderer.clear()
    controller.render(renderer)
    renderer.render(scene, camera)
  }

  animate()
}

main()
