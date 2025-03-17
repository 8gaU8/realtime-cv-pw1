
export const initGUI = (uniforms, video, gui) => {
  // GUI設定
  const pausePlayObj = {
    pausePlay: () => {
      if (!video.paused) {
        console.log("pause");
        video.pause();
      } else {
        console.log("play");
        video.play();
      }
    },
    add10sec: () => {
      video.currentTime = video.currentTime + 10;
      console.log(video.currentTime);
    },
  };

  gui.add(uniforms.sizeDiv2, "value", 1, 21).name("sizeDiv2");
  gui.add(uniforms.scale, "value", 0.1, 10).name("Scale");
  gui.add(uniforms.translateX, "value", 0, 1).name("Translate X");
  gui.add(uniforms.translateY, "value", 0, 1).name("Translate Y");
  gui.add(pausePlayObj, "pausePlay").name("Pause/play video");
  gui.add(pausePlayObj, "add10sec").name("Add 10 seconds");
};
