import React from 'react';
import { Search, Music, Cloud, Activity, Disc, Download, Upload, Plus } from 'lucide-react';
import { TipoVisualizacao } from '../types';

interface SidebarProps {
  categoriaAtiva: string;
  definirCategoria: (categoria: string) => void;
  consultaPesquisa: string;
  definirConsultaPesquisa: (consulta: string) => void;
  aoCriarNovoPreset: () => void;
  aoImportarPreset: () => void;
  aoExportarPreset: () => void;
  visualizacaoAtiva: TipoVisualizacao;
  definirVisualizacao: (visualizacao: TipoVisualizacao) => void;
}

export default function Sidebar({
  categoriaAtiva,
  definirCategoria,
  consultaPesquisa,
  definirConsultaPesquisa,
  aoCriarNovoPreset,
  aoImportarPreset,
  aoExportarPreset,
  visualizacaoAtiva,
  definirVisualizacao
}: SidebarProps) {
  
  const categorias = [
    { id: 'Guitarras', label: 'Guitarras', icon: Music },
    { id: 'Pianos', label: 'Pianos', icon: Music },
    { id: 'Leads', label: 'Leads', icon: Activity },
    { id: 'Pads', label: 'Pads', icon: Cloud },
    { id: 'Baixos', label: 'Baixos', icon: Activity },
    { id: 'Baterias', label: 'Baterias', icon: Disc }
  ];

  const lidarCliqueCategoria = (categoria: string) => {
    definirCategoria(categoria);
    if (visualizacaoAtiva !== 'NAVEGADOR' && visualizacaoAtiva !== 'EDITOR') {
      definirVisualizacao('NAVEGADOR');
    }
  };

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 flex flex-col py-4 bg-[#1c1b1b] border-r border-[#0e0e0e] z-50">
      <div className="px-4 mb-6">
        <div className="bg-[#0e0e0e] flex items-center px-3 py-2 rounded-lg gap-2 mb-6 border border-[#2a2a2a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.9)]">
          <Search size={16} className="text-[#b9cacb]/50" />
          <input 
            type="text"
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-[#e5e2e1] w-full p-0 placeholder:text-[#b9cacb]/30"
            placeholder="Pesquisar presets..."
            value={consultaPesquisa}
            onChange={(e) => definirConsultaPesquisa(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#b9cacb]/50 font-medium tracking-wider mb-2 px-1">
            CATEGORIAS
          </span>
          <nav className="flex flex-col gap-1.5">
            {categorias.map((cat) => {
              const Icone = cat.icon;
              const estaAtivo = categoriaAtiva === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => lidarCliqueCategoria(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left font-mono text-[10px] tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                    estaAtivo 
                      ? 'bg-[#2ff801] text-[#0f6d00] font-bold shadow-[0_0_12px_rgba(47,248,1,0.25)]' 
                      : 'text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
                  }`}
                >
                  <Icone size={14} className="shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto px-4 space-y-4">
        <button 
          onClick={aoCriarNovoPreset}
          className="w-full py-2.5 bg-[#00f2ff] hover:bg-[#00dbe7] text-[#002022] font-mono text-[10px] tracking-wider font-bold rounded shadow-[0_0_12px_rgba(0,242,255,0.25)] transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5"
        >
          <Plus size={12} className="stroke-[3px]" />
          NOVO PRESET
        </button>

        <div className="grid grid-cols-2 gap-2 pb-6">
          <button 
            onClick={aoImportarPreset}
            className="flex items-center justify-center gap-1 py-2 bg-[#0e0e0e] text-[#b9cacb] hover:text-[#e5e2e1] hover:bg-[#201f1f] font-mono text-[9px] tracking-wide rounded border border-[#2a2a2a] transition-all cursor-pointer shadow-[1px_1px_3px_rgba(0,0,0,0.8)] px-1"
          >
            <Download size={10} /> Importar
          </button>
          
          <button 
            onClick={aoExportarPreset}
            className="flex items-center justify-center gap-1 py-2 bg-[#0e0e0e] text-[#b9cacb] hover:text-[#e5e2e1] hover:bg-[#201f1f] font-mono text-[9px] tracking-wide rounded border border-[#2a2a2a] transition-all cursor-pointer shadow-[1px_1px_3px_rgba(0,0,0,0.8)] px-1"
          >
            <Upload size={10} /> Exportar
          </button>
        </div>
      </div>
    </aside>
  );
}
