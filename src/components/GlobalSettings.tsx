import React, { useState } from 'react';
import { Usb, Keyboard, Trash2, Plus } from 'lucide-react';
import { EstadoConfiguracoesGlobais, DispositivoMidi, MapeamentoMidi } from '../types';

interface GlobalSettingsProps {
  configuracoes: EstadoConfiguracoesGlobais;
  atualizarConfiguracoes: (novasConfiguracoes: Partial<EstadoConfiguracoesGlobais>) => void;
  aoMudarEscala: (escala: string) => void;
}

export default function GlobalSettings({ configuracoes, atualizarConfiguracoes, aoMudarEscala }: GlobalSettingsProps) {
  const [mostrarAdicionarMapeamento, definirMostrarAdicionarMapeamento] = useState(false);
  const [nomeNovoParametro, definirNomeNovoParametro] = useState('');
  const [numeroNovoCC, definirNumeroNovoCC] = useState('');

  const lidarCliqueBuffer = (tamanho: number) => {
    const latEntrada = parseFloat((tamanho * 0.015 + 0.5).toFixed(1));
    const latSaida = parseFloat((tamanho * 0.02 + 0.5).toFixed(1));
    atualizarConfiguracoes({
      tamanhoBuffer: tamanho,
      latenciaEntrada: latEntrada,
      latenciaSaida: latSaida
    });
  };

  const alternarDispositivo = (idDispositivo: string) => {
    const dispositivosAtualizados = configuracoes.dispositivosMidi.map((disp) => {
      if (disp.id === idDispositivo) {
        const proximoStatus = disp.status === 'conectado' ? 'desconectado' as const : 'conectado' as const;
        return { ...disp, status: proximoStatus };
      }
      return disp;
    });
    atualizarConfiguracoes({ dispositivosMidi: dispositivosAtualizados });
  };

  const lidarEnvioNovoMapeamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovoParametro || !numeroNovoCC) return;

    const novoMapeamento: MapeamentoMidi = {
      id: Math.random().toString(),
      parametro: nomeNovoParametro,
      cc: `CC #${numeroNovoCC.padStart(2, '0')}`
    };

    atualizarConfiguracoes({
      mapeamentos: [...configuracoes.mapeamentos, novoMapeamento]
    });

    definirNomeNovoParametro('');
    definirNumeroNovoCC('');
    definirMostrarAdicionarMapeamento(false);
  };

  const lidarRemoverMapeamento = (id: string) => {
    atualizarConfiguracoes({
      mapeamentos: configuracoes.mapeamentos.filter((m) => m.id !== id)
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-[10px] text-[#b9cacb]/50 tracking-wider uppercase">CONFIGURAÇÕES GLOBAIS</h2>
          <span className="h-[1px] flex-1 bg-[#353534] ml-4"></span>
        </div>
        
        <div className="bg-[#1c1b1b] border border-black p-4 rounded-lg">
          <label className="font-sans font-semibold text-sm text-white block mb-2">
            Dimensionamento da Interface (Redimensionar GUI)
          </label>
          <div className="relative">
            <select 
              value={configuracoes.escala}
              onChange={(e) => {
                atualizarConfiguracoes({ escala: e.target.value });
                aoMudarEscala(e.target.value);
              }}
              className="w-full bg-[#353534] border border-black text-xs text-white font-mono py-3 px-4 rounded cursor-pointer appearance-none focus:outline-none focus:border-[#00f2ff]/50"
            >
              <option value="100%">100% (Padrão)</option>
              <option value="125%">125% (Otimizado)</option>
              <option value="150%">150% (Alta Densidade)</option>
            </select>
          </div>
          <p className="text-[10px] text-[#b9cacb]/50 mt-2 font-mono">
            * Uma reinicialização pode ser necessária para que alguns controles gráficos personalizados sejam redesenhados perfeitamente.
          </p>
        </div>
      </section>

      <section className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-[10px] text-[#b9cacb]/50 tracking-wider uppercase">INTERFACE DE HARDWARE</h2>
          <span className="h-[1px] flex-1 bg-[#353534] ml-4"></span>
        </div>

        <div className="bg-[#1c1b1b] border border-black p-4 rounded-lg space-y-2">
          <h3 className="font-sans font-semibold text-sm text-white mb-2">Dispositivos de Entrada MIDI</h3>
          
          {configuracoes.dispositivosMidi.map((disp) => (
            <div 
              key={disp.id}
              onClick={() => alternarDispositivo(disp.id)}
              className="flex items-center justify-between p-3 bg-[#2a2a2a] border border-black group hover:brightness-110 active:brightness-125 transition-all cursor-pointer rounded"
            >
              <div className="flex items-center gap-3">
                {disp.tipo === 'fisico' ? (
                  <Usb className={disp.status === 'conectado' ? 'text-[#79ff5b]' : 'text-[#b9cacb]/50'} size={18} />
                ) : (
                  <Keyboard className={disp.status === 'conectado' ? 'text-[#79ff5b]' : 'text-[#b9cacb]/50'} size={18} />
                )}
                <div>
                  <p className="font-mono text-xs font-semibold text-white">{disp.nome}</p>
                  <p className="text-[9px] uppercase font-mono tracking-wider mt-0.5">
                    {disp.status === 'conectado' ? (
                      <span className="text-[#79ff5b]/80">Status: Conectado</span>
                    ) : (
                      <span className="text-[#b9cacb]/40">Status: Ocioso</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                disp.status === 'conectado' ? 'bg-[#79ff5b] shadow-[0_0_8px_#79ff5b]' : 'bg-[#353534]'
              }`}></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-[10px] text-[#b9cacb]/50 tracking-wider uppercase">MOTOR DE ÁUDIO</h2>
          <span className="h-[1px] flex-1 bg-[#353534] ml-4"></span>
        </div>

        <div className="bg-[#1c1b1b] border border-black p-4 rounded-lg">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-sans font-semibold text-sm text-white">Tamanho do Buffer</h3>
            <span className="font-mono text-xs text-[#00f2ff] font-bold">
              {configuracoes.tamanhoBuffer} samples
            </span>
          </div>

          <div className="flex bg-[#0e0e0e] border border-[#2a2a2a] p-1 rounded gap-1 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.9)]">
            {[64, 128, 256, 512, 1024].map((tamanho) => (
              <button
                key={tamanho}
                onClick={() => lidarCliqueBuffer(tamanho)}
                className={`flex-1 py-1.5 font-mono text-[10px] font-semibold rounded cursor-pointer transition-all ${
                  configuracoes.tamanhoBuffer === tamanho
                    ? 'bg-[#00f2ff] text-[#002022] font-bold shadow-sm'
                    : 'text-[#b9cacb]/70 hover:bg-[#201f1f] hover:text-white'
                }`}
              >
                {tamanho}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-[#b9cacb]/50 border-t border-[#353534]/30 pt-3">
            <span>Latência de Entrada: <strong className="text-white font-medium">{configuracoes.latenciaEntrada}ms</strong></span>
            <span>Latência de Saída: <strong className="text-white font-medium">{configuracoes.latenciaSaida}ms</strong></span>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-mono text-[10px] text-[#b9cacb]/50 tracking-wider uppercase">MAPEAMENTO MIDI CC</h2>
          <span className="h-[1px] flex-1 bg-[#353534] ml-4"></span>
        </div>

        <div className="bg-[#1c1b1b] border border-black rounded-lg overflow-hidden">
          <div className="bg-[#2a2a2a] px-4 py-2 border-b border-black flex justify-between text-[8px] font-mono font-semibold text-[#b9cacb]/50">
            <span>PARÂMETRO</span>
            <span>ATRIBUIÇÃO CC</span>
          </div>
          
          <div className="divide-y divide-black/50">
            {configuracoes.mapeamentos.map((m) => (
              <div 
                key={m.id} 
                className="px-4 py-3 flex items-center justify-between hover:bg-[#201f1f] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white">{m.parametro}</span>
                  <button 
                    onClick={() => lidarRemoverMapeamento(m.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-500 cursor-pointer"
                    title="Remover mapeamento"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <span className={`font-mono text-xs ${m.cc === 'Sem atribuição' ? 'text-[#b9cacb]/50 italic' : 'text-[#79ff5b]'}`}>
                  {m.cc}
                </span>
              </div>
            ))}
          </div>

          {!mostrarAdicionarMapeamento ? (
            <button 
              onClick={() => definirMostrarAdicionarMapeamento(true)}
              className="w-full py-4 bg-[#2a2a2a] font-mono text-[10px] font-semibold text-[#00f2ff] hover:bg-[#353534] transition-all flex items-center justify-center gap-2 cursor-pointer border-t border-black/50 uppercase"
            >
              <Plus size={14} className="stroke-[3px]" /> ADICIONAR NOVO MAPEAMENTO
            </button>
          ) : (
            <form onSubmit={lidarEnvioNovoMapeamento} className="p-4 bg-[#0e0e0e] border-t border-black space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-mono text-[#b9cacb]/50 mb-1">PARÂMETRO</label>
                  <input 
                    type="text" 
                    placeholder="ex. Velocidade LFO 1" 
                    required
                    value={nomeNovoParametro}
                    onChange={(e) => definirNomeNovoParametro(e.target.value)}
                    className="w-full bg-[#1c1b1b] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-[#b9cacb]/50 mb-1 font-sans font-medium">NÚMERO CC (0-127)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="127"
                    required
                    placeholder="74"
                    value={numeroNovoCC}
                    onChange={(e) => definirNumeroNovoCC(e.target.value)}
                    className="w-full bg-[#1c1b1b] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => definirMostrarAdicionarMapeamento(false)}
                  className="px-3 py-1.5 text-xs text-[#b9cacb] hover:text-white font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#00f2ff] hover:bg-[#00dbe7] text-[#002022] font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer"
                >
                  MAPEAR PARÂMETRO
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
