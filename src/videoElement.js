import moonUrl from "../assets/moon.mp4";
import sfURL from "../assets/sf.mp4";

const videoConfig = {
  "moon.mp4": {
    heightFactor: 1,
    widthFactor: 1,
    path: moonUrl,
  },

  "sf.mp4": {
    heightFactor: 1,
    widthFactor: 2,
    sfURL,
  },
};

export const generateVideoElement = () => {
  const video = document.createElement("video");
  video.src = sfURL;
  video.load();
  video.muted = true;
  video.loop = true;
  return video;
};
