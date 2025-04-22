/**
 * GUI Initialization Module
 * Sets up the user interface controls for manipulating video and image processing parameters
 */
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { anaglyphMacrosName, filterMacrosName } from './shader.js'
import { ImageProcessingMaterialController } from './imageProcessingController.js'
import { VideoController } from './videoElement.js'

/**
 * Initialize the GUI for controlling video and image processing
 * @param {GUI} gui - GUI instance
 * @param {ImageProcessingMaterialController} materialCtrl - Image processing controller
 * @param {VideoController} videoCtrl - Video controller
 */
export function initGUI(gui, materialCtrl, videoCtrl) {
  // Video control GUI
  const videoFolder = gui.addFolder('Video Control')

  // Add play/pause button
  videoFolder
    .add(
      {
        pausePlay: () => videoCtrl.togglePlayPause(),
      },
      'pausePlay',
    )
    .name('Pause/Play video')

  // Add skip forward button
  videoFolder
    .add(
      {
        add10sec: () => videoCtrl.adjustVideoTime(+10),
      },
      'add10sec',
    )
    .name('Add 10 seconds')

  videoFolder
    .add(
      {
        sub10sec: () => videoCtrl.adjustVideoTime(-10),
      },
      'sub10sec',
    )
    .name('Back 10 seconds')

  // Add video selection dropdown
  videoFolder
    .add({ video: videoCtrl.defaultVideoName }, 'video', videoCtrl.videoNames)
    .name('Video')
    .onChange((videoName) => {
      materialCtrl.onVideoChange(videoName)
    })

  // Transform parameters controls
  const paramFolder = gui.addFolder('Transform')
  paramFolder.add(materialCtrl.uniforms.scale, 'value', 0.1, 10).name('Scale')
  paramFolder.add(materialCtrl.uniforms.translateX, 'value', 0, 1).name('Translate X')
  paramFolder.add(materialCtrl.uniforms.translateY, 'value', 0, 1).name('Translate Y')

  // Filter parameters controls
  const filterParamFolder = gui.addFolder('Filter Parameters')
  filterParamFolder
    .add(materialCtrl.uniforms.kernelSizeDiv2, 'value', 1, 20, 1)
    .name('Kernel Size / 2')
  filterParamFolder.add(materialCtrl.uniforms.sigma, 'value', 0.1, 10).name('Sigma')

  // Anaglyph method selection folder
  const anaglyphGUI = gui.addFolder('Anaglyph')
  anaglyphGUI
    .add({ value: anaglyphMacrosName[0] }, 'value', anaglyphMacrosName)
    .name('Method')
    .onChange((name) => {
      materialCtrl.onAnaglyphChange(name)
    })

  // First filter selection folder
  const filtersFolder = gui.addFolder('Filters')
  const nbFilter = materialCtrl.nbFilter
  for (let i = 0; i < nbFilter; i++) {
    filtersFolder
      .add({ value: filterMacrosName[0] }, 'value', filterMacrosName)
      .name(`Filter ${i + 1}`)
      .onChange((name) => {
        if (name === 'separableGaussianFilter') {
          materialCtrl.setSeparatableFilter(i)
        } else {
          materialCtrl.onFilterChange(name, i)
        }
      })
  }
}
