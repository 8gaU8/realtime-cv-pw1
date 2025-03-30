// Utility functions for the app

// Create a handler for resizing the window and updating the camera and renderer
export const createWindowResizeHandler = (camera, renderer) => {
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  return handleResize
}

// Remove an object by name from the scene if it exists
export const removeObjectByName = (scene, name) => {
  const targetObject = scene.getObjectByName(name)
  if (targetObject) {
    scene.remove(targetObject)
    console.log('Object removed:', name)
  }
}
