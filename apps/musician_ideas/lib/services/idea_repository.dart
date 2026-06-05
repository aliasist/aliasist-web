import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:musician_ideas/models/musical_idea.dart';
import 'package:shared_preferences/shared_preferences.dart';

class IdeaRepository {
  static const _ideasKey = 'musician_ideas.catalog';
  // Deployed backend URL (update if re-deployed)
  static const _backendUrl = 'https://musician-ideas-backend.bchooper0730.workers.dev';

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

  // --- Cloud sharing (MVP) ---
  Future<String?> shareIdea(MusicalIdea idea, {String? audioBase64}) async {
    try {
      final resp = await http.post(
        Uri.parse('$_backendUrl/api/ideas/share'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': idea.id,
          'userId': 'local-user',
          'title': idea.title,
          'description': idea.description,
          'audioBase64': audioBase64,
          'pitchData': idea.pitchData,
          'inviteCode': idea.inviteCode,
        }),
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        return data['inviteCode'] as String?;
      }
    } catch (e) {
      print('Share failed: $e');
    }
    return null;
  }

  Future<MusicalIdea?> fetchSharedIdea(String inviteCode) async {
    try {
      final resp = await http.get(Uri.parse('$_backendUrl/api/shared/$inviteCode'));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        return MusicalIdea.fromJson({
          'id': data['id'],
          'title': data['title'],
          'description': data['description'],
          'createdAt': DateTime.fromMillisecondsSinceEpoch(data['created_at'] as int).toIso8601String(),
          'shared': true,
          'inviteCode': data['invite_code'],
          'pitchData': data['pitch_data'] != null ? jsonDecode(data['pitch_data'] as String) : null,
        });
      }
    } catch (e) {
      print('Fetch shared failed: $e');
    }
    return null;
  }
}
