import 'package:flutter/material.dart';

const Color deepPurple = Color(0xFF1C1833);
const Color midPurple = Color(0xFF2A2642);
const Color softViolet = Color(0xFF9B8FCF);
const Color lavender = Color(0xFFD4C4F0);
const Color lightLavender = Color(0xFFEDE7F6);
const Color accentPurple = Color(0xFF7E57C2);
const Color surfaceDeep = Color(0xFF221E3A);
const Color surfaceField = Color(0xFF1A1625);
const Color surfaceBar = Color(0xFF2A2642);
const Color textPrimary = Color(0xFFF3E5F5);
const Color textMuted = Color(0xFFB39DDB);

ThemeData buildCosmicTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary: softViolet,
      secondary: lavender,
      tertiary: accentPurple,
      surface: surfaceDeep,
      onSurface: textPrimary,
    ),
  );

  return base.copyWith(
    scaffoldBackgroundColor: Colors.transparent,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      foregroundColor: textPrimary,
      centerTitle: false,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      color: midPurple.withValues(alpha: 0.9),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: softViolet.withValues(alpha: 0.2)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surfaceBar.withValues(alpha: 0.98),
      indicatorColor: softViolet.withValues(alpha: 0.25),
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceField.withValues(alpha: 0.9),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: softViolet.withValues(alpha: 0.3)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: softViolet, width: 2),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: accentPurple,
        foregroundColor: textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      ),
    ),
  );
}

class CosmicBackdrop extends StatelessWidget {
  const CosmicBackdrop({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[deepPurple, midPurple],
        ),
      ),
      child: Stack(
        children: <Widget>[
          Positioned(
            top: -100,
            left: -60,
            child: _Orb(color: softViolet.withValues(alpha: 0.18), size: 260),
          ),
          Positioned(
            right: -80,
            top: 60,
            child: _Orb(color: lavender.withValues(alpha: 0.15), size: 220),
          ),
          Positioned(
            bottom: -70,
            left: 80,
            child: _Orb(color: accentPurple.withValues(alpha: 0.12), size: 180),
          ),
          child,
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
          boxShadow: <BoxShadow>[
            BoxShadow(color: color, blurRadius: 90, spreadRadius: 10),
          ],
        ),
      ),
    );
  }
}
