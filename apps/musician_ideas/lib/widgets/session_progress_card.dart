import 'package:flutter/material.dart';
import 'package:musician_ideas/controllers/pitch_session_controller.dart';
import 'package:musician_ideas/widgets/score_history_painter.dart';

class SessionProgressCard extends StatelessWidget {
  const SessionProgressCard({super.key, required this.session});

  final PitchSessionController session;

  @override
  Widget build(BuildContext context) {
    final history = session.scoreHistory;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'Session progress',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(
              'Avg score: ${session.averageScore().toStringAsFixed(1)} • '
              'On-key rate: ${(session.onKeyRate() * 100).toStringAsFixed(1)}%',
            ),
            Text(
              'Best in-key streak: ${session.bestInTuneStreak} • '
              'Trend: ${session.trendLabel()}',
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 92,
              child: history.isEmpty
                  ? const Center(
                      child: Text('Start analysis to build session history.'),
                    )
                  : CustomPaint(
                      painter: ScoreHistoryPainter(
                        values: history,
                        lineColor: Theme.of(context).colorScheme.primary,
                      ),
                      child: const SizedBox.expand(),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
