import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { anaglyphMacros } from './shader.js'
import { ImageProcessingController } from './imageProcessingController.js'
import { VideoController } from './videoElement.js'

/**
 *
 * @param {GUI} gui
 * @param {ImageProcessingController } matCtrl
 * @param {VideoController} videoCtrl
 */
function initGUI(gui, matCtrl, videoCtrl) {
  // GUI設定
  const pausePlayObj = {
    pausePlay: () => {
      videoCtrl.pausePlay()
    },
    add10sec: () => {
      videoCtrl.add10sec()
    },
  }

  gui.add(pausePlayObj, 'pausePlay').name('Pause/play video')
  gui.add(pausePlayObj, 'add10sec').name('Add 10 seconds')

  gui
    .add({ video: videoCtrl.defaultVideoName }, 'video', videoCtrl.videoNames)
    .name('Video')
    .onChange((videoName) => {
      matCtrl.onVideoChange(videoName)
    })

  gui.add(matCtrl.uniforms.scale, 'value', 0.1, 10).name('Scale')
  gui.add(matCtrl.uniforms.translateX, 'value', 0, 1).name('Translate X')
  gui.add(matCtrl.uniforms.translateY, 'value', 0, 1).name('Translate Y')

  // anaglyph GUI
  const anaglyphGUI = gui.addFolder('Anaglyph Method')

  function genAnaglyphButton(name) {
    const anaglyphObject = {
      [name]: () => matCtrl.onAnaglyphChange(name),
    }
    anaglyphGUI.add(anaglyphObject, name)
  }

  Object.keys(anaglyphMacros).forEach((name) => genAnaglyphButton(name))
}

export {initGUI}