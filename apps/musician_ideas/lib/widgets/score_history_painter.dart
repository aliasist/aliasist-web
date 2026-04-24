import 'package:flutter/material.dart';

class ScoreHistoryPainter extends CustomPainter {
  const ScoreHistoryPainter({required this.values, required this.lineColor});

  final List<double> values;
  final Color lineColor;

  @override
  void paint(Canvas canvas, Size size) {
    if (values.length < 2) return;

    final bgPaint = Paint()
      ..color = Colors.black12
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    final midY = size.height / 2;
    canvas.drawLine(Offset(0, midY), Offset(size.width, midY), bgPaint);

    final path = Path();
    for (var i = 0; i < values.length; i++) {
      final x = size.width * (i / (values.length - 1));
      final normalized = (values[i].clamp(0, 100)) / 100;
      final y = size.height * (1 - normalized);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    final linePaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant ScoreHistoryPainter oldDelegate) {
    return oldDelegate.values != values || oldDelegate.lineColor != lineColor;
  }
}
