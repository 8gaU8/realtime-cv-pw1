/**
 * Main Application Entry Point
 * Initializes the 3D scene, controllers, and animation loop
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { ImageProcessingMaterialController } from './imageProcessingController.js'
import { initCamera, initRenderer } from './init.js'
import { initGUI } from './initGUI.js'
import { createWindowResizeHandler } from './utils.js'
import { VideoController } from './videoElement.js'

async function main() {
  // Initialize Three.js components
  const renderer = initRenderer()
  const camera = initCamera()
  const scene = new THREE.Scene()

  // Set up orbit controls for interactive camera movement
  const orbitControls = new OrbitControls(camera, renderer.domElement)

  // Add performance stats display
  const stats = new Stats()
  document.body.appendChild(stats.dom)

  // Handle window resize
  window.addEventListener('resize', createWindowResizeHandler(camera, renderer), false)

  // Initialize video controller
  const videoController = new VideoController()

  // Initialize material controller for image processing
  const nbFilter = 2
  const materialController = new ImageProcessingMaterialController(scene, videoController, nbFilter)

  // Setup GUI controls
  const rootGui = new GUI()
  initGUI(rootGui, materialController, videoController)

  /**
   * Animation loop that runs continuously for rendering
   */
  function animate() {
    requestAnimationFrame(animate)
    orbitControls.update()
    renderer.clear()
    materialController.render(renderer)
    renderer.render(scene, camera)
    stats.update()
  }

  // Start animation loop
  animate()
}

main()
