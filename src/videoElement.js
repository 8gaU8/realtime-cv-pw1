import * as THREE from 'three'
import moonUrl from '../assets/moon.mp4'
import sfURL from '../assets/sf.mp4'

const videoConfig = {
  'moon.mp4': {
    heightFactor: 1,
    widthFactor: 1,
    path: moonUrl,
  },

  'sf.mp4': {
    heightFactor: 1,
    widthFactor: 2,
    path: sfURL,
  },
}

function generateVideoElement(path) {
  const video = document.createElement('video')
  video.src = path
  video.preload = 'auto'
  video.load()
  video.muted = true
  video.loop = true
  return video
}

export class VideoController {
  constructor() {
    this.defaultVideoName = 'sf.mp4'
    this.videoName = this.defaultVideoName
    this.video = null
    this.videoNames = Object.keys(videoConfig)
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.video.onloadeddata = () => {
        resolve(this.video)
        this.video.play()
      }
      this.video.onerror = (e) => {
        reject(new Error('動画の読み込みに失敗しました'))
      }
    })
  }

  setVideo(videoName) {
    this.videoName = videoName
    this.video = generateVideoElement(videoConfig[videoName].path)
  }

  getHightFactor() {
    return videoConfig[this.videoName].heightFactor
  }

  getWidthFactor() {
    return videoConfig[this.videoName].widthFactor
  }

  getVideoWidth() {
    return this.video.videoWidth
  }
  getVideoHeight() {
    return this.video.videoHeight
  }

  pausePlay() {
    if (!this.video.paused) {
      console.log('pause')
      this.video.pause()
    } else {
      console.log('play')
      this.video.play()
    }
  }

  add10sec() {
    this.video.currentTime = this.video.currentTime + 10
    console.log(this.video.currentTime)
  }

  ready() {
    return this.video !== null
  }

  async setupVideoTexture() {
    await this.load()
    const videoTexture = new THREE.VideoTexture(this.video)
    videoTexture.minFilter = THREE.NearestFilter
    videoTexture.magFilter = THREE.NearestFilter
    videoTexture.generateMipmaps = false
    videoTexture.format = THREE.RGBAFormat
    return videoTexture
  }
}
