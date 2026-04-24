import 'package:flutter/material.dart';

const Color spaceBlack = Color(0xFF060712);
const Color spaceNavy = Color(0xFF12162B);
const Color neonCyan = Color(0xFF22E3FF);
const Color neonViolet = Color(0xFF936CFF);
const Color ufoGreen = Color(0xFF68F7A1);
const Color surfaceDeep = Color(0xFF151A33);
const Color surfaceField = Color(0xFF0E1227);
const Color surfaceBar = Color(0xFF0D1022);
const Color textPrimary = Color(0xFFEAF7FF);

ThemeData buildCosmicTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary: neonCyan,
      secondary: neonViolet,
      tertiary: ufoGreen,
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
    ),
    cardTheme: CardThemeData(
      color: surfaceDeep.withValues(alpha: 0.82),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: neonCyan.withValues(alpha: 0.16)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surfaceBar.withValues(alpha: 0.95),
      indicatorColor: neonCyan.withValues(alpha: 0.24),
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceField.withValues(alpha: 0.85),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: neonCyan.withValues(alpha: 0.25)),
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
          colors: <Color>[spaceBlack, spaceNavy],
        ),
      ),
      child: Stack(
        children: <Widget>[
          Positioned(
            top: -90,
            left: -40,
            child: _Orb(color: neonViolet.withValues(alpha: 0.22), size: 230),
          ),
          Positioned(
            right: -70,
            top: 80,
            child: _Orb(color: neonCyan.withValues(alpha: 0.2), size: 210),
          ),
          Positioned(
            bottom: -90,
            left: 100,
            child: _Orb(color: ufoGreen.withValues(alpha: 0.16), size: 200),
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
            BoxShadow(color: color, blurRadius: 85, spreadRadius: 8),
          ],
        ),
      ),
    );
  }
}
