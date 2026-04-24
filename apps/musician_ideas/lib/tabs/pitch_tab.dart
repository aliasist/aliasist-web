import 'package:flutter/material.dart';
import 'package:musician_ideas/controllers/pitch_session_controller.dart';
import 'package:musician_ideas/services/pitch_coach.dart';
import 'package:musician_ideas/widgets/pitch_readout_card.dart';
import 'package:musician_ideas/widgets/pitch_settings_card.dart';
import 'package:musician_ideas/widgets/session_progress_card.dart';

class PitchTab extends StatelessWidget {
  const PitchTab({
    super.key,
    required this.running,
    required this.reading,
    required this.targetMidi,
    required this.a4Reference,
    required this.toleranceCents,
    required this.referencePointHz,
    required this.session,
    required this.onToggle,
    required this.onTargetChanged,
    required this.onA4Changed,
    required this.onToleranceChanged,
    required this.onCaptureReference,
    required this.onClearReference,
  });

  final bool running;
  final PitchReading? reading;
  final int? targetMidi;
  final double a4Reference;
  final int toleranceCents;
  final double? referencePointHz;
  final PitchSessionController session;
  final VoidCallback onToggle;
  final ValueChanged<int?> onTargetChanged;
  final ValueChanged<double> onA4Changed;
  final ValueChanged<int> onToleranceChanged;
  final VoidCallback onCaptureReference;
  final VoidCallback onClearReference;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        const Text(
          'Real-time Pitch Coach',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: onToggle,
          icon: Icon(running ? Icons.stop : Icons.play_arrow),
          label: Text(running ? 'Stop Analysis' : 'Start Analysis'),
        ),
        const SizedBox(height: 12),
        PitchSettingsCard(
          targetMidi: targetMidi,
          a4Reference: a4Reference,
          toleranceCents: toleranceCents,
          referencePointHz: referencePointHz,
          latestReading: reading,
          onTargetChanged: onTargetChanged,
          onA4Changed: onA4Changed,
          onToleranceChanged: onToleranceChanged,
          onCaptureReference: onCaptureReference,
          onClearReference: onClearReference,
        ),
        const SizedBox(height: 12),
        PitchReadoutCard(reading: reading, toleranceCents: toleranceCents),
        const SizedBox(height: 12),
        SessionProgressCard(session: session),
      ],
    );
  }
}
