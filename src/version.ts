declare const __SDK_VERSION__: string;

export const SDK_VERSION: string =
  typeof __SDK_VERSION__ !== 'undefined' ? __SDK_VERSION__ : '2.0.1';
