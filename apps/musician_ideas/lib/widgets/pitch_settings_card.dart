import 'package:flutter/material.dart';
import 'package:musician_ideas/services/pitch_coach.dart';
import 'package:musician_ideas/utils/note_utils.dart';

class PitchSettingsCard extends StatelessWidget {
  const PitchSettingsCard({
    super.key,
    required this.targetMidi,
    required this.a4Reference,
    required this.toleranceCents,
    required this.referencePointHz,
    required this.latestReading,
    required this.onTargetChanged,
    required this.onA4Changed,
    required this.onToleranceChanged,
    required this.onCaptureReference,
    required this.onClearReference,
  });

  final int? targetMidi;
  final double a4Reference;
  final int toleranceCents;
  final double? referencePointHz;
  final PitchReading? latestReading;
  final ValueChanged<int?> onTargetChanged;
  final ValueChanged<double> onA4Changed;
  final ValueChanged<int> onToleranceChanged;
  final VoidCallback onCaptureReference;
  final VoidCallback onClearReference;

  List<DropdownMenuItem<int?>> _targetNoteItems() {
    final items = <DropdownMenuItem<int?>>[
      const DropdownMenuItem<int?>(
        value: null,
        child: Text('Auto (nearest note)'),
      ),
    ];
    for (var midi = 48; midi <= 83; midi++) {
      items.add(
        DropdownMenuItem<int?>(
          value: midi,
          child: Text(noteLabelFromMidi(midi)),
        ),
      );
    }
    return items;
  }

  String _referencePointLabel() {
    final hz = referencePointHz;
    if (hz == null) return 'Reference point: Not set';
    final midi = midiFromFrequency(hz, a4Reference);
    return 'Reference point: ${hz.toStringAsFixed(2)} Hz '
        '(${noteLabelFromMidi(midi)})';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'Pitch intelligence settings',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<int?>(
              initialValue: targetMidi,
              decoration: const InputDecoration(
                labelText: 'Target note',
                border: OutlineInputBorder(),
              ),
              items: _targetNoteItems(),
              onChanged: onTargetChanged,
            ),
            const SizedBox(height: 12),
            Text('A4 calibration: ${a4Reference.toStringAsFixed(1)} Hz'),
            Slider(
              value: a4Reference,
              min: 432,
              max: 446,
              divisions: 28,
              label: a4Reference.toStringAsFixed(1),
              onChanged: onA4Changed,
            ),
            const SizedBox(height: 8),
            Text('In-tune tolerance: ±$toleranceCents cents'),
            Slider(
              value: toleranceCents.toDouble(),
              min: 5,
              max: 25,
              divisions: 20,
              label: '±$toleranceCents',
              onChanged: (value) => onToleranceChanged(value.round()),
            ),
            const SizedBox(height: 8),
            Text(_referencePointLabel()),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                OutlinedButton.icon(
                  onPressed:
                      latestReading == null ? null : onCaptureReference,
                  icon: const Icon(Icons.my_location),
                  label: const Text('Use current pitch as reference'),
                ),
                OutlinedButton.icon(
                  onPressed:
                      referencePointHz == null ? null : onClearReference,
                  icon: const Icon(Icons.clear),
                  label: const Text('Clear reference'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
