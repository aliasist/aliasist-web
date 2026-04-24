import 'package:flutter/material.dart';
import 'package:musician_ideas/models/musical_idea.dart';

class CatalogTab extends StatelessWidget {
  const CatalogTab({
    super.key,
    required this.isLoading,
    required this.ideas,
    required this.searchController,
    required this.playingIdeaId,
    required this.onSearchChanged,
    required this.onPlay,
    required this.onShare,
  });

  final bool isLoading;
  final List<MusicalIdea> ideas;
  final TextEditingController searchController;
  final String? playingIdeaId;
  final VoidCallback onSearchChanged;
  final void Function(MusicalIdea idea) onPlay;
  final void Function(MusicalIdea idea) onShare;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final query = searchController.text.trim().toLowerCase();
    final filtered = ideas.where((idea) {
      if (query.isEmpty) return true;
      final titleMatch = idea.title.toLowerCase().contains(query);
      final tagMatch = idea.tags.any(
        (tag) => tag.toLowerCase().contains(query),
      );
      return titleMatch || tagMatch;
    }).toList();

    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: searchController,
            onChanged: (_) => onSearchChanged(),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search ideas by title or tag',
              border: OutlineInputBorder(),
            ),
          ),
        ),
        Expanded(
          child: filtered.isEmpty
              ? const Center(
                  child: Text(
                    'No ideas yet. Capture or upload one from the Capture tab.',
                  ),
                )
              : ListView.builder(
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final idea = filtered[index];
                    final isPlaying = playingIdeaId == idea.id;
                    return Card(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: ListTile(
                        title: Text(idea.title),
                        subtitle: Text(
                          'Created ${idea.createdAt.toLocal()}'
                          '${idea.shared && idea.inviteCode != null ? '\nInvite: ${idea.inviteCode}' : ''}',
                        ),
                        isThreeLine: idea.shared,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            IconButton(
                              tooltip: isPlaying ? 'Stop' : 'Play',
                              onPressed: () => onPlay(idea),
                              icon: Icon(
                                isPlaying ? Icons.stop : Icons.play_arrow,
                              ),
                            ),
                            IconButton(
                              tooltip: 'Share invite',
                              onPressed: () => onShare(idea),
                              icon: const Icon(Icons.share),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
