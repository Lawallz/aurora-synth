import React, { useState, useEffect } from 'react';
import synthEngine from '../audioEngine';

interface ConfigTecla {
  midi: number;
  rotulo: string;
  possuiPreta: boolean;
  midiPreta?: number;
}

export default function VirtualKeyboard() {
  const [teclasAtivas, definirTeclasAtivas] = useState<Set<number>>(new Set());

  const configuracaoTeclas: ConfigTecla[] = [
    { midi: 60, rotulo: 'C3', possuiPreta: true, midiPreta: 61 },
    { midi: 62, rotulo: 'D3', possuiPreta: true, midiPreta: 63 },
    { midi: 64, rotulo: 'E3', possuiPreta: false },
    { midi: 65, rotulo: 'F3', possuiPreta: true, midiPreta: 66 },
    { midi: 67, rotulo: 'G3', possuiPreta: true, midiPreta: 68 },
    { midi: 69, rotulo: 'A3', possuiPreta: true, midiPreta: 70 },
    { midi: 71, rotulo: 'B3', possuiPreta: false },
    { midi: 72, rotulo: 'C4', possuiPreta: true, midiPreta: 73 },
    { midi: 74, rotulo: 'D4', possuiPreta: true, midiPreta: 75 },
    { midi: 76, rotulo: 'E4', possuiPreta: false },
    { midi: 77, rotulo: 'F4', possuiPreta: true, midiPreta: 78 },
    { midi: 79, rotulo: 'G4', possuiPreta: true, midiPreta: 80 },
    { midi: 81, rotulo: 'A4', possuiPreta: true, midiPreta: 82 },
    { midi: 83, rotulo: 'B4', possuiPreta: false },
    { midi: 84, rotulo: 'C5', possuiPreta: false }
  ];

  useEffect(() => {
    const mapaTeclas: { [key: string]: number } = {
       'a': 60,
       'w': 61,
       's': 62,
       'e': 63,
       'd': 64,
       'f': 65,
       't': 66,
       'g': 67,
       'y': 68,
       'h': 69,
       'u': 70,
       'j': 71,
       'k': 72,
       'o': 73,
       'l': 74,
       'p': 75,
       'ç': 76,
       ';': 77
    };

    const lidarDigitacaoBaixo = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const tecla = e.key.toLowerCase();
      if (mapaTeclas[tecla]) {
        const midi = mapaTeclas[tecla];
        lidarInicioNota(midi);
      }
    };

    const lidarDigitacaoCima = (e: KeyboardEvent) => {
      const tecla = e.key.toLowerCase();
      if (mapaTeclas[tecla]) {
        const midi = mapaTeclas[tecla];
        lidarFimNota(midi);
      }
    };

    window.addEventListener('keydown', lidarDigitacaoBaixo);
    window.addEventListener('keyup', lidarDigitacaoCima);

    return () => {
      window.removeEventListener('keydown', lidarDigitacaoBaixo);
      window.removeEventListener('keyup', lidarDigitacaoCima);
    };
  }, []);

  const lidarInicioNota = (midi: number) => {
    synthEngine.ativarNota(midi);
    definirTeclasAtivas((prev) => {
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
  };

  const lidarFimNota = (midi: number) => {
    synthEngine.desativarNota(midi);
    definirTeclasAtivas((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  };

  const lidarEntradaMouse = (midi: number, e: React.MouseEvent) => {
    if (e.buttons === 1) {
      lidarInicioNota(midi);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full z-[100] h-32 bg-[#0e0e0e] border-t border-black flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <div className="h-6 flex items-center justify-between px-6 bg-[#201f1f] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border-b border-black">
        <span className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-widest select-none">
          TECLADO VIRTUAL - OITAVA C3-C5 (Clique ou use as teclas A,S,D,F... no seu PC)
        </span>
        <div className="flex items-center gap-4 select-none">
          <span className="font-mono text-[9px] text-[#00f2ff] font-semibold tracking-wider uppercase animate-pulse">
            MIDI IN: ATIVO
          </span>
          <span className="font-mono text-[9px] text-[#79ff5b] font-semibold tracking-wider uppercase">
            VELOCIDADE: 110 (FX DINÂMICO)
          </span>
        </div>
      </div>

      <div className="flex-1 flex px-2 pb-2 pt-1 gap-[1.5px] relative">
        {configuracaoTeclas.map((tecla) => {
          const estaBrancaAtiva = teclasAtivas.has(tecla.midi);
          const estaPretaAtiva = tecla.midiPreta ? teclasAtivas.has(tecla.midiPreta) : false;

          return (
            <div 
              key={tecla.midi}
              className={`flex-1 relative h-full rounded-b-md transition-all duration-100 border-l border-r border-[#0e0e0e] border-b-2 border-b-black/80 cursor-pointer select-none active:translate-y-0.5 ${
                estaBrancaAtiva 
                  ? 'bg-[#00f2ff] border-[#00f2ff] shadow-[inset_0_-8px_16px_rgba(0,0,0,0.2),_0_0_12px_#00f2ff]' 
                  : 'bg-[#e5e2e1] hover:bg-neutral-200'
              }`}
              onMouseDown={() => lidarInicioNota(tecla.midi)}
              onMouseUp={() => lidarFimNota(tecla.midi)}
              onMouseLeave={() => lidarFimNota(tecla.midi)}
              onMouseEnter={(e) => lidarEntradaMouse(tecla.midi, e)}
            >
              {tecla.possuiPreta && tecla.midiPreta && (
                <div
                  className={`absolute right-0 top-0 w-6 h-[58%] rounded-b z-20 transition-all duration-100 border border-black cursor-pointer shadow-[2px_2px_4px_rgba(0,0,0,0.6)] ${
                    estaPretaAtiva
                      ? 'bg-[#79ff5b] border-[#79ff5b] translate-y-px shadow-[0_0_8px_#79ff5b]'
                      : 'bg-[#131313] hover:bg-neutral-800'
                  }`}
                  style={{ marginRight: '-12px' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    lidarInicioNota(tecla.midiPreta!);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    lidarFimNota(tecla.midiPreta!);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    lidarFimNota(tecla.midiPreta!);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (e.buttons === 1) lidarInicioNota(tecla.midiPreta!);
                  }}
                ></div>
              )}

              <span className="absolute bottom-1.5 left-0 right-0 text-center text-[7px] font-mono font-bold tracking-tighter text-black/50 select-none uppercase pointer-events-none">
                {tecla.rotulo}
              </span>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
