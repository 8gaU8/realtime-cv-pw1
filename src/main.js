import * as THREE from "https://unpkg.com/three@0.172.0/build/three.module.js";
import { GUI } from "https://unpkg.com/three@0.172.0/examples/jsm/libs/lil-gui.module.min.js";
import { IVimageProcessing } from "./ImageProcessing.js";
import { initCamera, initRenderer } from "./init.js";
import { initGUI } from "./initGUI.js";
import { onWindowResizeFactory } from "./utils.js";
import { generateVideoElement } from "./videoElement.js";

// ビデオテクスチャの設定
const setupVideoTexture = (video) => {
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.NearestFilter;
  videoTexture.magFilter = THREE.NearestFilter;
  videoTexture.generateMipmaps = false;
  videoTexture.format = THREE.RGBAFormat;
  return videoTexture;
};

const main = async () => {
  const renderer = initRenderer();
  const camera = initCamera();
  const scene = new THREE.Scene();

  window.addEventListener(
    "resize",
    onWindowResizeFactory(camera, renderer),
    false
  );

  const video = generateVideoElement();

  const uniforms = {
    sizeDiv2: { type: "i", value: 5 },
    scale: { type: "f", value: 1.0 },
    translateX: { type: "f", value: 0.0 },
    translateY: { type: "f", value: 0.0 },
    theta: { type: "f", value: 0.0 },
    image: { type: "t", value: null },
  };

  const rootGui = new GUI();
  initGUI(uniforms, video, rootGui);

  let imageProcessing = null;

  video.onloadeddata = () => {
    const videoTexture = setupVideoTexture(video);
    uniforms.image.value = videoTexture;

    imageProcessing = new IVimageProcessing(
      video.videoHeight,
      video.videoWidth / 2,
      uniforms
    );
    const plane = imageProcessing.createVideoPlane();

    scene.add(plane);

    video.play();
  };

  const render = () => {
    renderer.clear();
    if (imageProcessing) {
      imageProcessing.IVprocess(renderer);
    }
    renderer.render(scene, camera);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };
  animate();
};

// アプリケーションの作成と初期化
// const app = new ShaderApp();
// app.init();
main();
