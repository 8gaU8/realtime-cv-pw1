import * as THREE from "https://unpkg.com/three@0.172.0/build/three.module.js";
import WEBGL from "https://unpkg.com/three@0.172.0/examples/jsm/capabilities/WebGL.js";

const initRenderer = () => {
  if (WEBGL.isWebGL2Available() === false) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    return false;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2");
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    context: context,
  });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  container.appendChild(renderer.domElement);
  return renderer;
};

const initCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.001,
    10
  );
  camera.position.z = 1.0;

  return camera;
};

export { initRenderer, initCamera };
