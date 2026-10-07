# Shelter: Android + GitHub Pages packaging (game v0.5.1)

`game/` is your exact, unmodified ZIP contents. Nothing in the game was changed.

## Layout
- `game/` original game. `android/app/src/main/assets/www/` is a byte-identical copy (run `scripts/sync.sh` after editing `game/`).
- `android/` Gradle project (package `com.shelter.game`, minSdk 24, targetSdk 34, Java, one dependency: androidx.webkit).
- `web/` the GitHub Pages build: the same game plus 3 additions: manifest link, service-worker registration (in `index.html`), and `manifest.webmanifest`, `sw.js`, icons for offline install.
- `.github/workflows/android.yml` builds the APK. `.github/workflows/pages.yml` deploys `web/`.

## Get the APK (no Android Studio needed)
1. Create a GitHub repo and push this folder to the `main` branch.
2. Open the Actions tab, run "Build Android APK" (it also runs on every push).
3. Download the artifact `shelter-debug-apk` and unzip it to get `app-debug.apk`. Install it on your phone (allow "install unknown apps").
Locally: install Android Studio, open the `android/` folder, then Build > Build APK(s). Or with JDK 17, the Android SDK and Gradle 8.7: `gradle -p android assembleDebug`.

## GitHub Pages
Repo Settings > Pages > Source: GitHub Actions. After the workflow runs, the game is at `https://<user>.github.io/<repo>/` and works offline after the first visit.

## How the app behaves
- Game served from the APK's assets at https://appassets.androidplatform.net, so saves (localStorage) persist between launches and app updates. Clearing app data or uninstalling deletes saves.
- No INTERNET permission: fully offline.
- Back button: Journey/Settings/Multiplayer go back; during a level it asks, then returns to the title screen (progress is saved); on the title screen it exits. The game is also saved when the app goes to the background.
- Rotation does not restart the game. Keyboards and gamepads reach the game through the WebView; touch uses the game's buttons.
- The debug APK is signed with the standard debug key. For Play Store or release, create your own keystore and build `assembleRelease` with signing.
- Android multiplayer (same-browser tabs) is not meaningful in the app; the game's two-tab prototype stays as is.
