/**
 * Initialization utilities
 * This module handles the setup of the WebGL renderer and camera for the application
 */
import * as THREE from 'three'
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js'

/**
 * Initializes the WebGL2 renderer
 * Creates the necessary DOM elements and configures the renderer
 * @returns {THREE.WebGLRenderer|boolean} The configured renderer or false if WebGL2 is not available
 */
const initRenderer = () => {
  if (WEBGL.isWebGL2Available() === false) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage())
    return false
  }

  // Create container for renderer
  const container = document.createElement('div')
  document.body.appendChild(container)

  // Setup WebGL2 canvas and context
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2')
  document.body.appendChild(canvas)

  // Configure renderer with WebGL2 support
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    context: context,
  })
  renderer.autoClear = false
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = false

  container.appendChild(renderer.domElement)
  return renderer
}

/**
 * Initializes the camera for the scene
 * Creates a perspective camera with appropriate positioning
 * @returns {THREE.PerspectiveCamera} The configured camera
 */
const initCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 10)
  camera.position.z = 1.5

  return camera
}

export { initRenderer, initCamera }
