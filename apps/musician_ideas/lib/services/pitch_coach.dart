import 'dart:async';
import 'dart:math';
import 'dart:typed_data';

import 'package:mic_stream/mic_stream.dart';
import 'package:pitch_detector_dart/pitch_detector.dart';

class PitchReading {
  const PitchReading({
    required this.frequency,
    required this.note,
    required this.targetNote,
    required this.cents,
    required this.smoothedCents,
    required this.confidence,
    required this.signalQuality,
    required this.inTune,
    required this.tuningLabel,
    required this.targetFrequency,
    required this.trendLabel,
    required this.stabilityLabel,
    required this.reasoningSummary,
    required this.recommendations,
    required this.neighborNotes,
    required this.guidance,
  });

  final double frequency;
  final String note;
  final String targetNote;
  final double cents;
  final double smoothedCents;
  final double confidence;
  final double signalQuality;
  final bool inTune;
  final String tuningLabel;
  final double targetFrequency;
  final String trendLabel;
  final String stabilityLabel;
  final String reasoningSummary;
  final List<String> recommendations;
  final List<String> neighborNotes;
  final String guidance;
}

class PitchCoach {
  final StreamController<PitchReading> _controller =
      StreamController<PitchReading>.broadcast();
  final List<int> _pcmWindow = <int>[];
  final List<_PitchFrame> _history = <_PitchFrame>[];

  StreamSubscription<Uint8List>? _micSubscription;
  PitchDetector _pitchDetector = PitchDetector();
  bool _running = false;
  int _sampleRate = 44100;
  double? _emaFrequency;
  double? _lastTrustedFrequency;
  double? _pendingJumpFrequency;
  int _pendingJumpFrames = 0;

  double _a4Hz = 440;
  int _toleranceCents = 10;
  int? _targetMidi;
  double? _referenceHz;

  Stream<PitchReading> get readings => _controller.stream;
  bool get isRunning => _running;

  void configure({
    double? a4Hz,
    int? toleranceCents,
    int? targetMidi,
    double? referenceHz,
    bool updateTargetMidi = false,
    bool clearReference = false,
  }) {
    if (a4Hz != null) {
      _a4Hz = a4Hz.clamp(430, 450);
    }
    if (toleranceCents != null) {
      _toleranceCents = toleranceCents.clamp(5, 30);
    }
    if (updateTargetMidi) {
      _targetMidi = targetMidi;
      _history.clear();
      _emaFrequency = null;
      _lastTrustedFrequency = null;
      _pendingJumpFrequency = null;
      _pendingJumpFrames = 0;
    }
    if (referenceHz != null) {
      final clampedReference = referenceHz.clamp(55, 1200).toDouble();
      if (_referenceHz != clampedReference) {
        _referenceHz = clampedReference;
        _history.clear();
        _emaFrequency = null;
        _lastTrustedFrequency = null;
        _pendingJumpFrequency = null;
        _pendingJumpFrames = 0;
      }
    }
    if (clearReference && _referenceHz != null) {
      _referenceHz = null;
      _history.clear();
      _emaFrequency = null;
      _lastTrustedFrequency = null;
      _pendingJumpFrequency = null;
      _pendingJumpFrames = 0;
    }
  }

  Future<void> start() async {
    if (_running) return;
    _running = true;

    MicStream.shouldRequestPermission(true);
    final mic = MicStream.microphone(
      sampleRate: 44100,
      channelConfig: ChannelConfig.CHANNEL_IN_MONO,
      audioFormat: AudioFormat.ENCODING_PCM_16BIT,
    );

    _sampleRate = await MicStream.sampleRate;
    _pitchDetector = PitchDetector(
      audioSampleRate: _sampleRate.toDouble(),
      bufferSize: 2048,
    );

    _micSubscription = mic.listen(_onAudioChunk, onError: _controller.addError);
  }

  Future<void> stop() async {
    if (!_running) return;
    _running = false;
    _pcmWindow.clear();
    _history.clear();
    _emaFrequency = null;
    _lastTrustedFrequency = null;
    _pendingJumpFrequency = null;
    _pendingJumpFrames = 0;
    await _micSubscription?.cancel();
    _micSubscription = null;
    MicStream.clean();
  }

  Future<void> dispose() async {
    await stop();
    await _controller.close();
  }

  Future<void> _onAudioChunk(Uint8List chunk) async {
    _pcmWindow.addAll(chunk);
    if (_pcmWindow.length < 4096) return;

    final tailStart = _pcmWindow.length - 4096;
    final frame = Uint8List.fromList(_pcmWindow.sublist(tailStart));
    if (_pcmWindow.length > 8192) {
      _pcmWindow.removeRange(0, _pcmWindow.length - 8192);
    }

    final rms = _rmsLevel(frame);
    if (rms < 0.006) return;

    final autocorr = _estimateFromAutocorrelation(frame);
    if (!autocorr.isVoiced) return;

    final yin = await _pitchDetector.getPitchFromIntBuffer(frame);
    if (!yin.pitched || yin.pitch < 55 || yin.pitch > 1200) {
      return;
    }

    final fused = _fuseFrequencies(
      yinFrequency: yin.pitch,
      yinProbability: yin.probability,
      autocorrFrequency: autocorr.frequency,
      autocorrQuality: autocorr.quality,
    );

    final signalQuality =
        (0.55 * yin.probability +
                0.30 * autocorr.quality +
                0.15 * _normalizeRms(rms))
            .clamp(0.0, 1.0);
    if (signalQuality < 0.4) return;

    final stabilizedFrequency = _stabilizeFrequency(
      candidateFrequency: fused.frequency,
      signalQuality: signalQuality,
      confidence: fused.confidence,
    );
    if (stabilizedFrequency == null) return;

    _controller.add(
      _toReading(
        frequency: stabilizedFrequency,
        confidence: fused.confidence,
        signalQuality: signalQuality,
        rms: rms,
      ),
    );
  }

  double? _stabilizeFrequency({
    required double candidateFrequency,
    required double signalQuality,
    required double confidence,
  }) {
    if (candidateFrequency < 55 || candidateFrequency > 1200) {
      return null;
    }

    var candidate = candidateFrequency;
    final reference = _lastTrustedFrequency ?? _emaFrequency ?? _referenceHz;
    if (reference != null && reference > 0) {
      candidate = _harmonicCorrect(candidate, reference);

      final jumpCents = _centsBetween(candidate, reference).abs();
      if (jumpCents > 140) {
        if (_pendingJumpFrequency != null &&
            _centsBetween(candidate, _pendingJumpFrequency!).abs() <= 28) {
          _pendingJumpFrames += 1;
        } else {
          _pendingJumpFrequency = candidate;
          _pendingJumpFrames = 1;
        }

        final strongFrame = signalQuality >= 0.82 && confidence >= 0.78;
        if (!strongFrame && _pendingJumpFrames < 3) {
          return null;
        }
      } else {
        _pendingJumpFrequency = null;
        _pendingJumpFrames = 0;
      }
    } else {
      _pendingJumpFrequency = null;
      _pendingJumpFrames = 0;
    }

    if (_history.length >= 8) {
      final recentMedian = _median(
        _takeLast(_history.map((f) => f.frequency).toList(), 8),
      );
      if (recentMedian > 0 &&
          _centsBetween(candidate, recentMedian).abs() > 90 &&
          signalQuality < 0.75) {
        candidate = (0.75 * recentMedian) + (0.25 * candidate);
      }
    }

    final alpha = (0.16 + (0.34 * signalQuality) + (0.10 * confidence)).clamp(
      0.16,
      0.60,
    );
    final previous = _emaFrequency;
    _emaFrequency = previous == null
        ? candidate
        : previous + (alpha * (candidate - previous));
    _lastTrustedFrequency = _emaFrequency;
    return _emaFrequency;
  }

  double _harmonicCorrect(double candidate, double reference) {
    final ratio = candidate / reference;
    if (ratio > 1.85 && ratio < 2.15) {
      return candidate / 2;
    }
    if (ratio > 0.46 && ratio < 0.54) {
      return candidate * 2;
    }
    if (ratio > 2.7 && ratio < 3.3) {
      return candidate / 3;
    }
    if (ratio > 0.30 && ratio < 0.37) {
      return candidate * 3;
    }
    return candidate;
  }

  double _centsBetween(double a, double b) {
    if (a <= 0 || b <= 0) return 0;
    return 1200 * (log(a / b) / ln2);
  }

  PitchReading _toReading({
    required double frequency,
    required double confidence,
    required double signalQuality,
    required double rms,
  }) {
    final midiFloat = 69 + (12 * log(frequency / _a4Hz) / ln2);
    final detectedMidi = midiFloat.round();
    final referenceMidi = _referenceHz == null
        ? null
        : (69 + (12 * log(_referenceHz! / _a4Hz) / ln2)).round();
    final targetMidi = _targetMidi ?? referenceMidi ?? detectedMidi;

    final detectedNote = _noteLabel(detectedMidi);
    final targetNote = _noteLabel(targetMidi);
    final targetFrequency = _a4Hz * pow(2, (targetMidi - 69) / 12);
    final cents = 100 * (midiFloat - targetMidi);

    _history.add(
      _PitchFrame(
        targetMidi: targetMidi,
        cents: cents,
        frequency: frequency,
        confidence: confidence,
        signalQuality: signalQuality,
        rms: rms,
      ),
    );
    if (_history.length > 48) {
      _history.removeRange(0, _history.length - 48);
    }

    final recentTarget = _takeLast(
      _history.where((frame) => frame.targetMidi == targetMidi).toList(),
      16,
    );
    final smoothedCents = _weightedMean(
      recentTarget.map((f) => f.cents),
      recentTarget.map((f) => f.confidence * f.signalQuality),
    );
    final smoothedFrequency = _median(recentTarget.map((f) => f.frequency));
    final avgConfidence = _mean(recentTarget.map((f) => f.confidence));
    final avgSignalQuality = _mean(recentTarget.map((f) => f.signalQuality));

    final dynamicTolerance = _dynamicTolerance(
      baseTolerance: _toleranceCents,
      signalQuality: avgSignalQuality,
      stability: _stabilityScore(recentTarget),
    );
    final inTune = smoothedCents.abs() <= dynamicTolerance;
    final tuningLabel = _tuningLabel(smoothedCents, dynamicTolerance);
    final trendLabel = _trendLabel(recentTarget);
    final stabilityLabel = _stabilityLabel(recentTarget);

    final reasoningSummary =
        '$tuningLabel (${smoothedCents.toStringAsFixed(1)} cents), '
        '$trendLabel trend, $stabilityLabel stability, '
        '${_signalQualityLabel(avgSignalQuality)} signal.';

    return PitchReading(
      frequency: smoothedFrequency,
      note: detectedNote,
      targetNote: targetNote,
      cents: cents,
      smoothedCents: smoothedCents,
      confidence: avgConfidence,
      signalQuality: avgSignalQuality,
      inTune: inTune,
      tuningLabel: tuningLabel,
      targetFrequency: targetFrequency.toDouble(),
      trendLabel: trendLabel,
      stabilityLabel: stabilityLabel,
      reasoningSummary: reasoningSummary,
      recommendations: _recommendations(
        smoothedCents: smoothedCents,
        trendLabel: trendLabel,
        stabilityLabel: stabilityLabel,
        signalQuality: avgSignalQuality,
      ),
      neighborNotes: <String>[
        _noteLabelWithFrequency(targetMidi - 1),
        _noteLabelWithFrequency(targetMidi + 1),
      ],
      guidance: _guidance(tuningLabel),
    );
  }

  _AutocorrEstimate _estimateFromAutocorrelation(Uint8List frameBytes) {
    final samples = _pcm16ToFloat(frameBytes);
    if (samples.length < 512) {
      return const _AutocorrEstimate(frequency: 0, quality: 0, isVoiced: false);
    }

    final pre = _preEmphasis(samples, 0.97);
    final windowed = _hann(pre);

    final minLag = max(2, (_sampleRate / 1100).floor());
    final maxLag = min(windowed.length ~/ 2, (_sampleRate / 75).ceil());
    if (minLag >= maxLag) {
      return const _AutocorrEstimate(frequency: 0, quality: 0, isVoiced: false);
    }

    var bestLag = minLag;
    var bestScore = -1.0;
    for (var lag = minLag; lag <= maxLag; lag++) {
      var ac = 0.0;
      var energy0 = 0.0;
      var energyLag = 0.0;
      final length = windowed.length - lag;
      for (var i = 0; i < length; i++) {
        final a = windowed[i];
        final b = windowed[i + lag];
        ac += a * b;
        energy0 += a * a;
        energyLag += b * b;
      }
      final denom = sqrt(energy0 * energyLag) + 1e-9;
      final score = ac / denom;
      if (score > bestScore) {
        bestScore = score;
        bestLag = lag;
      }
    }

    if (bestScore < 0.56) {
      return _AutocorrEstimate(
        frequency: 0,
        quality: bestScore,
        isVoiced: false,
      );
    }

    final refinedLag = _parabolicLag(
      windowed,
      bestLag,
    ).clamp(minLag.toDouble(), maxLag.toDouble());
    final frequency = _sampleRate / refinedLag;
    final vocalRange = frequency >= 75 && frequency <= 1100;
    return _AutocorrEstimate(
      frequency: frequency,
      quality: bestScore.clamp(0, 1),
      isVoiced: vocalRange,
    );
  }

  _FusedEstimate _fuseFrequencies({
    required double yinFrequency,
    required double yinProbability,
    required double autocorrFrequency,
    required double autocorrQuality,
  }) {
    final centsDelta = 1200 * (log(yinFrequency / autocorrFrequency) / ln2);
    if (autocorrFrequency <= 0 || autocorrQuality < 0.5) {
      return _FusedEstimate(
        frequency: yinFrequency,
        confidence: yinProbability.clamp(0, 1),
      );
    }

    if (centsDelta.abs() <= 28) {
      final yw = max(0.01, yinProbability);
      final aw = max(0.01, autocorrQuality);
      final frequency =
          (yinFrequency * yw + autocorrFrequency * aw) / (yw + aw);
      final confidence = (0.65 * yinProbability + 0.35 * autocorrQuality).clamp(
        0.0,
        1.0,
      );
      return _FusedEstimate(frequency: frequency, confidence: confidence);
    }

    if (autocorrQuality > yinProbability + 0.15) {
      return _FusedEstimate(
        frequency: autocorrFrequency,
        confidence: (0.6 * autocorrQuality + 0.4 * yinProbability).clamp(
          0.0,
          1.0,
        ),
      );
    }

    return _FusedEstimate(
      frequency: yinFrequency,
      confidence: (0.75 * yinProbability + 0.25 * autocorrQuality).clamp(
        0.0,
        1.0,
      ),
    );
  }

  double _parabolicLag(List<double> samples, int lag) {
    final left = max(1, lag - 1);
    final right = min(samples.length - 2, lag + 1);
    if (left == lag || right == lag) return lag.toDouble();

    double corrAt(int k) {
      var ac = 0.0;
      final length = samples.length - k;
      for (var i = 0; i < length; i++) {
        ac += samples[i] * samples[i + k];
      }
      return ac;
    }

    final y1 = corrAt(left);
    final y2 = corrAt(lag);
    final y3 = corrAt(right);
    final denom = (y1 - 2 * y2 + y3);
    if (denom.abs() < 1e-9) return lag.toDouble();
    final offset = 0.5 * (y1 - y3) / denom;
    return lag + offset;
  }

  List<double> _pcm16ToFloat(Uint8List bytes) {
    final data = ByteData.sublistView(bytes);
    final out = List<double>.filled(bytes.length ~/ 2, 0);
    for (var i = 0; i < out.length; i++) {
      out[i] = data.getInt16(i * 2, Endian.little) / 32768.0;
    }
    return out;
  }

  List<double> _preEmphasis(List<double> samples, double factor) {
    if (samples.isEmpty) return <double>[];
    final out = List<double>.filled(samples.length, 0);
    out[0] = samples[0];
    for (var i = 1; i < samples.length; i++) {
      out[i] = samples[i] - factor * samples[i - 1];
    }
    return out;
  }

  List<double> _hann(List<double> samples) {
    final n = samples.length;
    if (n <= 1) return samples;
    final out = List<double>.filled(n, 0);
    for (var i = 0; i < n; i++) {
      final w = 0.5 - 0.5 * cos((2 * pi * i) / (n - 1));
      out[i] = samples[i] * w;
    }
    return out;
  }

  String _guidance(String tuningLabel) {
    switch (tuningLabel) {
      case 'In tune':
        return 'Excellent vocal center. Sustain and keep resonance steady.';
      case 'Slightly sharp':
      case 'Very sharp':
        return 'Release throat/jaw tension and let pitch settle lower.';
      case 'Slightly flat':
      case 'Very flat':
        return 'Engage breath support and aim slightly above center.';
      default:
        return 'Aim for a stable sustained vowel.';
    }
  }

  List<String> _recommendations({
    required double smoothedCents,
    required String trendLabel,
    required String stabilityLabel,
    required double signalQuality,
  }) {
    final tips = <String>[];

    if (smoothedCents > _toleranceCents) {
      tips.add('Sharp: relax laryngeal tension and slightly reduce pressure.');
    } else if (smoothedCents < -_toleranceCents) {
      tips.add('Flat: increase support and energize onset a little more.');
    } else {
      tips.add('Centered pitch: keep airflow and vowel shape consistent.');
    }

    if (trendLabel == 'rising') {
      tips.add('Pitch drifts up: avoid squeezing as the note sustains.');
    } else if (trendLabel == 'falling') {
      tips.add('Pitch drifts down: maintain breath energy through the phrase.');
    }

    if (stabilityLabel == 'unstable') {
      tips.add('Instability detected: practice 5-8 second sustained vowels.');
    } else if (stabilityLabel == 'moderate wobble') {
      tips.add('Moderate wobble: use gentler onset to lock pitch sooner.');
    }

    if (signalQuality < 0.45) {
      tips.add(
        'Low signal quality: sing closer to mic and reduce background noise.',
      );
    }

    return tips;
  }

  String _tuningLabel(double cents, int tolerance) {
    if (cents.abs() <= tolerance) return 'In tune';
    if (cents > 35) return 'Very sharp';
    if (cents < -35) return 'Very flat';
    if (cents > 0) return 'Slightly sharp';
    return 'Slightly flat';
  }

  int _dynamicTolerance({
    required int baseTolerance,
    required double signalQuality,
    required double stability,
  }) {
    final qualityFactor = (1 - signalQuality).clamp(0.0, 1.0);
    final stabilityFactor = (1 - stability).clamp(0.0, 1.0);
    final extra = (qualityFactor * 6 + stabilityFactor * 4).round();
    return (baseTolerance + extra).clamp(6, 24);
  }

  String _trendLabel(List<_PitchFrame> frames) {
    if (frames.length < 4) return 'stabilizing';
    final firstHalf = frames.take(frames.length ~/ 2).map((f) => f.cents);
    final secondHalf = frames.skip(frames.length ~/ 2).map((f) => f.cents);
    final delta = _mean(secondHalf) - _mean(firstHalf);
    if (delta > 2.5) return 'rising';
    if (delta < -2.5) return 'falling';
    return 'stable';
  }

  String _stabilityLabel(List<_PitchFrame> frames) {
    final score = _stabilityScore(frames);
    if (frames.length < 4) return 'warming up';
    if (score >= 0.82) return 'steady';
    if (score >= 0.58) return 'moderate wobble';
    return 'unstable';
  }

  double _stabilityScore(List<_PitchFrame> frames) {
    if (frames.length < 4) return 0.5;
    final centsValues = frames.map((f) => f.cents).toList();
    final mean = _mean(centsValues);
    final variance =
        centsValues
            .map((value) => pow(value - mean, 2))
            .reduce((a, b) => a + b) /
        centsValues.length;
    final stdDev = sqrt(variance);
    return (1 - (stdDev / 25)).clamp(0.0, 1.0);
  }

  String _signalQualityLabel(double quality) {
    if (quality >= 0.78) return 'high-quality';
    if (quality >= 0.55) return 'usable';
    return 'low-quality';
  }

  double _normalizeRms(double rms) {
    return (rms / 0.07).clamp(0.0, 1.0);
  }

  double _rmsLevel(Uint8List frame) {
    if (frame.length < 2) return 0;
    final data = ByteData.sublistView(frame);
    final sampleCount = frame.length ~/ 2;
    var sumSquares = 0.0;
    for (var i = 0; i < sampleCount; i++) {
      final sample = data.getInt16(i * 2, Endian.little) / 32768.0;
      sumSquares += sample * sample;
    }
    return sqrt(sumSquares / sampleCount);
  }

  String _noteLabel(int midi) {
    final noteIndex = ((midi % 12) + 12) % 12;
    final octave = (midi ~/ 12) - 1;
    return '${_notes[noteIndex]}$octave';
  }

  String _noteLabelWithFrequency(int midi) {
    final hz = _a4Hz * pow(2, (midi - 69) / 12);
    return '${_noteLabel(midi)} (${hz.toStringAsFixed(1)} Hz)';
  }

  List<T> _takeLast<T>(List<T> values, int count) {
    if (values.length <= count) return values;
    return values.sublist(values.length - count);
  }

  double _median(Iterable<double> values) {
    final list = values.toList()..sort();
    if (list.isEmpty) return 0;
    final middle = list.length ~/ 2;
    if (list.length.isOdd) return list[middle];
    return (list[middle - 1] + list[middle]) / 2;
  }

  double _weightedMean(Iterable<double> values, Iterable<double> weights) {
    final v = values.toList();
    final w = weights.toList();
    if (v.isEmpty || w.isEmpty || v.length != w.length) return 0;
    var numerator = 0.0;
    var denominator = 0.0;
    for (var i = 0; i < v.length; i++) {
      final wi = max(0.001, w[i]);
      numerator += v[i] * wi;
      denominator += wi;
    }
    return numerator / denominator;
  }

  double _mean(Iterable<double> values) {
    final list = values.toList();
    if (list.isEmpty) return 0;
    return list.reduce((a, b) => a + b) / list.length;
  }
}

class _PitchFrame {
  const _PitchFrame({
    required this.targetMidi,
    required this.cents,
    required this.frequency,
    required this.confidence,
    required this.signalQuality,
    required this.rms,
  });

  final int targetMidi;
  final double cents;
  final double frequency;
  final double confidence;
  final double signalQuality;
  final double rms;
}

class _AutocorrEstimate {
  const _AutocorrEstimate({
    required this.frequency,
    required this.quality,
    required this.isVoiced,
  });

  final double frequency;
  final double quality;
  final bool isVoiced;
}

class _FusedEstimate {
  const _FusedEstimate({required this.frequency, required this.confidence});

  final double frequency;
  final double confidence;
}

const List<String> _notes = <String>[
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
