import * as THREE from "https://unpkg.com/three@0.172.0/build/three.module.js";
import { loadStaticTexture } from "./utils.js";

/**
 * 静的テクスチャをセットアップする
 * @param {string} path - テクスチャの画像パス
 * @returns {THREE.Texture} - 設定されたテクスチャ
 */
export function setupStaticTexture(path = "./grenouille.jpg") {
  const staticTexture = loadStaticTexture(path);
  staticTexture.minFilter = THREE.NearestFilter;
  staticTexture.magFilter = THREE.NearestFilter;
  staticTexture.generateMipmaps = false;
  staticTexture.format = THREE.RGBAFormat;
  return staticTexture;
}
