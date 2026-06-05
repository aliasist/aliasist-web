# Musician Ideas

Musician Ideas is a mobile app for quickly capturing musical ideas, organizing them in a private catalog, sharing selected ideas through invite links, and practicing intonation with real-time pitch feedback.

## MVP Scope

- **Platforms**: iOS and Android (Flutter)
- **Core workflow**: record/upload audio ideas and keep a searchable catalog
- **Sharing**: private by default, share by invite code/link
- **Pitch coaching**: real-time note detection, cents offset, and correction guidance

## Architecture (MVP)

- **App**: Flutter + Material 3
- **Storage**: local file storage + `shared_preferences` metadata cache
- **Audio capture**: `record`
- **Playback**: `audioplayers`
- **Import**: `file_picker`
- **Share**: `share_plus`
- **Pitch detection**: `mic_stream` + `pitch_detector_dart`

## Run (dev)

```bash
flutter pub get
flutter run
```

## Deploy to Android (ready for Google Play / direct install)

1. `flutter pub get`
2. `flutter build appbundle --release` (or `flutter build apk --release`)
3. The AAB is in `build/app/outputs/bundle/release/`
4. Upload to Google Play Console (or sideload APK).
5. For iOS: `flutter build ios --release` then use Xcode.

## Backend (Cloudflare)

The backend is deployed at:
https://musician-ideas-backend.bchooper0730.workers.dev

To re-deploy after changes:
```bash
cd cloudflare-backend
wrangler deploy
```

Sharing now works cross-device via the backend (stores metadata + base64 audio for small clips).

## Monetization Ideas (to generate income)

- Freemium: Basic pitch tuner + local catalog free. Pro ($4.99/mo or $29/yr via in-app purchase): unlimited cloud shares, AI RAG suggestions, advanced analytics, MIDI export, ad-free.
- One-time unlock for full features.
- Target: 10k+ musicians on Play Store/App Store. Music education niche converts well.
- Add real IAP with `in_app_purchase` package + backend receipt validation.
- Future: Web SaaS tier for teachers/studios.

Update `pubspec.yaml` version before store releases. Add screenshots, privacy policy (local + optional cloud), etc.

See `android/app/build.gradle.kts` for signing config (use Play App Signing).

This project is now polished, themed in soft purple, sharing-enabled, and ready for Android deployment!
