import React, { useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { PredefinicaoSintetizador } from '../types';
import synthEngine from '../audioEngine';

interface SynthEditorProps {
  predefinicaoAtiva: PredefinicaoSintetizador;
  atualizarPredefinicao: (novaPredefinicao: Partial<PredefinicaoSintetizador>) => void;
}

export default function SynthEditor({ predefinicaoAtiva, atualizarPredefinicao }: SynthEditorProps) {
  const refEspectro = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    synthEngine.atualizarParametrosPredefinicao(predefinicaoAtiva);
  }, [predefinicaoAtiva]);

  useEffect(() => {
    let idQuadroAnimacao: number;
    const canvas = refEspectro.current;
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    const dimensionarCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 800;
      canvas.height = 96;
    };

    dimensionarCanvas();
    window.addEventListener('resize', dimensionarCanvas);

    let fase = 0;

    const desenhar = () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      const analisador = synthEngine.obterAnalisador();

      contexto.strokeStyle = 'rgba(53,53,52,0.15)';
      contexto.lineWidth = 1;
      const espacamentoGrade = 20;
      for (let x = 0; x < canvas.width; x += espacamentoGrade) {
        contexto.beginPath();
        contexto.moveTo(x, 0);
        contexto.lineTo(x, canvas.height);
        contexto.stroke();
      }
      for (let y = 0; y < canvas.height; y += espacamentoGrade) {
        contexto.beginPath();
        contexto.moveTo(0, y);
        contexto.lineTo(canvas.width, y);
        contexto.stroke();
      }

      if (analisador) {
        const comprimentoBuffer = analisador.frequencyBinCount;
        const vetorDados = new Uint8Array(comprimentoBuffer);
        analisador.getByteFrequencyData(vetorDados);

        const larguraBarra = (canvas.width / comprimentoBuffer) * 1.5;
        let alturaBarra;
        let x = 0;

        for (let i = 0; i < comprimentoBuffer; i++) {
          alturaBarra = vetorDados[i] / 2.2;

          if (alturaBarra > 0) {
            const gradiente = contexto.createLinearGradient(0, canvas.height, 0, canvas.height - alturaBarra);
            gradiente.addColorStop(0, 'rgba(0, 219, 231, 0.1)');
            gradiente.addColorStop(0.5, 'rgba(0, 219, 231, 0.4)');
            gradiente.addColorStop(1, '#00dbe7');

            contexto.fillStyle = gradiente;
            contexto.shadowColor = '#00dbe7';
            contexto.shadowBlur = i % 10 === 0 ? 4 : 0;
            contexto.fillRect(x, canvas.height - alturaBarra, larguraBarra - 1, alturaBarra);
          }
          x += larguraBarra;
        }
      } else {
        const quantidadeBarras = 60;
        const larguraBarra = canvas.width / quantidadeBarras;

        for (let i = 0; i < quantidadeBarras; i++) {
          const indiceOscilador = i * 0.15 + fase;
          const ruido = Math.sin(indiceOscilador) * Math.sin(indiceOscilador * 0.5) * 20 + Math.cos(indiceOscilador * 2) * 5;
          const multiplicadorBase = Math.sin(i / quantidadeBarras * Math.PI);
          const h = Math.abs(ruido * multiplicadorBase * 1.5);

          const marcaAtiva = i % 8 === 0;
          contexto.fillStyle = marcaAtiva ? '#00dbe7' : 'rgba(0, 219, 231, 0.2)';
          contexto.shadowColor = '#00dbe7';
          contexto.shadowBlur = marcaAtiva ? 3 : 0;
          contexto.fillRect(i * larguraBarra, canvas.height - h, larguraBarra - 1, h);
        }
      }

      contexto.shadowBlur = 0;
      fase += 0.05;
      idQuadroAnimacao = requestAnimationFrame(desenhar);
    };

    desenhar();

    return () => {
      cancelAnimationFrame(idQuadroAnimacao);
      window.removeEventListener('resize', dimensionarCanvas);
    };
  }, []);

  const calcularCaminhoEnvelope = () => {
    const valorA = predefinicaoAtiva.adsr.ataque;
    const valorD = predefinicaoAtiva.adsr.decaimento;
    const valorS = predefinicaoAtiva.adsr.sustentacao;
    const valorR = predefinicaoAtiva.adsr.liberacao;

    const larguraA = Math.max(10, valorA * 80);
    const larguraD = Math.max(10, valorD * 80);
    const alturaS = valorS * 70;
    const larguraS = 120;
    const larguraR = Math.max(10, valorR * 80);

    const inicioX = 0;
    const inicioY = 100;
    
    const picoX = Math.min(100, larguraA);
    const picoY = 20;

    const fimDecaimentoX = picoX + larguraD;
    const fimDecaimentoY = 100 - alturaS;

    const fimSustentacaoX = fimDecaimentoX + larguraS;
    const fimSustentacaoY = fimDecaimentoY;

    const fimLiberacaoX = Math.min(390, fimSustentacaoX + larguraR);
    const fimLiberacaoY = 100;

    return {
      d: `M ${inicioX} ${inicioY} L ${picoX} ${picoY} L ${fimDecaimentoX} ${fimDecaimentoY} L ${fimSustentacaoX} ${fimSustentacaoY} L ${fimLiberacaoX} ${fimLiberacaoY}`,
      preenchimentoD: `M ${inicioX} ${inicioY} L ${picoX} ${picoY} L ${fimDecaimentoX} ${fimDecaimentoY} L ${fimSustentacaoX} ${fimSustentacaoY} L ${fimLiberacaoX} ${fimLiberacaoY} L ${fimLiberacaoX} 100 Z`
    };
  };

  const caminhosEnv = calcularCaminhoEnvelope();

  const lidarMudancaFrequenciaCorte = (e: React.ChangeEvent<HTMLInputElement>) => {
    atualizarPredefinicao({ frequenciaCorte: Math.round(Number(e.target.value)) });
  };

  const lidarMudancaRessonancia = (e: React.ChangeEvent<HTMLInputElement>) => {
    atualizarPredefinicao({ ressonancia: parseFloat(parseFloat(e.target.value).toFixed(1)) });
  };

  const lidarMudancaDesafinacao = (e: React.ChangeEvent<HTMLInputElement>) => {
    atualizarPredefinicao({ desafinacao: parseFloat(parseFloat(e.target.value).toFixed(1)) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-12 gap-3.5">
        <section className="col-span-12 lg:col-span-5 bg-[#1e1e1e] border-t border-l border-[#333333] border-r border-b border-black rounded p-4 flex flex-col gap-4 shadow-[1px_1px_3px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-[#353534] pb-2">
            <h2 className="font-mono text-[10px] text-[#00f2ff] font-medium tracking-wider uppercase">
              MÓDULO DE OSCILADOR
            </h2>
            <div className="flex gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#79ff5b] shadow-[0_0_8px_#79ff5b]"></div>
              <div className="h-2 w-2 rounded-full bg-[#353534]"></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-2 flex-1">
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-widest">Forma de Onda</span>
              <div className="bg-[#0e0e0e] p-1.5 rounded-lg flex gap-1 border border-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.9)]">
                {(['sine', 'triangle', 'square'] as const).map((tipoOnda) => (
                  <button
                    key={tipoOnda}
                    onClick={() => atualizarPredefinicao({ formaOnda: tipoOnda })}
                    className={`p-2 rounded cursor-pointer transition-all duration-150 relative ${
                      predefinicaoAtiva.formaOnda === tipoOnda
                        ? 'bg-[#00f2ff] text-[#002022] shadow-[0_0_8px_rgba(0,242,255,0.4)] font-bold'
                        : 'text-[#b9cacb] hover:bg-[#201f1f]'
                    }`}
                  >
                    {tipoOnda === 'sine' && <span className="text-xs font-mono font-bold font-sans">∿</span>}
                    {tipoOnda === 'triangle' && <span className="text-xs font-mono font-bold font-sans">▲</span>}
                    {tipoOnda === 'square' && <span className="text-xs font-mono font-bold font-sans">⊓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
              <span className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-widest">Desafinação</span>
              <div className="relative w-16 h-16 bg-[#181818] rounded-full border border-black shadow-lg flex flex-col items-center justify-center group">
                <div className="absolute inset-2 rounded-full border-2 border-[#201f1f]"></div>
                
                <div 
                  className="absolute w-1 h-6 bg-[#00f2ff] rounded-full shadow-[0_0_4px_#00f2ff] origin-bottom transition-transform duration-100"
                  style={{ 
                    transform: `rotate(${((predefinicaoAtiva.desafinacao + 50) * 2.8) - 140}deg) translateY(-12px)`
                  }}
                ></div>

                <span className="font-mono text-[11px] text-[#00f2ff] font-semibold mt-1.5 z-10 select-none">
                  {predefinicaoAtiva.desafinacao}
                </span>
              </div>
              
              <input 
                type="range"
                min="-50"
                max="50"
                step="0.1"
                className="w-20 accent-[#00f2ff] cursor-pointer"
                value={predefinicaoAtiva.desafinacao}
                onChange={lidarMudancaDesafinacao}
              />
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[124px]">
              <span className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-widest">TEMPO DE DESLIZE</span>
              <div className="w-full h-2 bg-[#0e0e0e] rounded-full relative border border-[#2a2a2a] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)]">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#79ff5b] rounded-full shadow-[0_0_6px_#79ff5b]"
                  style={{ width: `${predefinicaoAtiva.deslize}%` }}
                ></div>
                
                <input 
                  type="range"
                  min="0"
                  max="100"
                  className="absolute w-full h-full opacity-0 cursor-pointer accent-[#79ff5b]"
                  value={predefinicaoAtiva.deslize}
                  onChange={(e) => atualizarPredefinicao({ deslize: parseInt(e.target.value) })}
                />
              </div>
              <span className="font-mono text-[10px] text-[#79ff5b] font-medium">{predefinicaoAtiva.deslize} ms</span>
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-3 bg-[#1e1e1e] border-t border-l border-[#333333] border-r border-b border-black rounded p-4 flex flex-col gap-4 shadow-[1px_1px_3px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-[#353534] pb-2">
            <h2 className="font-mono text-[10px] text-[#00f2ff] font-medium tracking-wider uppercase">
              FILTRO LADDER
            </h2>
            <span className="font-mono text-[9px] text-[#79ff5b] font-bold">PASSA-BAIXAS</span>
          </div>

          <div className="flex justify-around items-center h-full gap-2 flex-1 pt-1">
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-18 h-18 bg-[#181818] rounded-full border border-black shadow-lg flex items-center justify-center cursor-pointer group">
                <div 
                  className="absolute w-1 h-6 bg-[#00f2ff] rounded-full shadow-[0_0_4px_#00f2ff] origin-bottom transition-transform duration-100"
                  style={{ 
                    transform: `rotate(${((predefinicaoAtiva.frequenciaCorte - 60) / 12000 * 280) - 140}deg) translateY(-14px)`
                  }}
                ></div>

                <div className="flex flex-col items-center z-10 select-none">
                  <span className="font-mono text-[10px] text-[#00f2ff] font-bold tracking-tighter">
                    {predefinicaoAtiva.frequenciaCorte >= 1000 ? `${(predefinicaoAtiva.frequenciaCorte / 1000).toFixed(1)}k` : predefinicaoAtiva.frequenciaCorte}
                  </span>
                  <span className="text-[7px] font-mono text-[#b9cacb]/50 tracking-wide">Hz</span>
                </div>
              </div>
              
              <span className="font-mono text-[8px] text-[#b9cacb]/60 font-medium uppercase mt-1">CORTE</span>
              <input 
                type="range"
                min="60"
                max="12000"
                className="w-16 accent-[#00f2ff] cursor-pointer"
                value={predefinicaoAtiva.frequenciaCorte}
                onChange={lidarMudancaFrequenciaCorte}
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="relative w-16 h-16 bg-[#181818] rounded-full border border-black shadow-lg flex items-center justify-center cursor-pointer group">
                <div 
                  className="absolute w-1 h-5 bg-[#79ff5b] rounded-full shadow-[0_0_4px_#79ff5b] origin-bottom"
                  style={{ 
                    transform: `rotate(${(predefinicaoAtiva.ressonancia / 10 * 280) - 140}deg) translateY(-12px)`
                  }}
                ></div>

                <div className="flex flex-col items-center z-10 select-none">
                  <span className="font-mono text-[10px] text-[#79ff5b] font-semibold">
                    {predefinicaoAtiva.ressonancia.toFixed(1)}
                  </span>
                </div>
              </div>

              <span className="font-mono text-[8px] text-[#b9cacb]/60 font-medium uppercase mt-1">RESO</span>
              <input 
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                className="w-14 accent-[#79ff5b] cursor-pointer"
                value={predefinicaoAtiva.ressonancia}
                onChange={lidarMudancaRessonancia}
              />
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-[#1e1e1e] border-t border-l border-[#333333] border-r border-b border-black rounded p-4 flex flex-col gap-4 shadow-[1px_1px_3px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-[#353534] pb-2">
            <h2 className="font-mono text-[10px] text-[#00f2ff] font-medium tracking-wider uppercase">
              ENVELOPE DE RESSONÂNCIA
            </h2>
            <span className="font-mono text-[9px] text-[#b9cacb]/50">ADSR 1</span>
          </div>

          <div className="flex flex-col gap-3 h-full justify-between flex-1">
            <div className="h-20 bg-black rounded border border-[#2a2a2a] relative overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-x-0 bottom-4 border-b border-[#1c1b1b] border-dashed"></div>
              <div className="absolute left-1/2 inset-y-0 border-r border-[#1c1b1b] border-dashed"></div>

              <svg className="w-full h-full pointer-events-none" viewBox="0 0 320 100" preserveAspectRatio="none">
                <path d={caminhosEnv.preenchimentoD} fill="url(#gradienteAzulEnv)" opacity="0.15" />
                <path d={caminhosEnv.d} fill="none" stroke="#00f2ff" strokeWidth="2" className="drop-shadow-[0_0_3px_#00f2ff]" />
                
                <defs>
                  <linearGradient id="gradienteAzulEnv" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00f2ff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#00f2ff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-4 gap-2 h-24">
              <div className="flex flex-col items-center justify-end gap-1.5 h-full">
                <div className="flex-1 w-1.5 bg-[#0e0e0e] rounded-full relative border border-[#2a2a2a] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.8)] group justify-center">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#00f2ff] rounded-full shadow-[0_0_6px_#00f2ff] pointer-events-none"
                    style={{ height: `${predefinicaoAtiva.adsr.ataque * 100}%` }}
                  ></div>
                  <input 
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.01"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                    value={predefinicaoAtiva.adsr.ataque}
                    onChange={(e) => atualizarPredefinicao({ 
                      adsr: { ...predefinicaoAtiva.adsr, ataque: parseFloat(e.target.value) } 
                    })}
                  />
                </div>
                <span className="font-mono text-[8px] text-[#b9cacb]/80">A</span>
                <span className="font-mono text-[7px] text-[#00f2ff] font-medium leading-none">
                  {Math.round(predefinicaoAtiva.adsr.ataque * 1000)}ms
                </span>
              </div>

              <div className="flex flex-col items-center justify-end gap-1.5 h-full">
                <div className="flex-1 w-1.5 bg-[#0e0e0e] rounded-full relative border border-[#2a2a2a] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.8)] group justify-center">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#00f2ff] rounded-full shadow-[0_0_6px_#00f2ff] pointer-events-none"
                    style={{ height: `${(predefinicaoAtiva.adsr.decaimento / 1.5) * 100}%` }}
                  ></div>
                  <input 
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.01"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                    value={predefinicaoAtiva.adsr.decaimento}
                    onChange={(e) => atualizarPredefinicao({ 
                      adsr: { ...predefinicaoAtiva.adsr, decaimento: parseFloat(e.target.value) } 
                    })}
                  />
                </div>
                <span className="font-mono text-[8px] text-[#b9cacb]/80">D</span>
                <span className="font-mono text-[7px] text-[#00f2ff] font-medium leading-none">
                  {Math.round(predefinicaoAtiva.adsr.decaimento * 1000)}ms
                </span>
              </div>

              <div className="flex flex-col items-center justify-end gap-1.5 h-full">
                <div className="flex-1 w-1.5 bg-[#0e0e0e] rounded-full relative border border-[#2a2a2a] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.8)] group justify-center">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#00f2ff] rounded-full shadow-[0_0_6px_#00f2ff] pointer-events-none"
                    style={{ height: `${predefinicaoAtiva.adsr.sustentacao * 100}%` }}
                  ></div>
                  <input 
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.01"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                    value={predefinicaoAtiva.adsr.sustentacao}
                    onChange={(e) => atualizarPredefinicao({ 
                      adsr: { ...predefinicaoAtiva.adsr, sustentacao: parseFloat(e.target.value) } 
                    })}
                  />
                </div>
                <span className="font-mono text-[8px] text-[#b9cacb]/80">S</span>
                <span className="font-mono text-[7px] text-[#00f2ff] font-medium leading-none">
                  {Math.round(predefinicaoAtiva.adsr.sustentacao * 100)}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-end gap-1.5 h-full">
                <div className="flex-1 w-1.5 bg-[#0e0e0e] rounded-full relative border border-[#2a2a2a] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.8)] group justify-center">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-[#00f2ff] rounded-full shadow-[0_0_6px_#00f2ff] pointer-events-none"
                    style={{ height: `${(predefinicaoAtiva.adsr.liberacao / 1.5) * 100}%` }}
                  ></div>
                  <input 
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.01"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                    value={predefinicaoAtiva.adsr.liberacao}
                    onChange={(e) => atualizarPredefinicao({ 
                      adsr: { ...predefinicaoAtiva.adsr, liberacao: parseFloat(e.target.value) } 
                    })}
                  />
                </div>
                <span className="font-mono text-[8px] text-[#b9cacb]/80">R</span>
                <span className="font-mono text-[7px] text-[#00f2ff] font-medium leading-none">
                  {Math.round(predefinicaoAtiva.adsr.liberacao * 1000)}ms
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-[#1e1e1e] border-t border-l border-[#333333] border-r border-[#000] border-b border-[#000] rounded p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4 border-b border-[#353534] pb-2 mb-3">
          <h2 className="font-mono text-[10px] text-[#00f2ff] font-medium tracking-wider uppercase">
            ANALISADOR DE ESPECTRO DA SAÍDA
          </h2>
          <div className="flex gap-4 ml-auto font-mono text-[10px] items-center">
            <span className="text-[#79ff5b] font-semibold tracking-widest text-[8px] border border-[#79ff5b]/30 px-1 py-0.5 rounded">
              ESTÉREO
            </span>
            <span className="text-[#b9cacb]/50 text-[9px]">
              RMS: <strong className="text-white font-medium">-12.4dB</strong>
            </span>
          </div>
        </div>

        <div className="bg-[#000000] border border-[#222] rounded-lg h-24 w-full flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_10px_rgba(0,219,231,0.1)]">
          <canvas ref={refEspectro} className="w-full h-full" />
        </div>
      </section>

      <div className="bg-[#1c1b1b]/50 border border-t-[#222]/30 p-3 rounded flex items-start gap-2.5 text-xs text-[#b9cacb]/70">
        <Info size={16} className="text-[#00f2ff] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Dica de Uso:</strong> Clique nas teclas do teclado virtual abaixo para ouvir a síntese em tempo real. Você também pode mapear os faders da ADSR arrastando o mouse nos indicadores para ver a curva do envelope se atualizar de forma dinâmica!
        </p>
      </div>
    </div>
  );
}
