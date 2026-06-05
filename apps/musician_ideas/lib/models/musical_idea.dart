class MusicalIdea {
  const MusicalIdea({
    required this.id,
    required this.title,
    required this.filePath,
    required this.createdAt,
    this.tags = const [],
    this.inviteCode,
    this.shared = false,
    this.description,
    this.pitchData,
  });

  final String id;
  final String title;
  final String filePath;
  final DateTime createdAt;
  final List<String> tags;
  final String? inviteCode;
  final bool shared;
  final String? description;
  final Map<String, dynamic>? pitchData;

  MusicalIdea copyWith({
    String? title,
    List<String>? tags,
    String? inviteCode,
    bool? shared,
    String? description,
    Map<String, dynamic>? pitchData,
  }) {
    return MusicalIdea(
      id: id,
      title: title ?? this.title,
      filePath: filePath,
      createdAt: createdAt,
      tags: tags ?? this.tags,
      inviteCode: inviteCode ?? this.inviteCode,
      shared: shared ?? this.shared,
      description: description ?? this.description,
      pitchData: pitchData ?? this.pitchData,
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
      'description': description,
      'pitchData': pitchData,
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
      description: json['description'] as String?,
      pitchData: json['pitchData'] as Map<String, dynamic>?,
    );
  }
}
