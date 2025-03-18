import moonUrl from "../assets/moon.mp4";
import sfURL from "../assets/sf.mp4";

export const videoConfig = {
  "moon.mp4": {
    heightFactor: 1,
    widthFactor: 1,
    path: moonUrl,
  },

  "sf.mp4": {
    heightFactor: 1,
    widthFactor: 2,
    path: sfURL,
  },
};

export function generateVideoElement(path) {
  const video = document.createElement("video");
  video.src = path;
  video.load();
  video.muted = true;
  video.loop = true;
  return video;
}
