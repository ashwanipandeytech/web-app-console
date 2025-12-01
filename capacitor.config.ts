import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'demo_app',
  webDir: 'dist/website/browser',
  android: {
    adjustMarginsForEdgeToEdge: 'auto',  // Enforces edge-to-edge handling
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 8000,
      launchAutoHide: false,
      backgroundColor: "#222",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#fff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: false,
    },
    StatusBar: {
      overlaysWebView: false,           // Status bar should not overlay the WebView
      style: 'Light',                   // 'LIGHT' for dark background, 'DARK' for light background
      backgroundColor: '#000000',       // Background color of the status bar
    },
    EdgeToEdge: {
      backgroundColor: '#ffffff',      // Custom color for the Edge-to-Edge plugin if used
    },
    Keyboard: {
      resizeOnFullScreen: false,        // Prevents issues with the keyboard and layout
    },
  }
};

export default config;
