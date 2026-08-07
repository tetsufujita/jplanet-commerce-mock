declare module "pngjs" {
  interface PngOptions {
    height: number;
    width: number;
  }

  export class PNG {
    static sync: {
      read(data: Uint8Array): PNG;
      write(png: PNG): Uint8Array;
    };

    data: Uint8Array;
    height: number;
    width: number;

    constructor(options: PngOptions);
  }
}
