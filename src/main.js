import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { ImageProcessingMaterialController } from './imageProcessingController.js'
import { initCamera, initRenderer } from './init.js'
import { initGUI } from './initGUI.js'
import { onWindowResizeFactory } from './utils.js'
import { VideoController } from './videoElement.js'

async function main() {
  const renderer = initRenderer()
  const camera = initCamera()
  const scene = new THREE.Scene()
  const orbitControls = new OrbitControls(camera, renderer.domElement)
  const stats = new Stats()
  document.body.appendChild(stats.dom)

  window.addEventListener('resize', onWindowResizeFactory(camera, renderer), false)

  const videoController = new VideoController()

  const materialController = new ImageProcessingMaterialController(scene, videoController)

  // GUIを初期化
  const rootGui = new GUI()
  initGUI(rootGui, materialController, videoController)

  function animate() {
    requestAnimationFrame(animate)
    orbitControls.update()
    renderer.clear()
    materialController.render(renderer)
    renderer.render(scene, camera)
    stats.update()
  }

  animate()
}

main()
