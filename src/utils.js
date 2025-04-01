/**
 * Utility functions for the application
 * Contains helper functions for Three.js scene management and event handling
 */

/**
 * Creates a window resize event handler that updates camera and renderer when the window is resized
 * This ensures the scene maintains the correct aspect ratio and fills the viewport
 *
 * @param {THREE.Camera} camera - The camera to adjust aspect ratio for
 * @param {THREE.WebGLRenderer} renderer - The renderer to adjust size for
 * @returns {Function} A resize handler function that can be used as an event listener
 */
export const createWindowResizeHandler = (camera, renderer) => {
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  return handleResize
}

/**
 * Removes an object from the scene by its name if it exists
 * Useful for cleaning up scene objects before replacing them
 *
 * @param {THREE.Scene} scene - The scene to remove the object from
 * @param {string} name - The name of the object to be removed
 * @returns {void}
 */
export const removeObjectByName = (scene, name) => {
  const targetObject = scene.getObjectByName(name)
  if (targetObject) {
    scene.remove(targetObject)
    console.log('Object removed:', name)
  }
}
