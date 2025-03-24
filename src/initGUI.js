import { anaglyphMacros } from './shader.js'

export function initGUI(gui, params, onChange, onVideoChange) {
  const video = params.video
  const uniforms = params.uniforms
  // GUI設定
  const pausePlayObj = {
    pausePlay: () => {
      if (!video.paused) {
        console.log('pause')
        video.pause()
      } else {
        console.log('play')
        video.play()
      }
    },
    add10sec: () => {
      video.currentTime = video.currentTime + 10
      console.log(video.currentTime)
    },
  }

  gui.add(uniforms.scale, 'value', 0.1, 10).name('Scale')
  gui.add(uniforms.translateX, 'value', 0, 1).name('Translate X')
  gui.add(uniforms.translateY, 'value', 0, 1).name('Translate Y')
  gui.add(pausePlayObj, 'pausePlay').name('Pause/play video')
  gui.add(pausePlayObj, 'add10sec').name('Add 10 seconds')
  gui
    .add({ video: 'sf' }, 'video', ['sf', 'moon'])
    .name('Video')
    .onChange((videoName) => {
      onVideoChange(videoName)
    })

  // anaglyph GUI
  const anaglyphGUI = gui.addFolder('Anaglyph Method')

  function onAnaglyphChange(value) {
    params.selectedMethod = value
    onChange()
  }

  function genAnaglyphButton(name) {
    const anaglyphObject = {
      [name]: () => onAnaglyphChange(name),
    }
    anaglyphGUI.add(anaglyphObject, name)
  }

  Object.keys(anaglyphMacros).forEach((name) => genAnaglyphButton(name))
}
