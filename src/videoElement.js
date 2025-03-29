import * as THREE from 'three'
import moonUrl from '../assets/moon.mp4'
import sfURL from '../assets/sf.mp4'

// ビデオの設定情報
const videoConfig = {
  'moon.mp4': {
    height: null,
    width: null,
    heightFactor: 1,
    widthFactor: 1,
    posY: 0.6,
    path: moonUrl,
  },
  'sf.mp4': {
    height: null,
    width: null,
    heightFactor: 1,
    widthFactor: 2,
    posY: 0.3,
    path: sfURL,
  },
}

export class VideoController {
  constructor() {
    this.defaultVideoName = 'sf.mp4'
    this.videoName = null
    this.video = null
    this.videoNames = Object.keys(videoConfig)
  }

  async load() {
    return new Promise((resolve, reject) => {
      if (!this.video) {
        reject(new Error('Video not initialized'))
        return
      }

      this.video.onloadeddata = () => {
        resolve(this.video)
        this.video.play()
      }
      this.video.onerror = (e) => {
        reject(new Error('Failed to load video: ' + e.message))
      }
    })
  }

  async setVideo(videoName) {
    if (this.videoName === videoName) {
      console.log('video reload')
      return
    }
    this.videoName = videoName

    if (this.video) {
      this.video.pause()
    }

    this.video = document.createElement('video')
    this.video.src = videoConfig[this.videoName].path
    this.video.preload = 'auto'
    this.video.load()
    this.video.muted = true
    this.video.loop = true

    await this.load()
    videoConfig[this.videoName].height = this.video.videoHeight
    videoConfig[this.videoName].width = this.video.videoWidth
  }

  getVideoTexture() {
    const videoTexture = new THREE.VideoTexture(this.video)
    videoTexture.minFilter = THREE.NearestFilter
    videoTexture.magFilter = THREE.NearestFilter
    videoTexture.generateMipmaps = false
    videoTexture.format = THREE.RGBAFormat
    return videoTexture
  }

  getHeightFactor() {
    return videoConfig[this.videoName].heightFactor
  }

  getWidthFactor() {
    return videoConfig[this.videoName].widthFactor
  }

  getVideoWidth() {
    return this.video ? this.video.videoWidth : 0
  }

  getVideoHeight() {
    return this.video ? this.video.videoHeight : 0
  }

  getPosY() {
    return videoConfig[this.videoName].posY
  }

  getVideoConfig() {
    return videoConfig[this.videoName]
  }

  togglePlayPause() {
    if (!this.video) return

    if (this.video.paused) {
      console.log('play')
      this.video.play()
    } else {
      console.log('pause')
      this.video.pause()
    }
  }
  add10sec() {
    if (!this.video) return
    this.video.currentTime = this.video.currentTime + 10
  }

  ready() {
    return this.video !== null
  }
}
