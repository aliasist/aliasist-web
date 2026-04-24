import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:share_plus/share_plus.dart';
import 'package:uuid/uuid.dart';

import 'package:musician_ideas/controllers/pitch_session_controller.dart';
import 'package:musician_ideas/models/musical_idea.dart';
import 'package:musician_ideas/services/idea_repository.dart';
import 'package:musician_ideas/services/pitch_coach.dart';
import 'package:musician_ideas/tabs/capture_tab.dart';
import 'package:musician_ideas/tabs/catalog_tab.dart';
import 'package:musician_ideas/tabs/pitch_tab.dart';
import 'package:musician_ideas/theme/cosmic_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.enableStartupEffects = true});

  final bool enableStartupEffects;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final IdeaRepository _repository = IdeaRepository();
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();
  final Uuid _uuid = const Uuid();
  final PitchCoach _pitchCoach = PitchCoach();
  final PitchSessionController _session = PitchSessionController();

  List<MusicalIdea> _ideas = <MusicalIdea>[];
  int _tabIndex = 0;
  bool _isLoading = true;
  bool _isRecording = false;
  String? _playingIdeaId;
  PitchReading? _pitchReading;
  double _a4Reference = 440;
  int _toleranceCents = 10;
  int? _targetMidi;
  double? _referencePointHz;

  @override
  void initState() {
    super.initState();
    _applyPitchSettings(updateTargetMidi: true);
    if (widget.enableStartupEffects) {
      _loadIdeas();
      _audioPlayer.onPlayerComplete.listen((_) {
        if (!mounted) return;
        setState(() => _playingIdeaId = null);
      });
      _pitchCoach.readings.listen((reading) {
        if (!mounted) return;
        setState(() {
          _pitchReading = reading;
          _session.record(reading);
        });
      });
    } else {
      _isLoading = false;
    }
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _recorder.dispose();
    _pitchCoach.dispose();
    _titleController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadIdeas() async {
    final ideas = await _repository.loadIdeas();
    if (!mounted) return;
    setState(() {
      _ideas = ideas;
      _isLoading = false;
    });
  }

  Future<void> _saveIdeas() async {
    await _repository.saveIdeas(_ideas);
  }

  Future<void> _startRecording() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      _showMessage('Microphone permission is required to record.');
      return;
    }

    final hasRecordPermission = await _recorder.hasPermission();
    if (!hasRecordPermission) {
      _showMessage('Recording permission is not available.');
      return;
    }

    final filePath = await _nextIdeaPath(extension: 'm4a');
    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
      ),
      path: filePath,
    );
    if (!mounted) return;
    setState(() => _isRecording = true);
  }

  Future<void> _stopRecording() async {
    final outputPath = await _recorder.stop();
    if (!mounted) return;
    setState(() => _isRecording = false);

    if (outputPath == null || outputPath.isEmpty) {
      _showMessage('No recording was saved.');
      return;
    }

    final title = _titleController.text.trim().isEmpty
        ? 'Idea ${_ideas.length + 1}'
        : _titleController.text.trim();
    _titleController.clear();

    setState(() {
      _ideas = <MusicalIdea>[
        MusicalIdea(
          id: _uuid.v4(),
          title: title,
          filePath: outputPath,
          createdAt: DateTime.now(),
        ),
        ..._ideas,
      ];
    });
    await _saveIdeas();
    _showMessage('Idea captured.');
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      await _stopRecording();
    } else {
      await _startRecording();
    }
  }

  Future<void> _importAudio() async {
    final picked = await FilePicker.pickFiles(
      type: FileType.audio,
      allowMultiple: false,
    );
    final sourcePath = picked?.files.single.path;
    if (sourcePath == null || sourcePath.isEmpty) return;

    final extension = _fileExtension(sourcePath);
    final destination = await _nextIdeaPath(extension: extension);
    await File(sourcePath).copy(destination);

    final sourceName = _baseNameWithoutExtension(sourcePath);
    setState(() {
      _ideas = <MusicalIdea>[
        MusicalIdea(
          id: _uuid.v4(),
          title: sourceName,
          filePath: destination,
          createdAt: DateTime.now(),
        ),
        ..._ideas,
      ];
    });
    await _saveIdeas();
    _showMessage('Audio imported.');
  }

  Future<void> _playIdea(MusicalIdea idea) async {
    if (_playingIdeaId == idea.id) {
      await _audioPlayer.stop();
      if (!mounted) return;
      setState(() => _playingIdeaId = null);
      return;
    }

    await _audioPlayer.stop();
    await _audioPlayer.play(DeviceFileSource(idea.filePath));
    if (!mounted) return;
    setState(() => _playingIdeaId = idea.id);
  }

  Future<void> _shareIdea(MusicalIdea idea) async {
    final inviteCode =
        idea.inviteCode ?? _uuid.v4().split('-').first.toUpperCase();
    final updated = idea.copyWith(shared: true, inviteCode: inviteCode);

    setState(() {
      _ideas = _ideas
          .map((item) => item.id == idea.id ? updated : item)
          .toList();
    });
    await _saveIdeas();

    await SharePlus.instance.share(
      ShareParams(
        text:
            'I shared a musical idea with you.\n'
            'Invite code: $inviteCode\n'
            'Open Musician Ideas and enter this code to collaborate.',
      ),
    );
  }

  Future<void> _togglePitchCoach() async {
    if (_pitchCoach.isRunning) {
      await _pitchCoach.stop();
      if (!mounted) return;
      setState(() => _pitchReading = null);
      return;
    }

    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      _showMessage('Microphone permission is required for pitch analysis.');
      return;
    }

    setState(_session.reset);
    await _pitchCoach.start();
    if (!mounted) return;
    setState(() {});
  }

  void _applyPitchSettings({bool updateTargetMidi = false}) {
    _pitchCoach.configure(
      a4Hz: _a4Reference,
      toleranceCents: _toleranceCents,
      targetMidi: _targetMidi,
      referenceHz: _referencePointHz,
      clearReference: _referencePointHz == null,
      updateTargetMidi: updateTargetMidi,
    );
  }

  void _captureReferencePoint() {
    final reading = _pitchReading;
    if (reading == null) {
      _showMessage('Start analysis first, then capture a stable note.');
      return;
    }

    setState(() => _referencePointHz = reading.frequency);
    _applyPitchSettings(updateTargetMidi: true);
    _showMessage(
      'Reference set to ${_referencePointHz!.toStringAsFixed(2)} Hz.',
    );
  }

  void _clearReferencePoint() {
    if (_referencePointHz == null) return;
    setState(() => _referencePointHz = null);
    _applyPitchSettings(updateTargetMidi: true);
    _showMessage('Reference point cleared.');
  }

  Future<String> _nextIdeaPath({required String extension}) async {
    final docs = await getApplicationDocumentsDirectory();
    final folder = Directory('${docs.path}/ideas');
    if (!folder.existsSync()) {
      folder.createSync(recursive: true);
    }

    final safeExt = extension.isEmpty ? 'm4a' : extension;
    return '${folder.path}/${DateTime.now().millisecondsSinceEpoch}.$safeExt';
  }

  String _fileExtension(String path) {
    final last = path.split(Platform.pathSeparator).last;
    final dotIndex = last.lastIndexOf('.');
    if (dotIndex < 0 || dotIndex == last.length - 1) {
      return 'm4a';
    }
    return last.substring(dotIndex + 1);
  }

  String _baseNameWithoutExtension(String path) {
    final file = path.split(Platform.pathSeparator).last;
    final dotIndex = file.lastIndexOf('.');
    if (dotIndex < 0) return file;
    return file.substring(0, dotIndex);
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Aliasist Musician',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            Text(
              'UFO Pitch Lab',
              style: theme.textTheme.bodySmall?.copyWith(
                color: neonCyan.withValues(alpha: 0.9),
                letterSpacing: 0.6,
              ),
            ),
          ],
        ),
        actions: const <Widget>[
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: Icon(Icons.auto_awesome),
          ),
        ],
      ),
      body: CosmicBackdrop(
        child: IndexedStack(
          index: _tabIndex,
          children: <Widget>[
            CatalogTab(
              isLoading: _isLoading,
              ideas: _ideas,
              searchController: _searchController,
              playingIdeaId: _playingIdeaId,
              onSearchChanged: () => setState(() {}),
              onPlay: _playIdea,
              onShare: _shareIdea,
            ),
            CaptureTab(
              titleController: _titleController,
              isRecording: _isRecording,
              onToggleRecording: _toggleRecording,
              onImport: _importAudio,
            ),
            PitchTab(
              running: _pitchCoach.isRunning,
              reading: _pitchReading,
              targetMidi: _targetMidi,
              a4Reference: _a4Reference,
              toleranceCents: _toleranceCents,
              referencePointHz: _referencePointHz,
              session: _session,
              onToggle: _togglePitchCoach,
              onTargetChanged: (value) {
                setState(() => _targetMidi = value);
                _applyPitchSettings(updateTargetMidi: true);
              },
              onA4Changed: (value) {
                setState(() => _a4Reference = value);
                _applyPitchSettings();
              },
              onToleranceChanged: (value) {
                setState(() => _toleranceCents = value);
                _applyPitchSettings();
              },
              onCaptureReference: _captureReferencePoint,
              onClearReference: _clearReferencePoint,
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) {
          setState(() => _tabIndex = index);
        },
        destinations: const <NavigationDestination>[
          NavigationDestination(
            icon: Icon(Icons.library_music_outlined),
            selectedIcon: Icon(Icons.library_music),
            label: 'Vault',
          ),
          NavigationDestination(
            icon: Icon(Icons.mic_none),
            selectedIcon: Icon(Icons.mic),
            label: 'Capture',
          ),
          NavigationDestination(
            icon: Icon(Icons.radar_outlined),
            selectedIcon: Icon(Icons.radar),
            label: 'Pitch',
          ),
        ],
      ),
    );
  }
}
