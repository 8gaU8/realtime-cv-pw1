import * as THREE from 'three'
import moonUrl from '../assets/moon.mp4'
import sfURL from '../assets/sf.mp4'

// Configuration for video files, including dimensions and paths
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

// VideoController class manages video playback and texture creation
export class VideoController {
  constructor() {
    this.defaultVideoName = 'sf.mp4' // Default video to load
    this.videoName = null // Currently loaded video name
    this.video = null // HTML video element
    this.videoNames = Object.keys(videoConfig) // List of available video names
  }

  // Load the video and resolve when it's ready
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

  // Set a new video by name and load it
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

  // Create a Three.js VideoTexture from the video element
  getVideoTexture() {
    const videoTexture = new THREE.VideoTexture(this.video)
    videoTexture.minFilter = THREE.NearestFilter
    videoTexture.magFilter = THREE.NearestFilter
    videoTexture.generateMipmaps = false
    videoTexture.format = THREE.RGBAFormat
    return videoTexture
  }

  // Get the configuration of the currently loaded video
  getVideoConfig() {
    return videoConfig[this.videoName]
  }

  // Toggle play/pause state of the video
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

  // Adjust the current playback time of the video
  adjustVideoTime(timeDelta) {
    if (!this.video) return

    const updatedTime = Math.min(
      Math.max(this.video.currentTime + timeDelta, 0),
      this.video.duration,
    )
    this.video.currentTime = updatedTime
  }

  // Check if the video is ready for playback
  ready() {
    return this.video !== null
  }
}
