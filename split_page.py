import os

def split_file(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    file_mapping = {
        'src/lib/constants.js': [
            'COLORS', 'PIE_COLORS', 'STRINGS', 'PRAISE_WORDS', 'randomPraise', 
            'AVATARS', 'CATEGORIES', 'SINGLE_LEVEL_CATEGORIES', 'SHAPES_LIST', 
            'CUSTOM_SHAPE_COLORS', 'ShapeGlyph', 'COLORS_LIST', 'OBJECT_EMOJI', 
            'OBJECT_COLOR_GROUPS', 'OBJECT_NAMES', 'COLOR_KEY_LABEL', 'MKA_TINT_COLORS', 
            'objectColorPhrase', 'ACHIEVEMENTS'
        ],
        'src/lib/audio.js': [
            'audioCtx', 'getCtx', 'beep', 'pianoNote', 'SFX', 'TWINKLE_MELODY', 'loopPattern',
            'cachedVoices', 'voiceEngineUnlocked', 'refreshVoices', 'unlockVoiceEngine', 'speak',
            'estimateSpeechMs', 'narrateQuestion'
        ],
        'src/lib/storage.js': [
            'LS_STUDENTS', 'LS_SETTINGS', 'LS_SESSION', 'storage'
        ],
        'src/lib/utils.js': [
            'randInt', 'shuffle', 'uniqueChoices', 'numRangeForDifficulty', 'subtractionRanges',
            'additionRanges', 'NUMBER_WORDS', 'NUMBER_WORDS_EXT', 'wordFor', 'numberSpeech',
            'doublesWord', 'splitBalancedRows'
        ],
        'src/lib/generators.js': [
            'generateQuestionPool', 'makeQuestion', 'instructionFor', 'learnNumberRange',
            'numbersLearnLevelRange', 'generateNumbersLearnSteps', 'generateCountingLearnSteps',
            'generateAdditionLearnSteps', 'generateSubtractionLearnSteps', 'generateColorsLearnSteps',
            'generateShapesLearnSteps', 'generateMemoriseSteps', 'generateLearnSteps', 
            'LEARN_HAS_LEVELS', 'buildMatchItems', 'buildShapeMatchItems', 'buildColorMatchItems',
            'buildObjectColorMatchItems', 'buildObjectWordColorMatchItems'
        ],
        'src/components/ui/SharedUI.js': [
            'BigButton', 'Mascot', 'BrandLogo', 'ScreenShell', 'BackgroundDecor', 'TopBar', 
            'CircularTimer', 'Confetti', 'BalancedObjectRows'
        ],
        'src/components/screens/MenuScreens.js': [
            'MainMenu', 'ProfilesScreen', 'CategoriesScreen', 'ModeChoiceScreen', 'DifficultyScreen'
        ],
        'src/components/screens/SetupScreens.js': [
            'NumbersLevelScreen', 'NumbersTableScreen', 'TimerScreen'
        ],
        'src/components/screens/MetaScreens.js': [
            'LeaderboardScreen', 'DashboardScreen', 'StatCard', 'ChartCard', 'SettingsScreen', 'SettingRow'
        ],
        'src/components/game/GameScreen.js': [
            'GameScreen', 'FeedbackPanel'
        ],
        'src/components/game/Questions.js': [
            'QuestionRenderer', 'QuestionPrompt', 'MultipleChoiceQ', 'FillBlankQ', 'MatchingQ', 
            'DragDropQ', 'CountingTapQ', 'NumbersQ', 'SubtractionVisualQ', 'AdditionVisualQ'
        ],
        'src/components/learn/LearnScreen.js': [
            'LearnScreen'
        ],
        'src/components/learn/LearnSteps.js': [
            'LearnNumberIntro', 'LearnNumberObjectsIntro', 'LearnCountIntro', 'LearnAdditionIntro',
            'LearnSubtractionIntro', 'LearnSwatchIntro', 'LearnDoublesIntro'
        ]
    }
    
    extracted_files = {k: [] for k in file_mapping.keys()}
    extracted_files['src/app/page.js'] = []
    
    current_file = 'src/app/page.js'
    brace_level = 0
    in_block = False
    
    def get_target_file(line):
        for k, v in file_mapping.items():
            for name in v:
                if line.startswith(f"function {name}(") or \
                   line.startswith(f"const {name} =") or \
                   line.startswith(f"let {name} =") or \
                   line.startswith(f"var {name} ="):
                    return k
        return None
        
    for line in lines:
        if not in_block:
            target = get_target_file(line)
            if target:
                current_file = target
                in_block = True
                brace_level = 0
        
        extracted_files[current_file].append(line)
        
        if in_block:
            # simple brace counter (ignoring comments/strings for this simple script, assuming well formatted)
            # count { and } in the line
            import re
            # remove strings and comments to count accurately
            clean_line = re.sub(r'//.*', '', line)
            clean_line = re.sub(r'".*?"', '""', clean_line)
            clean_line = re.sub(r"'.*?'", "''", clean_line)
            clean_line = re.sub(r"`.*?`", "``", clean_line)
            
            brace_level += clean_line.count('{') - clean_line.count('}')
            
            if brace_level == 0 and ('{' in clean_line or clean_line.strip().endswith(';') or clean_line.strip().endswith('}')):
                if clean_line.count('{') > 0 and clean_line.count('{') == clean_line.count('}'):
                    in_block = False
                    current_file = 'src/app/page.js'
                elif '{' not in clean_line:
                    in_block = False
                    current_file = 'src/app/page.js'
                elif brace_level == 0 and clean_line.strip().endswith('}'):
                    in_block = False
                    current_file = 'src/app/page.js'
                    
    for file_path, content in extracted_files.items():
        if file_path == 'src/app/page.js':
            continue # We will write to page_root.js to test
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path + '.new', 'w', encoding='utf-8') as f:
            f.write("".join(content))
            
    with open('src/app/page.js.new', 'w', encoding='utf-8') as f:
        f.write("".join(extracted_files['src/app/page.js']))

if __name__ == "__main__":
    split_file("src/app/page.js")
