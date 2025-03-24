import * as THREE from 'https://unpkg.com/three@0.172.0/build/three.module.js'

// シェーダーファイルを読み込む関数
async function loadShader(url) {
  const response = await fetch(url)
  return await response.text()
}

function loadStaticTexture(url) {
  const textureLaoder = new THREE.TextureLoader()
  const texture = textureLaoder.load(url)
  return texture
}

export const onWindowResizeFactory = (camera, renderer) => {
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  return onWindowResize
}
