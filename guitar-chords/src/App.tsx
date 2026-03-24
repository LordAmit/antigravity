
import { useState, useMemo } from 'react';
import { getUniqueChords, parseSong, transposeSongText } from './utils/chordUtils';
import SongEditor from './components/SongEditor';
import ChordDiagram from './components/ChordDiagram';
import { Music, Minus, Plus } from 'lucide-react';

const DEFAULT_SONG = `[Verse 1]
A           E
Tomar jonno nilche tara
F#m        D
Ektu khani alo
A          E         F#m   D
Bhorer rong rate mise kalo
A            E
Kath golaper shada maya
F#m          D
Mishiye diye vabi
A         E          F#m   D
Abcha nil tomar lage bhalo`;

function App() {
  const [songText, setSongText] = useState(DEFAULT_SONG);

  // Parse current text to extract chords for the gallery
  const parsedLines = useMemo(() => parseSong(songText), [songText]);
  const uniqueChords = useMemo(() => getUniqueChords(parsedLines, 0), [parsedLines]);

  // Handle transposition directly on text
  const handleTranspose = (steps: number) => {
    const newText = transposeSongText(songText, steps);
    setSongText(newText);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-lg shadow-cyan-500/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Chord Master
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => handleTranspose(-1)}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
                title="Transpose Down"
              >
                <Minus size={18} />
              </button>
              <div className="px-4 text-center font-mono font-bold text-cyan-400 text-xs uppercase tracking-wider">
                Transpose
              </div>
              <button
                onClick={() => handleTranspose(1)}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
                title="Transpose Up"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">

          {/* Chord Gallery - Wrapping, no scroll */}
          {uniqueChords.length > 0 && (
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-xl">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Chords in Song</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {uniqueChords.map(chord => (
                  <div
                    key={chord}
                    className="cursor-default hover:scale-105 transition-transform"
                    style={{ width: '160px', height: '170px' }}
                  >
                    <ChordDiagram chord={chord} scale={0.7} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor - Main View */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-xl flex flex-col min-h-[60vh]">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Song Editor</h2>
            <SongEditor value={songText} onChange={setSongText} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
