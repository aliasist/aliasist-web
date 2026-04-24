import 'dart:math';

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

String noteLabelFromMidi(int midi) {
  final noteIndex = ((midi % 12) + 12) % 12;
  final octave = (midi ~/ 12) - 1;
  return '${_notes[noteIndex]}$octave';
}

int midiFromFrequency(double frequencyHz, double a4Hz) {
  return (69 + (12 * (log(frequencyHz / a4Hz) / ln2))).round();
}
