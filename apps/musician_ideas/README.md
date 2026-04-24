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

## Run

```bash
flutter pub get
flutter run
```
