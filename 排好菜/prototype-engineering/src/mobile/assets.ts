const runtimeAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const mobileAssets = {
  iphoneBezel: runtimeAsset("assets/iphone/Bezel.png"),
  iphoneKeyboard: runtimeAsset("assets/iphone/Keyboard.png"),
  androidKeyboard: runtimeAsset("assets/android/Keyboard.png"),
  pixel10Bezel: runtimeAsset("assets/android/Pixel10.png"),
  androidNavigationBar: runtimeAsset("assets/android/navigation-bar.svg"),
  statusIcons: runtimeAsset("assets/status/status-icons.svg"),
  iosStatusIcons: runtimeAsset("assets/status/ios-status-icons.svg"),
} as const;
