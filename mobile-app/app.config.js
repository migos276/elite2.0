export default {
  expo: {
    name: "Elite Mobile",
    slug: "elite-mobile",
    version: "1.0.0",
    scheme: "elitemobile", // Required for production linking
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.elite.mobile",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.elite.mobile",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },


    // plugins: []
    extra: {
      eas: {
        projectId: "elite-mobile-project"
      }
    }
  }
};
