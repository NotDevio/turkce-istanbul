# Türkçe İstanbul – Android app

A real Android app (WebView + native speech). It opens **your server's** web app, so lessons and features update
automatically whenever you update the server. Only changes to the Android code itself need a new APK.

What the app does that Chrome's "install" cannot:
- Asks Android for the **microphone** permission itself (it then appears in Settings > Apps > Türkçe İstanbul > Permissions).
- Uses Android's own **speech recognition** (Turkish) and **text-to-speech** instead of Chrome's.
- Checks your server for a newer APK and installs it in one tap (Profile > App updates > Check for updates, and automatically at start).

## Build it once (Android Studio)
1. Install Android Studio, choose **Open**, pick this `android` folder, accept the Gradle sync / wrapper download.
2. **Build > Generate Signed App Bundle / APK > APK**. Create a keystore the first time and **keep it safe: every update must be signed with the same key**, otherwise Android refuses to update the app.
3. Copy `app-release.apk` to your phone and install it (allow "install unknown apps" when asked).
4. First launch: allow the microphone, then type your server address (for example `https://your-pc.tailnet.ts.net:3000`). Use *Profile > App updates > Change server address* to change it later.

## Publish an app update (no reinstall)
1. In `app/build.gradle.kts` raise `versionCode` (e.g. 2) and `versionName`.
2. Build the signed APK again (same keystore).
3. On the server create the folder `data/app/` and put in it:
   - `latest.apk`
   - `version.json`: `{"versionCode": 2, "versionName": "1.1", "notes": "What is new"}`
4. Phones show "Update available" the next time the app starts, or when you tap *Check for updates*. The first time, Android asks to allow installing from this app.

## Notes
- Speech recognition needs the **Google app / Speech Services** on the phone and, for Turkish, usually an internet connection (or the Turkish offline speech pack: Settings > Google > Speech). Without them Android reports "not available" and the app skips the speaking exercises.
- Streak reminders (Web Push) do not work inside a WebView. Everything else does.
- The web part also still works in a normal browser or as an installed PWA, as before.

## Without Android Studio: build in the cloud (GitHub, free)
1. Make a free GitHub account and create a **private** repository.
2. Upload the contents of the zip (the `android` folder, the `.github` folder and `turkce-istanbul-main`) to it. (On github.com: *Add file > Upload files*; make sure `.github/workflows/android.yml` is included.)
3. Open the **Actions** tab > **Build Android APK** > **Run workflow**. Wait about 5 minutes.
4. Open the finished run, download the **turkce-istanbul-apk** file at the bottom, unzip it: that is `app-release.apk`. Install it on your phone.
For an update: raise `versionCode` in `android/app/build.gradle.kts`, commit, download the new APK from Actions, and put it in the server's `data/app/` as `latest.apk` with a new `version.json`.

The signing key is included (`android/release.jks`) so every build can update the last one. Keep the repository private; anyone with that file could sign apps as you.
