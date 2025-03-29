import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { anaglyphMacros, filterMacros } from './shader.js'
import { ImageProcessingMaterialController } from './imageProcessingController.js'
import { VideoController } from './videoElement.js'

/**
 * GUIの初期化
 * @param {GUI} gui - GUI
 * @param {ImageProcessingMaterialController} imageCtrl - 画像処理コントローラー
 * @param {VideoController} videoCtrl - ビデオコントローラー
 */
export function initGUI(gui, imageCtrl, videoCtrl) {
  // ビデオコントロール用GUI
  const videoFolder = gui.addFolder('Video Control')

  videoFolder
    .add(
      {
        pausePlay: () => videoCtrl.togglePlayPause(),
      },
      'pausePlay',
    )
    .name('Pause/play video')

  videoFolder
    .add(
      {
        add10sec: () => videoCtrl.add10sec(),
      },
      'add10sec',
    )
    .name('Add 10 seconds')

  videoFolder
    .add({ video: videoCtrl.defaultVideoName }, 'video', videoCtrl.videoNames)
    .name('Video')
    .onChange((videoName) => {
      imageCtrl.onVideoChange(videoName)
    })

  // 変換パラメータ用GUI
  const paramFolder = gui.addFolder('Transform')
  paramFolder.add(imageCtrl.uniforms.scale, 'value', 0.1, 10).name('Scale')
  paramFolder.add(imageCtrl.uniforms.translateX, 'value', 0, 1).name('Translate X')
  paramFolder.add(imageCtrl.uniforms.translateY, 'value', 0, 1).name('Translate Y')
  paramFolder.add(imageCtrl.uniforms.kernelSizeDiv2, 'value', 1, 10, 1).name('Kernel Size / 2')
  paramFolder.add(imageCtrl.uniforms.sigma, 'value', 0.1, 10).name('Sigma')

  // アナグリフ方式用GUI
  const anaglyphGUI = gui.addFolder('Anaglyph Methods')

  // 各アナグリフ方式のボタンを生成
  Object.keys(anaglyphMacros).forEach((name) => {
    const anaglyphObject = {
      [name]: () => imageCtrl.onAnaglyphChange(name),
    }
    anaglyphGUI.add(anaglyphObject, name)
  })

  // フィルター1用GUI
  const filter1Folder = gui.addFolder('First Filter')
  Object.keys(filterMacros).forEach((name) => {
    const filterObject = {
      [name]: () => imageCtrl.onFilterChange(name, 0),
    }
    filter1Folder.add(filterObject, name)
  })

  // フィルター2用GUI
  const filter2Folder = gui.addFolder('Second Filter')
  Object.keys(filterMacros).forEach((name) => {
    const filterObject = {
      [name]: () => imageCtrl.onFilterChange(name, 1),
    }
    filter2Folder.add(filterObject, name)
  })
}
