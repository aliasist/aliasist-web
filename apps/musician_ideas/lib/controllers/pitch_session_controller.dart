import 'package:musician_ideas/services/pitch_coach.dart';

/// Tracks a live pitch-analysis session so the UI can render aggregate
/// stats (average score, on-key rate, streaks, trend) without cluttering
/// the screen's [State].
class PitchSessionController {
  static const int _historyLimit = 90;
  static const int _minTrendSamples = 8;

  final List<double> _scoreHistory = <double>[];
  int _frameCount = 0;
  int _inTuneCount = 0;
  int _currentStreak = 0;
  int _bestStreak = 0;

  List<double> get scoreHistory => List<double>.unmodifiable(_scoreHistory);
  int get bestInTuneStreak => _bestStreak;

  void reset() {
    _scoreHistory.clear();
    _frameCount = 0;
    _inTuneCount = 0;
    _currentStreak = 0;
    _bestStreak = 0;
  }

  void record(PitchReading reading) {
    _frameCount += 1;
    if (reading.inTune) {
      _inTuneCount += 1;
      _currentStreak += 1;
      if (_currentStreak > _bestStreak) {
        _bestStreak = _currentStreak;
      }
    } else {
      _currentStreak = 0;
    }

    final accuracy =
        1 - (reading.smoothedCents.abs().clamp(0.0, 50.0) / 50.0);
    final quality = (reading.confidence + reading.signalQuality) / 2;
    final score =
        ((0.75 * accuracy) + (0.25 * quality)).clamp(0.0, 1.0) * 100;
    _scoreHistory.add(score);
    if (_scoreHistory.length > _historyLimit) {
      _scoreHistory.removeAt(0);
    }
  }

  double onKeyRate() {
    if (_frameCount == 0) return 0;
    return _inTuneCount / _frameCount;
  }

  double averageScore() {
    if (_scoreHistory.isEmpty) return 0;
    final total = _scoreHistory.fold<double>(
      0,
      (sum, value) => sum + value,
    );
    return total / _scoreHistory.length;
  }

  String trendLabel() {
    if (_scoreHistory.length < _minTrendSamples) return 'Collecting baseline';
    final half = _scoreHistory.length ~/ 2;
    final firstHalf = _scoreHistory.take(half);
    final secondHalf = _scoreHistory.skip(half);
    final firstAvg =
        firstHalf.fold<double>(0, (sum, value) => sum + value) /
        firstHalf.length;
    final secondAvg =
        secondHalf.fold<double>(0, (sum, value) => sum + value) /
        secondHalf.length;
    final delta = secondAvg - firstAvg;
    if (delta >= 4) return 'Improving';
    if (delta <= -4) return 'Dropping';
    return 'Steady';
  }
}
