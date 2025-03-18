import * as THREE from "https://unpkg.com/three@0.172.0/build/three.module.js";
import { GUI } from "https://unpkg.com/three@0.172.0/examples/jsm/libs/lil-gui.module.min.js";
import { ImageProcessingParameters } from "./imageProcessingParameters.js";
import { initCamera, initRenderer } from "./init.js";
import { initGUI } from "./initGUI.js";
import {
  onChangeFactory,
  onVideoChangedFactory as onVideoChangeFactory,
} from "./updateObject";
import { onWindowResizeFactory } from "./utils";

async function main() {
  const renderer = initRenderer();
  const camera = initCamera();
  const scene = new THREE.Scene();

  window.addEventListener(
    "resize",
    onWindowResizeFactory(camera, renderer),
    false
  );

  const uniforms = {
    sizeDiv2: { type: "i", value: 5 },
    scale: { type: "f", value: 1.0 },
    translateX: { type: "f", value: 0.0 },
    translateY: { type: "f", value: 0.0 },
    image: { type: "t", value: null },
    kernelSize: { type: "i", value: 5 },
  };

  const params = new ImageProcessingParameters(uniforms);

  const onChange = onChangeFactory(scene, params);
  const onVideoChange = onVideoChangeFactory(scene, params);

  const rootGui = new GUI();
  initGUI(rootGui, params, onChange, onVideoChange);

  onVideoChange("sf");

  function render() {
    renderer.clear();
    if (params.renderFunc) params.renderFunc(renderer);
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  // 初期化
  animate();
}
// ああ
main();
