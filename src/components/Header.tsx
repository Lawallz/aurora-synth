import React, { useEffect, useRef } from 'react';
import { Save, Heart, Settings, Sliders, FolderOpen, CreditCard } from 'lucide-react';
import { TipoVisualizacao, PredefinicaoSintetizador } from '../types';
import synthEngine from '../audioEngine';

interface HeaderProps {
  visualizacaoAtiva: TipoVisualizacao;
  definirVisualizacao: (visualizacao: TipoVisualizacao) => void;
  predefinicaoAtiva: PredefinicaoSintetizador;
  aoSalvarPredefinicao: () => void;
  alternarFavoritado: () => void;
  estaAtivado: boolean;
}

export default function Header({
  visualizacaoAtiva,
  definirVisualizacao,
  predefinicaoAtiva,
  aoSalvarPredefinicao,
  alternarFavoritado,
  estaAtivado
}: HeaderProps) {
  const refCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let idQuadroAnimacao: number;
    let fase = 0;

    const canvas = refCanvas.current;
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    const dimensionarCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 300;
      canvas.height = canvas.parentElement?.offsetHeight || 32;
    };

    dimensionarCanvas();
    window.addEventListener('resize', dimensionarCanvas);

    const desenhar = () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      const analisador = synthEngine.obterAnalisador();

      contexto.beginPath();
      contexto.strokeStyle = '#79ff5b';
      contexto.lineWidth = 1.2;

      const meioY = canvas.height / 2;

      if (analisador) {
        const vetorDados = new Uint8Array(analisador.frequencyBinCount);
        analisador.getByteTimeDomainData(vetorDados);

        contexto.moveTo(0, meioY);
        const larguraFatia = canvas.width / vetorDados.length;
        let x = 0;

        for (let i = 0; i < vetorDados.length; i++) {
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
          const y = meioY + Math.sin(x * 0.04 + fase) * 4 + Math.sin(x * 0.015 + fase * 0.5) * 2;
          contexto.lineTo(x, y);
        }
      }

      contexto.stroke();
      fase += 0.08;
      idQuadroAnimacao = requestAnimationFrame(desenhar);
    };

    desenhar();

    return () => {
      cancelAnimationFrame(idQuadroAnimacao);
      window.removeEventListener('resize', dimensionarCanvas);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full h-14 flex justify-between items-center px-6 bg-[#131313] border-b border-[#353534] z-[100]">
      <div className="flex items-center gap-4">
        <h1 
          className="font-sans font-extrabold text-2xl text-[#e1fdff] tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
          onClick={() => definirVisualizacao('EDITOR')}
        >
          AURORA
        </h1>
        <div className="h-6 w-px bg-[#353534] mx-2"></div>
        
        <div className="bg-black border border-[#222222] px-4 py-1.5 rounded flex items-center gap-4 min-w-[260px] shadow-[inset_0_0_8px_rgba(0,219,231,0.1)]">
          <span className="font-mono text-[9px] text-[#b9cacb]/60 tracking-wider">PRESET</span>
          <span className="font-mono text-xs text-[#e1fdff] font-semibold tracking-wide uppercase truncate max-w-[120px]">
            {predefinicaoAtiva.nome}
          </span>
          <div className="flex gap-2 ml-auto shrink-0">
            <button 
              onClick={aoSalvarPredefinicao}
              className="text-[#b9cacb] hover:text-[#00f2ff] transition-colors cursor-pointer"
              title="Salvar Preset"
            >
              <Save size={14} />
            </button>
            <button 
              onClick={alternarFavoritado}
              className={`transition-colors cursor-pointer ${
                predefinicaoAtiva.favoritado ? 'text-[#79ff5b]' : 'text-[#b9cacb] hover:text-[#79ff5b]'
              }`}
              title="Alternar Favorito"
            >
              <Heart size={14} fill={predefinicaoAtiva.favoritado ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        <div className="h-8 w-full bg-[#0e0e0e] rounded overflow-hidden relative border border-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.9)]">
          <canvas ref={refCanvas} className="w-full h-full opacity-85" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => definirVisualizacao('NAVEGADOR')}
          className={`p-2 rounded hover:bg-[#201f1f] transition-all cursor-pointer ${
            visualizacaoAtiva === 'NAVEGADOR' ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
          }`}
          title="Navegador de Presets"
        >
          <FolderOpen size={18} />
        </button>

        <button
          onClick={() => definirVisualizacao('EDITOR')}
          className={`p-2 rounded hover:bg-[#201f1f] transition-all cursor-pointer ${
            visualizacaoAtiva === 'EDITOR' ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
          }`}
          title="Editor do Sintetizador"
        >
          <Sliders size={18} />
        </button>

        <button
          onClick={() => definirVisualizacao('EFEITOS')}
          className={`p-2 rounded hover:bg-[#201f1f] transition-all cursor-pointer ${
            visualizacaoAtiva === 'EFEITOS' ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
          }`}
          title="Efeitos"
        >
          <Sliders size={18} className="rotate-90" />
        </button>

        <button
          onClick={() => definirVisualizacao('CONFIGURACOES')}
          className={`p-2 rounded hover:bg-[#201f1f] transition-all cursor-pointer ${
            visualizacaoAtiva === 'CONFIGURACOES' ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
          }`}
          title="Configurações Globais"
        >
          <Settings size={18} />
        </button>

        <button
          onClick={() => definirVisualizacao('CADASTRO')}
          className={`p-2 rounded hover:bg-[#201f1f] transition-all relative cursor-pointer ${
            visualizacaoAtiva === 'CADASTRO' ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
          }`}
          title="Cadastro e Faturamento"
        >
          <CreditCard size={18} />
          {!estaAtivado && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>
      </div>
    </header>
  );
}
