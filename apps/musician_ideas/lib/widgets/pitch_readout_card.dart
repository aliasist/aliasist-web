import 'package:flutter/material.dart';
import 'package:musician_ideas/services/pitch_coach.dart';
import 'package:musician_ideas/widgets/pitch_correction_meter.dart';

class PitchReadoutCard extends StatelessWidget {
  const PitchReadoutCard({
    super.key,
    required this.reading,
    required this.toleranceCents,
  });

  final PitchReading? reading;
  final int toleranceCents;

  Color _statusColor(PitchReading? reading) {
    if (reading == null) return Colors.blueGrey;
    return reading.inTune ? Colors.green : Colors.orange;
  }

  String _pitchDirectionLabel(double cents) {
    if (cents.abs() <= toleranceCents) return 'On key';
    return cents > 0 ? 'Sharp (above key)' : 'Flat (below key)';
  }

  double _pitchMeterPosition(double cents) {
    final clamped = cents.clamp(-50.0, 50.0).toDouble();
    return (clamped + 50) / 100;
  }

  @override
  Widget build(BuildContext context) {
    final r = reading;
    final statusColor = _statusColor(r);

    return Card(
      color: statusColor.withValues(alpha: 0.12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: r == null
            ? const Text('Start analysis and sing/play a sustained note.')
            : _readingBody(r, statusColor),
      ),
    );
  }

  Widget _readingBody(PitchReading r, Color statusColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            r.inTune
                ? 'ON KEY'
                : 'OFF KEY · ${_pitchDirectionLabel(r.smoothedCents)}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: statusColor,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          r.tuningLabel,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        const SizedBox(height: 12),
        const Text(
          'Pitch correction visual',
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        PitchCorrectionMeter(
          reading: r,
          toleranceCents: toleranceCents,
          statusColor: statusColor,
        ),
        const SizedBox(height: 12),
        Text(
          'Pitch meter (smoothed): ${r.smoothedCents.toStringAsFixed(1)} cents',
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: _pitchMeterPosition(r.smoothedCents),
          minHeight: 10,
          borderRadius: BorderRadius.circular(999),
          color: statusColor,
          backgroundColor: Colors.black12,
        ),
        const SizedBox(height: 4),
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[Text('-50c'), Text('0c'), Text('+50c')],
        ),
        const SizedBox(height: 10),
        Text('Detected note: ${r.note}'),
        Text('Target note: ${r.targetNote}'),
        Text('Target: ${r.targetFrequency.toStringAsFixed(2)} Hz'),
        Text('Frequency: ${r.frequency.toStringAsFixed(2)} Hz'),
        Text('Offset: ${r.cents.toStringAsFixed(1)} cents'),
        Text(
          'Smoothed offset: ${r.smoothedCents.toStringAsFixed(1)} cents',
        ),
        Text(
          'Confidence: ${(r.confidence * 100).toStringAsFixed(1)}%',
        ),
        Text(
          'Signal quality: ${(r.signalQuality * 100).toStringAsFixed(1)}%',
        ),
        const SizedBox(height: 8),
        Text('Trend: ${r.trendLabel}'),
        Text('Stability: ${r.stabilityLabel}'),
        Text('Neighbor notes: ${r.neighborNotes.join(' / ')}'),
        const SizedBox(height: 8),
        Text(r.reasoningSummary),
        const SizedBox(height: 8),
        Text(r.guidance),
        const SizedBox(height: 8),
        ...r.recommendations.map(
          (tip) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text('• $tip'),
          ),
        ),
      ],
    );
  }
}
