class MusicalIdea {
  const MusicalIdea({
    required this.id,
    required this.title,
    required this.filePath,
    required this.createdAt,
    this.tags = const [],
    this.inviteCode,
    this.shared = false,
  });

  final String id;
  final String title;
  final String filePath;
  final DateTime createdAt;
  final List<String> tags;
  final String? inviteCode;
  final bool shared;

  MusicalIdea copyWith({
    String? title,
    List<String>? tags,
    String? inviteCode,
    bool? shared,
  }) {
    return MusicalIdea(
      id: id,
      title: title ?? this.title,
      filePath: filePath,
      createdAt: createdAt,
      tags: tags ?? this.tags,
      inviteCode: inviteCode ?? this.inviteCode,
      shared: shared ?? this.shared,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'filePath': filePath,
      'createdAt': createdAt.toIso8601String(),
      'tags': tags,
      'inviteCode': inviteCode,
      'shared': shared,
    };
  }

  factory MusicalIdea.fromJson(Map<String, dynamic> json) {
    return MusicalIdea(
      id: json['id'] as String,
      title: json['title'] as String,
      filePath: json['filePath'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      tags: (json['tags'] as List<dynamic>? ?? const [])
          .map((value) => value.toString())
          .toList(),
      inviteCode: json['inviteCode'] as String?,
      shared: json['shared'] as bool? ?? false,
    );
  }
}
