import 'dart:convert';

import 'package:musician_ideas/models/musical_idea.dart';
import 'package:shared_preferences/shared_preferences.dart';

class IdeaRepository {
  static const _ideasKey = 'musician_ideas.catalog';

  Future<List<MusicalIdea>> loadIdeas() async {
    final prefs = await SharedPreferences.getInstance();
    final payload = prefs.getString(_ideasKey);
    if (payload == null || payload.isEmpty) {
      return [];
    }

    final decoded = jsonDecode(payload) as List<dynamic>;
    return decoded
        .whereType<Map<String, dynamic>>()
        .map(MusicalIdea.fromJson)
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<void> saveIdeas(List<MusicalIdea> ideas) async {
    final prefs = await SharedPreferences.getInstance();
    final payload = jsonEncode(ideas.map((idea) => idea.toJson()).toList());
    await prefs.setString(_ideasKey, payload);
  }
}
