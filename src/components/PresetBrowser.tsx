import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Star, Filter, SortAsc } from 'lucide-react';
import { PredefinicaoSintetizador } from '../types';
import synthEngine from '../audioEngine';

interface PresetBrowserProps {
  presets: PredefinicaoSintetizador[];
  predefinicaoAtiva: PredefinicaoSintetizador;
  aoSelecionarPredefinicao: (predefinicao: PredefinicaoSintetizador) => void;
  alternarEstrela: (idPreset: string) => void;
  categoriaAtiva: string;
  consultaPesquisa: string;
}

export default function PresetBrowser({
  presets,
  predefinicaoAtiva,
  aoSelecionarPredefinicao,
  alternarEstrela,
  categoriaAtiva,
  consultaPesquisa
}: PresetBrowserProps) {
  const refVisualizador = useRef<HTMLCanvasElement | null>(null);
  const [idTocando, definirIdTocando] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      synthEngine.desligarTodasNotas();
    };
  }, []);

  useEffect(() => {
    let idQuadroAnimacao: number;
    let tempo = 0;

    const canvas = refVisualizador.current;
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    const dimensionar = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 300;
      canvas.height = 48;
    };

    dimensionar();
    window.addEventListener('resize', dimensionar);

    const animar = () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      contexto.beginPath();
      contexto.strokeStyle = '#00dbe7';
      contexto.lineWidth = 1.2;
      contexto.shadowBlur = 3;
      contexto.shadowColor = '#00dbe7';

      const analisador = synthEngine.obterAnalisador();

      if (analisador && idTocando) {
        const comprimentoBuffer = analisador.frequencyBinCount;
        const vetorDados = new Uint8Array(comprimentoBuffer);
        analisador.getByteTimeDomainData(vetorDados);

        const meio = canvas.height / 2;
        contexto.moveTo(0, meio);
        const larguraFatia = canvas.width / comprimentoBuffer;
        let x = 0;

        for (let i = 0; i < comprimentoBuffer; i++) {
          const valorNormalizado = vetorDados[i] / 128.0;
          const y = valorNormalizado * meio;
          if (i === 0) contexto.moveTo(x, y);
          else contexto.lineTo(x, y);
          x += larguraFatia;
        }
      } else {
        const meioY = canvas.height / 2;
        for (let x = 0; x < canvas.width; x++) {
          const y = meioY + 
            Math.sin(x * 0.05 + tempo) * 12 * Math.sin(tempo * 0.4) +
            Math.sin(x * 0.1 - tempo * 0.8) * 4;
          if (x === 0) contexto.moveTo(x, y);
          else contexto.lineTo(x, y);
        }
      }

      contexto.stroke();
      contexto.shadowBlur = 0;
      tempo += 0.08;
      idQuadroAnimacao = requestAnimationFrame(animar);
    };

    animar();

    return () => {
      cancelAnimationFrame(idQuadroAnimacao);
      window.removeEventListener('resize', dimensionar);
    };
  }, [idTocando]);

  const lidarTocarPrevia = (predefinicao: PredefinicaoSintetizador, e: React.MouseEvent) => {
    e.stopPropagation();

    if (idTocando === predefinicao.id) {
      synthEngine.desligarTodasNotas();
      definirIdTocando(null);
    } else {
      synthEngine.atualizarParametrosPredefinicao(predefinicao);
      synthEngine.desligarTodasNotas();
      
      synthEngine.ativarNota(60);
      synthEngine.ativarNota(64);
      synthEngine.ativarNota(67);
      
      definirIdTocando(predefinicao.id);

      setTimeout(() => {
        definirIdTocando((atual) => {
          if (atual === predefinicao.id) {
            synthEngine.desligarTodasNotas();
            return null;
          }
          return atual;
        });
      }, 3500);
    }
  };

  const presetsFiltrados = presets.filter((p) => {
    const atendeCategoria = categoriaAtiva === '' || p.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
    const atendePesquisa = p.nome.toLowerCase().includes(consultaPesquisa.toLowerCase()) || 
                           p.tipo.toLowerCase().includes(consultaPesquisa.toLowerCase());
    return atendeCategoria && atendePesquisa;
  });

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-mono text-xs text-[#00f2ff] font-semibold tracking-wider">
            BIBLIOTECA DE PRESETS
          </h2>
          <p className="text-[10px] font-mono text-[#b9cacb]/40 uppercase tracking-widest mt-0.5">
            {categoriaAtiva || 'Todas as Categorias'} / {presetsFiltrados.length} PRESETS ENCONTRADOS
          </p>
        </div>

        <div className="flex gap-2.5">
          <button className="bg-[#2a2a2a] p-2 rounded hover:bg-[#353534] transition-colors cursor-pointer border border-black text-[#b9cacb]">
            <Filter size={14} />
          </button>
          <button className="bg-[#2a2a2a] p-2 rounded hover:bg-[#353534] transition-colors cursor-pointer border border-black text-[#b9cacb]">
            <SortAsc size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1.5 custom-scroll">
        {presetsFiltrados.map((preset) => {
          const estaAtivo = predefinicaoAtiva.id === preset.id;
          const estaTocando = idTocando === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => aoSelecionarPredefinicao(preset)}
              className={`border p-4 rounded-lg flex items-center justify-between group transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                estaAtivo
                  ? 'bg-[#1c1b1b] border-[#00f2ff] shadow-[0_0_12px_rgba(0,219,231,0.2)]'
                  : 'bg-[#1c1b1b] border-[#2a2a2a] hover:border-[#b9cacb]/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => lidarTocarPrevia(preset, e)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    estaTocando
                      ? 'bg-[#00f2ff] text-[#002022] border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.4)]'
                      : 'border-[#2a2a2a] text-[#b9cacb] group-hover:text-[#00dbe7] group-hover:border-[#00f2ff]'
                  }`}
                >
                  {estaTocando ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <div>
                  <p className={`text-xs font-semibold tracking-wide ${estaAtivo ? 'text-[#00f2ff]' : 'text-white'}`}>
                    {preset.nome}
                  </p>
                  <p className="font-mono text-[9px] text-[#b9cacb]/50 group-hover:text-[#b9cacb]/80 uppercase tracking-widest mt-0.5">
                    {preset.tipo} • {preset.categoria}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:block w-32 h-6 bg-black/40 border border-[#222] rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#00f2ff]/10 w-3/4"></div>
                  <div className="flex justify-around items-center h-full px-2 opacity-50">
                    <div className="w-[2px] h-2.5 bg-[#00f2ff]"></div>
                    <div className="w-[2px] h-3.5 bg-[#00f2ff]"></div>
                    <div className="w-[2px] h-1.5 bg-[#00f2ff]"></div>
                    <div className="w-[2px] h-3 bg-[#00f2ff]"></div>
                    <div className="w-[2px] h-2 bg-[#00f2ff]"></div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alternarEstrela(preset.id);
                  }}
                  className={`transition-colors cursor-pointer ${
                    preset.favoritado ? 'text-[#79ff5b]' : 'text-[#b9cacb]/50 hover:text-[#79ff5b]'
                  }`}
                >
                  <Star size={16} fill={preset.favoritado ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          );
        })}

        {presetsFiltrados.length === 0 && (
          <div className="text-center py-10 border border-[#2a2a2a] bg-[#1c1b1b]/30 rounded-lg">
            <p className="text-xs text-[#b9cacb]/60">Nenhum preset atende os filtros selecionados.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-[#1c1b1b] border-t border-[#353534] p-4 -mx-4 -mb-4">
        <div className="bg-[#201f1f] p-3 border border-[#2a2a2a] rounded flex flex-col items-center">
          <span className="text-[8px] font-mono text-[#b9cacb]/50 uppercase tracking-wider mb-2">CORTE</span>
          <div className="w-12 h-12 rounded-full border-4 border-[#3a494b] relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-[#353534] shadow-md relative">
              <div 
                className="w-0.5 h-3 bg-[#00f2ff] absolute top-0.5 left-1/2 -translate-x-1/2 origin-bottom transition-transform"
                style={{ transform: `rotate(${((predefinicaoAtiva.frequenciaCorte - 60) / 12000 * 280) - 140}deg)` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-[#201f1f] p-3 border border-[#2a2a2a] rounded flex flex-col items-center">
          <span className="text-[8px] font-mono text-[#b9cacb]/50 uppercase tracking-wider mb-2 font-sans font-medium">RESSONÂNCIA</span>
          <div className="w-12 h-12 rounded-full border-4 border-[#3a494b] relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-[#353534] shadow-md relative">
              <div 
                className="w-0.5 h-3 bg-[#79ff5b] absolute top-0.5 left-1/2 -translate-x-1/2 origin-bottom transition-transform"
                style={{ transform: `rotate(${(predefinicaoAtiva.ressonancia / 10 * 280) - 140}deg)` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-black rounded p-3 border border-[#353534] relative overflow-hidden min-h-[60px]">
          <span className="absolute top-1 left-2 text-[7px] font-mono text-[#00f2ff]/60 uppercase tracking-widest z-10">
            ANALISADOR DE ONDA
          </span>
          <canvas ref={refVisualizador} className="w-full h-full opacity-85" />
        </div>
      </div>
    </div>
  );
}
