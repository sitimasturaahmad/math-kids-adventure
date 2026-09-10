const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('src/app/page.js', 'utf-8');
const lines = code.split('\n');
const decls = JSON.parse(fs.readFileSync('ast_decls.json', 'utf-8'));

// Map of components/functions to their new file
const fileMapping = {
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
    'src/components/screens/MenuCore.js': [
        'MainMenu', 'ProfilesScreen', 'CategoriesScreen'
    ],
    'src/components/screens/MenuModes.js': [
        'ModeChoiceScreen', 'DifficultyScreen'
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
    'src/components/game/QuestionCore.js': [
        'QuestionRenderer', 'QuestionPrompt', 'MultipleChoiceQ', 'FillBlankQ', 'MatchingQ'
    ],
    'src/components/game/QuestionVisualCore.js': [
        'DragDropQ', 'CountingTapQ', 'NumbersQ'
    ],
    'src/components/game/QuestionVisualMath.js': [
        'SubtractionVisualQ', 'AdditionVisualQ'
    ],
    'src/components/learn/LearnScreen.js': [
        'LearnScreen'
    ],
    'src/components/learn/LearnStepsBasic.js': [
        'LearnNumberIntro', 'LearnNumberObjectsIntro', 'LearnCountIntro', 'LearnAdditionIntro'
    ],
    'src/components/learn/LearnStepsAdvanced.js': [
        'LearnSubtractionIntro', 'LearnSwatchIntro', 'LearnDoublesIntro'
    ],
    'src/app/page.js': [
        'MathKidsAdventure' // Keep the main orchestrator in page.js
    ]
};

// Build a reverse map
const entityToFile = {};
for (const [file, entities] of Object.entries(fileMapping)) {
    for (const entity of entities) {
        entityToFile[entity] = file;
    }
}

// 1. Group nodes by file
const fileContents = {};
for (const f of Object.keys(fileMapping)) fileContents[f] = [];

// Track covered lines
const coveredLines = new Set();

for (const decl of decls) {
    const targetFile = entityToFile[decl.name];
    if (targetFile) {
        // Also capture preceding comments. We look backwards until we hit another declaration or non-empty line
        let startLine = decl.start - 1; // 0-indexed
        
        while (startLine > 0) {
            const prev = startLine - 1;
            if (coveredLines.has(prev)) break;
            const text = lines[prev].trim();
            if (text === '' || text.startsWith('//') || text.startsWith('/*') || text.startsWith('*')) {
                startLine = prev;
            } else {
                break;
            }
        }
        
        const endLine = decl.end - 1;
        const block = lines.slice(startLine, endLine + 1);
        
        for (let i = startLine; i <= endLine; i++) coveredLines.add(i);
        
        // Mark export for functions and consts if they are moved
        if (targetFile !== 'src/app/page.js') {
            if (block[block.length - (decl.end - decl.start) - 1].startsWith('function ')) {
                block[block.length - (decl.end - decl.start) - 1] = block[block.length - (decl.end - decl.start) - 1].replace('function ', 'export function ');
            } else if (block[block.length - (decl.end - decl.start) - 1].startsWith('const ')) {
                block[block.length - (decl.end - decl.start) - 1] = block[block.length - (decl.end - decl.start) - 1].replace('const ', 'export const ');
            } else if (block[block.length - (decl.end - decl.start) - 1].startsWith('let ')) {
                block[block.length - (decl.end - decl.start) - 1] = block[block.length - (decl.end - decl.start) - 1].replace('let ', 'export let ');
            }
        }
        
        fileContents[targetFile].push(block.join('\n'));
    }
}

// Global symbols mapping to their paths (for import generation)
const allSymbols = {};
for (const [file, entities] of Object.entries(fileMapping)) {
    // For imports, use relative or alias paths. The app uses `@/lib/` or `@/components/` based on standard Next.js setup.
    // Let's use `@/...` to be safe, assuming `jsconfig.json` is configured. If not, relative paths.
    const importPath = file.replace('src/', '@/').replace('.js', '');
    for (const entity of entities) {
        allSymbols[entity] = importPath;
    }
}

const thirdPartyImports = {
    'react': ['React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo'],
    'lucide-react': [
        'Play', 'Users', 'BarChart3', 'Trophy', 'SettingsIcon:Settings', 'Volume2', 'VolumeX', 'Music', 'Star', 'Check', 'X', 'Sparkles', 'Gift', 'Crown', 'Sun', 'Moon', 'ArrowLeft', 'Plus', 'Pencil', 'Trash2', 'Clock', 'Award', 'Home', 'RotateCcw', 'Hash', 'Minus', 'Apple', 'Square', 'Palette', 'Medal', 'PartyPopper', 'TimerIcon:Timer', 'BookOpen', 'ChevronLeft', 'ChevronRight', 'ArrowRight'
    ],
    'recharts': [
        'BarChart', 'Bar', 'PieChart', 'Pie', 'Cell', 'LineChart', 'Line', 'XAxis', 'YAxis', 'Tooltip', 'ResponsiveContainer', 'CartesianGrid'
    ]
};

function generateImports(content, currentFile) {
    let imports = '';
    
    // Check third party
    for (const [pkg, symbols] of Object.entries(thirdPartyImports)) {
        const used = [];
        let hasDefault = false;
        
        for (const sym of symbols) {
            const matchName = sym.includes(':') ? sym.split(':')[0] : sym;
            const importName = sym.includes(':') ? `${sym.split(':')[1]} as ${sym.split(':')[0]}` : sym;
            
            if (new RegExp(`\\b${matchName}\\b`).test(content)) {
                if (matchName === 'React') hasDefault = true;
                else used.push(importName);
            }
        }
        
        if (hasDefault && used.length > 0) imports += `import React, { ${used.join(', ')} } from "${pkg}";\n`;
        else if (hasDefault) imports += `import React from "${pkg}";\n`;
        else if (used.length > 0) imports += `import { ${used.join(', ')} } from "${pkg}";\n`;
    }
    
    // Check internal
    const usedByFile = {};
    for (const [sym, pth] of Object.entries(allSymbols)) {
        if (pth !== currentFile.replace('src/', '@/').replace('.js', '')) {
            if (new RegExp(`\\b${sym}\\b`).test(content)) {
                if (!usedByFile[pth]) usedByFile[pth] = [];
                usedByFile[pth].push(sym);
            }
        }
    }
    
    for (const [pth, symbols] of Object.entries(usedByFile)) {
        imports += `import { ${symbols.join(', ')} } from "${pth}";\n`;
    }
    
    return imports + '\n';
}

// Write the files out
for (const [file, blocks] of Object.entries(fileContents)) {
    const rawContent = blocks.join('\n\n');
    let finalContent = generateImports(rawContent, file) + rawContent;
    
    if (file === 'src/app/page.js') {
        // Special case for page.js, add the Next.js directive
        finalContent = '"use client";\n\n' + finalContent;
    }
    
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, finalContent);
}

console.log("Extraction complete!");
