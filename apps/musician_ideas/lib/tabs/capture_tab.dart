import 'package:flutter/material.dart';

class CaptureTab extends StatelessWidget {
  const CaptureTab({
    super.key,
    required this.titleController,
    required this.isRecording,
    required this.onToggleRecording,
    required this.onImport,
  });

  final TextEditingController titleController;
  final bool isRecording;
  final VoidCallback onToggleRecording;
  final VoidCallback onImport;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        const Text(
          'Capture new idea',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: titleController,
          decoration: const InputDecoration(
            labelText: 'Idea title (optional)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: onToggleRecording,
          icon: Icon(isRecording ? Icons.stop : Icons.fiber_manual_record),
          label: Text(isRecording ? 'Stop and Save' : 'Start Recording'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: onImport,
          icon: const Icon(Icons.upload_file),
          label: const Text('Upload Existing Audio'),
        ),
        const SizedBox(height: 24),
        const Text(
          'Private by default. Share any idea later using an invite code '
          'from the Catalog tab.',
        ),
      ],
    );
  }
}
