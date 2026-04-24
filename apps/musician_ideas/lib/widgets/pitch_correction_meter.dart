import 'package:flutter/material.dart';
import 'package:musician_ideas/services/pitch_coach.dart';

/// The horizontal needle meter that visualizes pitch offset in cents,
/// plus direction hints ("Raise pitch a little" / "Lower pitch a little").
class PitchCorrectionMeter extends StatelessWidget {
  const PitchCorrectionMeter({
    super.key,
    required this.reading,
    required this.toleranceCents,
    required this.statusColor,
  });

  final PitchReading reading;
  final int toleranceCents;
  final Color statusColor;

  double _correctionAlignment(double cents) {
    final clamped = cents.clamp(-50.0, 50.0).toDouble();
    return clamped / 50;
  }

  String _pitchCorrectionAction(double cents) {
    if (cents.abs() <= toleranceCents) return 'Great - hold this pitch';
    return cents > 0 ? 'Lower pitch a little' : 'Raise pitch a little';
  }

  IconData _pitchCorrectionIcon(double cents) {
    if (cents.abs() <= toleranceCents) return Icons.check_circle;
    return cents > 0 ? Icons.south : Icons.north;
  }

  @override
  Widget build(BuildContext context) {
    final cents = reading.smoothedCents;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: <Widget>[
          SizedBox(
            height: 40,
            child: Stack(
              children: <Widget>[
                Align(
                  alignment: Alignment.center,
                  child: Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.black12,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.center,
                  child: Container(
                    width: 2,
                    height: 28,
                    color: Colors.green,
                  ),
                ),
                AnimatedAlign(
                  duration: const Duration(milliseconds: 120),
                  curve: Curves.easeOut,
                  alignment: Alignment(_correctionAlignment(cents), 0),
                  child: Container(
                    width: 14,
                    height: 34,
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[Text('Flat'), Text('In key'), Text('Sharp')],
          ),
          const SizedBox(height: 8),
          Row(
            children: <Widget>[
              Icon(_pitchCorrectionIcon(cents), color: statusColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _pitchCorrectionAction(cents),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
