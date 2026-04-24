import 'package:flutter/material.dart';
import 'package:musician_ideas/screens/home_screen.dart';
import 'package:musician_ideas/theme/cosmic_theme.dart';

class MusicianIdeasApp extends StatelessWidget {
  const MusicianIdeasApp({super.key, this.enableStartupEffects = true});

  final bool enableStartupEffects;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Musician Ideas',
      debugShowCheckedModeBanner: false,
      theme: buildCosmicTheme(),
      home: HomeScreen(enableStartupEffects: enableStartupEffects),
    );
  }
}
