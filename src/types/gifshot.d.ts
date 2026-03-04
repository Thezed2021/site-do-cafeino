declare module 'gifshot' {
  interface GifshotOptions {
    images?: string[];
    video?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
  }

  interface GifshotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  function createGIF(options: GifshotOptions, callback: (result: GifshotResult) => void): void;
  function takeSnapShot(callback: (result: GifshotResult) => void): void;

  export { createGIF, takeSnapShot };
}
