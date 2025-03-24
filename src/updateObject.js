import { IVimageProcessing, setupVideoTexture } from './ImageProcessing.js'
import { generateVideoElement, videoConfig } from './videoElement.js'

const updateObject = (scene, params) => {
  const prevObject = scene.getObjectByName('videoPlane')
  if (prevObject) {
    scene.remove(prevObject)
    console.log('removed')
  }

  const imageProcessing = new IVimageProcessing(params)
  const plane = imageProcessing.createVideoPlane()
  plane.name = 'videoPlane'
  scene.add(plane)

  params.renderFunc = (renderer) => {
    imageProcessing.IVprocess(renderer)
  }
  return imageProcessing
}

export function onChangeFactory(scene, params) {
  function onChange() {
    console.log('!onChange!')
    updateObject(scene, params)
  }
  return onChange
}

export function onVideoChangedFactory(scene, params) {
  const onChange = onChangeFactory(scene, params)
  function onVideoChanged(videoName) {
    const video = generateVideoElement(videoConfig[`${videoName}.mp4`].path)
    video.onloadeddata = () => {
      params.video = video
      params.video.play()
      params.videoConfig = videoConfig[`${videoName}.mp4`]
      const videoTexture = setupVideoTexture(params.video)
      params.uniforms.image.value = videoTexture
      onChange()
      console.log('videoName', videoName)
    }
  }
  return onVideoChanged
}
