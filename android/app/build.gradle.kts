plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.turkce.istanbul"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.turkce.istanbul"
        minSdk = 26
        targetSdk = 34
        versionCode = 1          // raise this (and versionName) for every new APK you publish
        versionName = "1.0"
        buildConfigField("String", "SERVER_URL", "\"\"")   // empty = the app asks for the server address on first launch
    }
    signingConfigs {
        create("release") {
            // one fixed key, so every APK you build (Android Studio or GitHub) can update the previous one
            storeFile = file("../release.jks")
            storePassword = "turkce123"
            keyAlias = "turkce"
            keyPassword = "turkce123"
        }
    }
    buildTypes { release { isMinifyEnabled = false; signingConfig = signingConfigs.getByName("release") } }
    buildFeatures { buildConfig = true }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies { implementation("androidx.core:core-ktx:1.13.1") }
