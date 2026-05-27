import React, { useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { AjustesEfeitos } from '../types';
import synthEngine from '../audioEngine';

interface FXRackProps {
  ajustesEfeitos: AjustesEfeitos;
  atualizarEfeitos: (novosEfeitos: Partial<AjustesEfeitos>) => void;
  aoSalvar: () => void;
}

export default function FXRack({ ajustesEfeitos, atualizarEfeitos, aoSalvar }: FXRackProps) {
  const refCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    synthEngine.atualizarEfeitos(ajustesEfeitos);
  }, [ajustesEfeitos]);

  useEffect(() => {
    let idQuadroAnimacao: number;
    let fase = 0;

    const canvas = refCanvas.current;
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    const dimensionarCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 800;
      canvas.height = 120;
    };

    dimensionarCanvas();
    window.addEventListener('resize', dimensionarCanvas);

    const desenhar = () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      const analisador = synthEngine.obterAnalisador();

      contexto.strokeStyle = '#181818';
      contexto.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 15) {
        contexto.beginPath();
        contexto.moveTo(x, 0);
        contexto.lineTo(x, canvas.height);
        contexto.stroke();
      }

      contexto.beginPath();
      contexto.strokeStyle = '#00f2ff';
      contexto.lineWidth = 1.5;
      
      contexto.shadowColor = '#00f2ff';
      contexto.shadowBlur = 6;

      const meioY = canvas.height / 2;

      if (analisador) {
        const comprimentoBuffer = analisador.frequencyBinCount;
        const vetorDados = new Uint8Array(comprimentoBuffer);
        analisador.getByteTimeDomainData(vetorDados);

        contexto.moveTo(0, meioY);
        const larguraFatia = canvas.width / comprimentoBuffer;
        let x = 0;

        for (let i = 0; i < comprimentoBuffer; i++) {
          const valorNormalizado = vetorDados[i] / 128.0;
          const y = valorNormalizado * meioY;

          if (i === 0) {
            contexto.moveTo(x, y);
          } else {
            contexto.lineTo(x, y);
          }
          x += larguraFatia;
        }
      } else {
        contexto.moveTo(0, meioY);
        for (let x = 0; x < canvas.width; x++) {
          const pesoDelay = ajustesEfeitos.delay.ativo ? Math.sin(fase * 0.2) * 5 : 0;
          const pesoReverb = ajustesEfeitos.reverb.ativo ? Math.cos(fase * 0.1) * 8 : 0;
          const y = meioY + 
            Math.sin(x * 0.05 + fase) * (12 + pesoDelay) + 
            Math.cos(x * 0.02 + fase * 0.5) * (6 + pesoReverb);
          contexto.lineTo(x, y);
        }
      }

      contexto.stroke();
      contexto.shadowBlur = 0;
      fase += 0.08;
      idQuadroAnimacao = requestAnimationFrame(desenhar);
    };

    desenhar();

    return () => {
      cancelAnimationFrame(idQuadroAnimacao);
      window.removeEventListener('resize', dimensionarCanvas);
    };
  }, [ajustesEfeitos]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs text-[#b9cacb] font-medium tracking-widest uppercase">
          CADEIA DE SINAL
        </h2>
        <span className="font-mono text-[9px] text-[#b9cacb]/50">
          4 MÓDULOS DE PROCESSAMENTO ATIVOS
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <section className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded-lg p-4 flex gap-4 items-center group transition-all duration-75 relative">
          <div className="text-[#b9cacb]/30 group-hover:text-[#00f2ff] transition-colors cursor-grab">
            <GripVertical size={16} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-xs text-[#e1fdff] font-bold tracking-wider uppercase">DELAY</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ajustesEfeitos.delay.ativo}
                  onChange={(e) => atualizarEfeitos({ 
                    delay: { ...ajustesEfeitos.delay, ativo: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#353534] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#b9cacb] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00f2ff]/20 peer-checked:after:bg-[#00f2ff]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">TEMPO</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="50" 
                  max="1000" 
                  value={ajustesEfeitos.delay.tempo}
                  onChange={(e) => atualizarEfeitos({
                    delay: { ...ajustesEfeitos.delay, tempo: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.delay.tempo}ms
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">RETRO</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="95" 
                  value={ajustesEfeitos.delay.retroalimentacao}
                  onChange={(e) => atualizarEfeitos({
                    delay: { ...ajustesEfeitos.delay, retroalimentacao: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.delay.retroalimentacao}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">MISTURA</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="100" 
                  value={ajustesEfeitos.delay.mistura}
                  onChange={(e) => atualizarEfeitos({
                    delay: { ...ajustesEfeitos.delay, mistura: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.delay.mistura}%
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded-lg p-4 flex gap-4 items-center group transition-all duration-75 relative">
          <div className="text-[#b9cacb]/30 group-hover:text-[#00f2ff] transition-colors cursor-grab">
            <GripVertical size={16} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-xs text-[#e1fdff] font-bold tracking-wider uppercase">REVERB</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ajustesEfeitos.reverb.ativo}
                  onChange={(e) => atualizarEfeitos({ 
                    reverb: { ...ajustesEfeitos.reverb, ativo: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#353534] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#b9cacb] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00f2ff]/20 peer-checked:after:bg-[#00f2ff]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">TAMANHO</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={ajustesEfeitos.reverb.tamanho}
                  onChange={(e) => atualizarEfeitos({
                    reverb: { ...ajustesEfeitos.reverb, tamanho: parseFloat(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.reverb.tamanho.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">DECAIMENTO</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0.5" 
                  max="8.0" 
                  step="0.1"
                  value={ajustesEfeitos.reverb.decaimento}
                  onChange={(e) => atualizarEfeitos({
                    reverb: { ...ajustesEfeitos.reverb, decaimento: parseFloat(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.reverb.decaimento.toFixed(1)}s
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">MISTURA</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="100" 
                  value={ajustesEfeitos.reverb.mistura}
                  onChange={(e) => atualizarEfeitos({
                    reverb: { ...ajustesEfeitos.reverb, mistura: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.reverb.mistura}%
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded-lg p-4 flex gap-4 items-center group transition-all duration-75 relative">
          <div className="text-[#b9cacb]/30 group-hover:text-[#00f2ff] transition-colors cursor-grab">
            <GripVertical size={16} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-xs text-[#e1fdff] font-bold tracking-wider uppercase">CHORUS</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ajustesEfeitos.chorus.ativo}
                  onChange={(e) => atualizarEfeitos({ 
                    chorus: { ...ajustesEfeitos.chorus, ativo: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#353534] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#b9cacb] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00f2ff]/20 peer-checked:after:bg-[#00f2ff]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">TAXA</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0.1" 
                  max="5.0" 
                  step="0.1"
                  value={ajustesEfeitos.chorus.taxa}
                  onChange={(e) => atualizarEfeitos({
                    chorus: { ...ajustesEfeitos.chorus, taxa: parseFloat(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.chorus.taxa.toFixed(1)}Hz
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">PROFUNDID</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="100" 
                  value={ajustesEfeitos.chorus.profundidade}
                  onChange={(e) => atualizarEfeitos({
                    chorus: { ...ajustesEfeitos.chorus, profundidade: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.chorus.profundidade}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">MISTURA</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="0" 
                  max="100" 
                  value={ajustesEfeitos.chorus.mistura}
                  onChange={(e) => atualizarEfeitos({
                    chorus: { ...ajustesEfeitos.chorus, mistura: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.chorus.mistura}%
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded-lg p-4 flex gap-4 items-center group transition-all duration-75 relative">
          <div className="text-[#b9cacb]/30 group-hover:text-[#00f2ff] transition-colors cursor-grab">
            <GripVertical size={16} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-mono text-xs text-[#e1fdff] font-bold tracking-wider uppercase">EQUALIZADOR</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ajustesEfeitos.equalizador.ativo}
                  onChange={(e) => atualizarEfeitos({ 
                    equalizador: { ...ajustesEfeitos.equalizador, ativo: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#353534] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#b9cacb] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00f2ff]/20 peer-checked:after:bg-[#00f2ff]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">GRAVES</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="-12" 
                  max="12" 
                  value={ajustesEfeitos.equalizador.graves}
                  onChange={(e) => atualizarEfeitos({
                    equalizador: { ...ajustesEfeitos.equalizador, graves: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.equalizador.graves >= 0 ? '+' : ''}{ajustesEfeitos.equalizador.graves}dB
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">MÉDIOS</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="-12" 
                  max="12" 
                  value={ajustesEfeitos.equalizador.medios}
                  onChange={(e) => atualizarEfeitos({
                    equalizador: { ...ajustesEfeitos.equalizador, medios: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.equalizador.medios >= 0 ? '+' : ''}{ajustesEfeitos.equalizador.medios}dB
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-12 font-mono text-[9px] text-[#b9cacb]/60 uppercase tracking-wider">AGUDOS</span>
                <input 
                  type="range" 
                  className="flex-1 accent-[#00f2ff] cursor-pointer" 
                  min="-12" 
                  max="12" 
                  value={ajustesEfeitos.equalizador.agudos}
                  onChange={(e) => atualizarEfeitos({
                    equalizador: { ...ajustesEfeitos.equalizador, agudos: parseInt(e.target.value) }
                  })}
                />
                <span className="w-12 text-right font-mono text-[10px] text-[#00f2ff] font-semibold">
                  {ajustesEfeitos.equalizador.agudos >= 0 ? '+' : ''}{ajustesEfeitos.equalizador.agudos}dB
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 bg-black rounded-lg border border-[#353534] overflow-hidden relative h-32">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', 
            backgroundSize: '10px 10px' 
          }}
        ></div>
        
        <canvas ref={refCanvas} className="w-full h-full" />
        
        <div className="absolute bottom-2 right-3 font-mono text-[8px] text-[#b9cacb]/50 tracking-wider">
          ESPECTRO DE SAÍDA MASTER
        </div>
      </div>
    </div>
  );
}
