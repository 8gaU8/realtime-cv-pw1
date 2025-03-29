// Utility functions for the app

export const onWindowResizeFactory = (camera, renderer) => {
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  return onWindowResize
}

// remove an object named '$name' from the scene if it exists
export const removeIfExists = (scene, name) => {
  const prevObject = scene.getObjectByName(name)
  if (prevObject) {
    scene.remove(prevObject)
    console.log('removed')
  }
}
