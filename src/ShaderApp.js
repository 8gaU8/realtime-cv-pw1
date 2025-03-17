import * as THREE from "https://unpkg.com/three@0.172.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.172.0/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://unpkg.com/three@0.172.0/examples/jsm/libs/lil-gui.module.min.js";
import WEBGL from "https://unpkg.com/three@0.172.0/examples/jsm/capabilities/WebGL.js";
import { IVimageProcessing } from "./ImageProcessing.js";
import { fragmentShader, vertexShader } from "./shader.js";
import { initRenderer, initCamera } from "./init.js";
import { generateVideoElement } from "./videoElement.js";

export class ShaderApp {
  constructor() {
    // 複数メソッド間で共有が必要なプロパティのみを残す
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.video = null;
    this.imageProcessing = null;
  }

  // シーンの初期化
  setupScene() {
    this.renderer = initRenderer();
    this.camera = initCamera();
    this.scene = new THREE.Scene();
    return true;
  }

  // ビデオとシェーダーの設定
  async setupVideoAndShaders() {
    // ビデオの設定
    this.video = generateVideoElement();

    return new Promise((resolve) => {
      this.video.onloadeddata = () => {
        const videoTexture = this.setupVideoTexture();
        const imageProcessingMaterial = this.setupImageProcessing(
          vertexShader,
          fragmentShader,
          videoTexture
        );
        this.setupPlanes(videoTexture);
        this.setupGUI(imageProcessingMaterial);
        this.video.play();
        resolve();
      };
    });
  }

  // ビデオテクスチャの設定
  setupVideoTexture() {
    const videoTexture = new THREE.VideoTexture(this.video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBAFormat;
    return videoTexture;
  }

  // 画像処理材質の設定
  setupImageProcessing(vertexShader, fragmentShader, videoTexture) {
    const imageProcessingMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        sizeDiv2: { type: "i", value: 5 },
        colorScaleR: { type: "f", value: 1.0 },
        colorScaleG: { type: "f", value: 1.0 },
        colorScaleB: { type: "f", value: 1.0 },
        mixRate: { type: "f", value: 0.5 },
        scale: { type: "f", value: 1.0 },
        translateX: { type: "f", value: 0.0 },
        translateY: { type: "f", value: 0.0 },
        theta: { type: "f", value: 0.0 },
        invert: { type: "b", value: false },
        image: { type: "t", value: videoTexture },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
    });

    this.imageProcessing = new IVimageProcessing(
      this.video.videoHeight,
      this.video.videoWidth / 2.0,
      imageProcessingMaterial
    );

    return imageProcessingMaterial;
  }

  // 平面の設定
  setupPlanes(videoTexture) {
    const aspectRatio = this.video.videoHeight / this.video.videoWidth;

    // 処理済み映像の平面
    const geometry = new THREE.PlaneGeometry(1, aspectRatio);
    const material = new THREE.MeshBasicMaterial({
      map: this.imageProcessing.rtt.texture,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = 0.15;
    plane.receiveShadow = false;
    plane.castShadow = false;
    this.scene.add(plane);

    // // 元映像の平面
    // const geometry2 = new THREE.PlaneGeometry(1, aspectRatio);
    // const material2 = new THREE.MeshBasicMaterial({
    //   map: videoTexture,
    //   side: THREE.DoubleSide,
    // });
    // const originalPlane = new THREE.Mesh(geometry2, material2);
    // originalPlane.position.z = -0.15;
    // originalPlane.receiveShadow = false;
    // originalPlane.castShadow = false;
    // this.scene.add(originalPlane);
  }

  // GUI設定
  setupGUI(imageProcessingMaterial) {
    const pausePlayObj = {
      pausePlay: () => {
        if (!this.video.paused) {
          console.log("pause");
          this.video.pause();
        } else {
          console.log("play");
          this.video.play();
        }
      },
      add10sec: () => {
        this.video.currentTime = this.video.currentTime + 10;
        console.log(this.video.currentTime);
      },
    };

    const gui = new GUI();
    gui
      .add(imageProcessingMaterial.uniforms.colorScaleR, "value", 0, 1)
      .name("Red");
    gui
      .add(imageProcessingMaterial.uniforms.colorScaleG, "value", 0, 1)
      .name("Green");
    gui
      .add(imageProcessingMaterial.uniforms.colorScaleB, "value", 0, 1)
      .name("Blue");
    gui
      .add(imageProcessingMaterial.uniforms.mixRate, "value", 0, 1)
      .name("Mix rate");
    gui
      .add(imageProcessingMaterial.uniforms.sizeDiv2, "value", 1, 21)
      .name("sizeDiv2");
    gui
      .add(imageProcessingMaterial.uniforms.scale, "value", 0.1, 10)
      .name("Scale");
    gui
      .add(imageProcessingMaterial.uniforms.translateX, "value", 0, 1)
      .name("Translate X");
    gui
      .add(imageProcessingMaterial.uniforms.translateY, "value", 0, 1)
      .name("Translate Y");
    gui.add(imageProcessingMaterial.uniforms.invert, "value").name("Invert");
    gui.add(pausePlayObj, "pausePlay").name("Pause/play video");
    gui.add(pausePlayObj, "add10sec").name("Add 10 seconds");
  }

  // ウィンドウリサイズハンドラ
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  // レンダリング
  render() {
    this.renderer.clear();
    if (this.imageProcessing) {
      this.imageProcessing.IVprocess( this.renderer);
    }
    this.renderer.render(this.scene, this.camera);
  }

  // アニメーション
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  // アプリケーション初期化
  async init() {
    const sceneReady = await this.setupScene();
    if (!sceneReady) return;

    await this.setupVideoAndShaders();

    window.addEventListener("resize", () => this.handleResize(), false);
    this.animate();
  }
}
