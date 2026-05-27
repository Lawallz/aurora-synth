import React, { useState, useEffect } from 'react';
import { TipoVisualizacao, PredefinicaoSintetizador, AjustesEfeitos, EstadoConfiguracoesGlobais, EstadoFormularioFaturamento } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SynthEditor from './components/SynthEditor';
import FXRack from './components/FXRack';
import PresetBrowser from './components/PresetBrowser';
import GlobalSettings from './components/GlobalSettings';
import CheckoutPage from './components/CheckoutPage';
import VirtualKeyboard from './components/VirtualKeyboard';
import { FolderOpen, Sliders, AudioLines, Settings, ShieldAlert } from 'lucide-react';

export default function App() {
  const predefinicoesIniciais: PredefinicaoSintetizador[] = [
    {
      id: 'cyber-pad',
      nome: 'Cyber Pad',
      categoria: 'Pads',
      autor: 'Aurora Studio',
      tipo: 'Wavetable',
      formaOnda: 'triangle',
      desafinacao: 12.4,
      deslize: 45,
      frequenciaCorte: 1050,
      ressonancia: 5.5,
      adsr: { ataque: 0.15, decaimento: 0.65, sustentacao: 0.8, liberacao: 0.5 },
      favoritado: true
    },
    {
      id: 'heavy-808',
      nome: 'Heavy 808',
      categoria: 'Baixos',
      autor: 'Aurora Studio',
      tipo: 'Analogico',
      formaOnda: 'sine',
      desafinacao: 0,
      deslize: 20,
      frequenciaCorte: 250,
      ressonancia: 1.5,
      adsr: { ataque: 0.02, decaimento: 0.8, sustentacao: 0.1, liberacao: 0.2 },
      favoritado: false
    },
    {
      id: 'retro-lead',
      nome: 'Retro Lead',
      categoria: 'Leads',
      autor: 'Aurora Studio',
      tipo: 'Digital',
      formaOnda: 'sawtooth',
      desafinacao: 25.2,
      deslize: 30,
      frequenciaCorte: 1800,
      ressonancia: 2.1,
      adsr: { ataque: 0.05, decaimento: 0.35, sustentacao: 0.65, liberacao: 0.4 },
      favoritado: false
    },
    {
      id: 'neon-strings',
      nome: 'Neon Strings',
      categoria: 'Leads',
      autor: 'Aurora Studio',
      tipo: 'Fisico',
      formaOnda: 'square',
      desafinacao: 8.4,
      deslize: 50,
      frequenciaCorte: 3500,
      ressonancia: 4.0,
      adsr: { ataque: 0.2, decaimento: 0.5, sustentacao: 0.9, liberacao: 0.8 },
      favoritado: false
    },
    {
      id: 'lunar-pluck',
      nome: 'Lunar Pluck',
      categoria: 'Pads',
      autor: 'Aurora Studio',
      tipo: 'Hibrido',
      formaOnda: 'triangle',
      desafinacao: 0,
      deslize: 10,
      frequenciaCorte: 950,
      ressonancia: 8.0,
      adsr: { ataque: 0.01, decaimento: 0.25, sustentacao: 0, liberacao: 0.15 },
      favoritado: false
    },
    {
      id: 'deep-sub',
      nome: 'Deep Sub',
      categoria: 'Baixos',
      autor: 'Aurora Studio',
      tipo: 'Senoide',
      formaOnda: 'sine',
      desafinacao: 0,
      deslize: 40,
      frequenciaCorte: 180,
      ressonancia: 1.0,
      adsr: { ataque: 0.08, decaimento: 0.5, sustentacao: 0.7, liberacao: 0.4 },
      favoritado: false
    }
  ];

  const [abaAtiva, definirAbaAtiva] = useState<TipoVisualizacao>('EDITOR');
  const [categoriaAtiva, definirCategoriaAtiva] = useState<string>('Leads');
  const [consultaPesquisa, definirConsultaPesquisa] = useState<string>('');
  const [predefinicoes, definirPredefinicoes] = useState<PredefinicaoSintetizador[]>(predefinicoesIniciais);
  const [predefinicaoAtiva, definirPredefinicaoAtiva] = useState<PredefinicaoSintetizador>(predefinicoesIniciais[0]);
  const [notificacao, definirNotificacao] = useState<{ mensagem: string; tipo: 'success' | 'info' | 'error' } | null>(null);

  const [ajustesEfeitos, definirAjustesEfeitos] = useState<AjustesEfeitos>({
    delay: { ativo: true, tempo: 450, retroalimentacao: 62, mistura: 30 },
    reverb: { ativo: true, tamanho: 8.0, decaimento: 3.2, mistura: 15 },
    chorus: { ativo: true, taxa: 1.2, profundidade: 40, mistura: 50 },
    equalizador: { ativo: true, graves: -3, medios: 4, agudos: 0 }
  });

  const [estadoFaturamento, definirEstadoFaturamento] = useState<EstadoFormularioFaturamento>({
    nomeCompleto: 'João Silva',
    email: 'usuario_estudio_01@aurora-audio.com',
    pais: 'Brasil',
    codigoPostal: '01001-000',
    metodoPagamento: 'card',
    numeroCartao: '4242 •••• •••• 1234',
    dataValidade: '12/28',
    cvv: '123',
    codigoCupom: '',
    cupomAplicado: false,
    ativo: false
  });

  const [configuracoesGlobais, definirConfiguracoesGlobais] = useState<EstadoConfiguracoesGlobais>({
    escala: '100%',
    tamanhoBuffer: 128,
    latenciaEntrada: 2.4,
    latenciaSaida: 3.1,
    dispositivosMidi: [
      { id: 'dev1', nome: 'Arturia KeyStep 37', tipo: 'fisico', status: 'conectado' },
      { id: 'dev2', nome: 'Aurora Virtual MIDI', tipo: 'virtual', status: 'ocioso' }
    ],
    mapeamentos: [
      { id: 'm1', parametro: 'Frequência de Corte', cc: 'CC #74' },
      { id: 'm2', parametro: 'Taxa do LFO 1', cc: 'CC #01' },
      { id: 'm3', parametro: 'Mix do Reverb', cc: 'Sem atribuição' }
    ]
  });

  useEffect(() => {
    lidarAlerta('Bem-vindo ao AURORA! Conectado com sucesso ao mecanismo Web Audio.', 'success');
  }, []);

  const lidarAlerta = (mensagem: string, tipo: 'success' | 'info' | 'error') => {
    definirNotificacao({ mensagem, tipo });
    setTimeout(() => {
      definirNotificacao(null);
    }, 4000);
  };

  const lidarSelecionarPredefinicao = (predefinicao: PredefinicaoSintetizador) => {
    definirPredefinicaoAtiva(predefinicao);
    lidarAlerta(`Preset carregado: ${predefinicao.nome}`, 'info');
  };

  const lidarAtualizarPredefinicao = (novosValores: Partial<PredefinicaoSintetizador>) => {
    const atualizada = { ...predefinicaoAtiva, ...novosValores };
    definirPredefinicaoAtiva(atualizada);
    
    definirPredefinicoes((corrente) => 
      corrente.map((p) => p.id === predefinicaoAtiva.id ? atualizada : p)
    );
  };

  const lidarAlternarFavorito = () => {
    const proximoFavorito = !predefinicaoAtiva.favoritado;
    lidarAtualizarPredefinicao({ favoritado: proximoFavorito });
    lidarAlerta(proximoFavorito ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', 'info');
  };

  const lidarAlternarEstrelaNaLista = (idPreset: string) => {
    definirPredefinicoes((corrente) => 
      corrente.map((p) => {
        if (p.id === idPreset) {
          const proximoFavorito = !p.favoritado;
          if (predefinicaoAtiva.id === idPreset) {
            definirPredefinicaoAtiva({ ...predefinicaoAtiva, favoritado: proximoFavorito });
          }
          return { ...p, favoritado: proximoFavorito };
        }
        return p;
      })
    );
  };

  const lidarCriarNovoPreset = () => {
    const novoId = `preset-${Math.random().toString().slice(2, 6)}`;
    const novaPredefinicao: PredefinicaoSintetizador = {
      id: novoId,
      nome: `Preset Custom ${predefinicoes.length + 1}`,
      categoria: categoriaAtiva || 'Leads',
      autor: 'Usuário',
      tipo: 'Analogico',
      formaOnda: 'sawtooth',
      desafinacao: 0,
      deslize: 20,
      frequenciaCorte: 1200,
      ressonancia: 1.0,
      adsr: { ataque: 0.1, decaimento: 0.3, sustentacao: 0.7, liberacao: 0.3 },
      favoritado: false
    };

    definirPredefinicoes((corrente) => [...corrente, novaPredefinicao]);
    definirPredefinicaoAtiva(novaPredefinicao);
    definirAbaAtiva('EDITOR');
    lidarAlerta('Novo preset custom criado!', 'success');
  };

  const lidarImportarPreset = () => {
    lidarAlerta('Importação de predefinições: Arraste arquivos .aurora ou clique no botão de upload na Sidebar.', 'info');
  };

  const lidarExportarPreset = () => {
    const dadosPreset = JSON.stringify({ predefinicaoAtiva, ajustesEfeitos }, null, 2);
    const blob = new Blob([dadosPreset], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${predefinicaoAtiva.nome.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    link.click();
    lidarAlerta('Preset exportado com sucesso!', 'success');
  };

  const lidarSalvarTudo = () => {
    lidarAlerta('Todas as configurações de predefinições foram salvas na memória local do estúdio!', 'success');
  };

  const lidarAtivarSucesso = (chave: string) => {
    lidarAlerta(`Mecanismo Pro ativado com sucesso! Chave: ${chave}`, 'success');
  };

  const renderizarSecaoPrincipal = () => {
    switch (abaAtiva) {
      case 'NAVEGADOR':
        return (
          <PresetBrowser
            presets={predefinicoes}
            predefinicaoAtiva={predefinicaoAtiva}
            aoSelecionarPredefinicao={lidarSelecionarPredefinicao}
            alternarEstrela={lidarAlternarEstrelaNaLista}
            categoriaAtiva={categoriaAtiva}
            consultaPesquisa={consultaPesquisa}
          />
        );
      case 'EDITOR':
        return (
          <SynthEditor
            predefinicaoAtiva={predefinicaoAtiva}
            atualizarPredefinicao={lidarAtualizarPredefinicao}
          />
        );
      case 'EFEITOS':
        return (
          <FXRack
            ajustesEfeitos={ajustesEfeitos}
            atualizarEfeitos={(novosEfeitos) => definirAjustesEfeitos((prev) => ({ ...prev, ...novosEfeitos }))}
            aoSalvar={lidarSalvarTudo}
          />
        );
      case 'CONFIGURACOES':
        return (
          <GlobalSettings
            configuracoes={configuracoesGlobais}
            atualizarConfiguracoes={(novasConfiguracoes) => definirConfiguracoesGlobais((prev) => ({ ...prev, ...novasConfiguracoes }))}
            aoMudarEscala={(escala) => lidarAlerta(`Escala da interface estendida para ${escala}`, 'info')}
          />
        );
      case 'CADASTRO':
        return (
          <CheckoutPage
            estadoFaturamento={estadoFaturamento}
            definirEstadoFaturamento={definirEstadoFaturamento}
            aoAtivarSucesso={lidarAtivarSucesso}
            aoVoltar={() => definirAbaAtiva('EDITOR')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col overflow-hidden select-none font-sans"
      style={{ zoom: configuracoesGlobais.escala === '125%' ? '1' : configuracoesGlobais.escala === '150%' ? '1.1' : '1' } as any}
    >
      {notificacao && (
        <div className={`fixed top-16 right-6 z-[120] border p-3.5 rounded-lg shadow-xl text-xs font-mono flex items-center gap-2.5 transition-all max-w-sm animate-bounce ${
          notificacao.type === 'success' 
            ? 'bg-[#1c1b1b] border-[#79ff5b] text-[#79ff5b]' 
            : notificacao.type === 'error'
            ? 'bg-[#1c1b1b] border-red-500 text-red-500'
            : 'bg-[#1c1b1b] border-[#00f2ff] text-[#00f2ff]'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notificacao.type === 'success' ? 'bg-[#79ff5b]' : notificacao.type === 'error' ? 'bg-red-500' : 'bg-[#00f2ff]'
          }`}></div>
          <span className="leading-tight">{notificacao.mensagem}</span>
        </div>
      )}

      <Header
        visualizacaoAtiva={abaAtiva}
        definirVisualizacao={definirAbaAtiva}
        predefinicaoAtiva={predefinicaoAtiva}
        aoSalvarPredefinicao={lidarSalvarTudo}
        alternarFavoritado={lidarAlternarFavorito}
        estaAtivado={estadoFaturamento.ativo}
      />

      <div className="flex flex-1 pt-14 pb-32 overflow-hidden h-screen">
        <div className="hidden md:block shrink-0">
          <Sidebar
            categoriaAtiva={categoriaAtiva}
            definirCategoria={definirCategoriaAtiva}
            consultaPesquisa={consultaPesquisa}
            definirConsultaPesquisa={definirConsultaPesquisa}
            aoCriarNovoPreset={lidarCriarNovoPreset}
            aoImportarPreset={lidarImportarPreset}
            aoExportarPreset={lidarExportarPreset}
            visualizacaoAtiva={abaAtiva}
            definirVisualizacao={definirAbaAtiva}
          />
        </div>

        <main className="flex-1 md:ml-64 p-6 overflow-y-auto custom-scroll h-[calc(100vh-176px)]">
          {!estadoFaturamento.ativo && abaAtiva !== 'CADASTRO' && (
            <div 
              onClick={() => definirAbaAtiva('CADASTRO')}
              className="mb-4 bg-yellow-950/10 border border-yellow-700/40 p-3 rounded-lg text-[10px] font-mono hover:bg-yellow-950/20 hover:border-yellow-600 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-yellow-500 font-bold">
                <ShieldAlert size={14} className="shrink-0" />
                <span>MODO DE DEMONSTRAÇÃO ATIVO: SEU ÁUDIO SUPORTADO EXIGE ASSINATURA</span>
              </div>
              <span className="text-white hover:underline text-[9px] font-mono">ATIVAR AGORA →</span>
            </div>
          )}

          {renderizarSecaoPrincipal()}
        </main>
      </div>

      <VirtualKeyboard />

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-[#201f1f] border-t border-[#0e0e0e] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] px-4">
        <button 
          onClick={() => definirAbaAtiva('NAVEGADOR')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            abaAtiva === 'NAVEGADOR' ? 'text-[#00f2ff]' : 'text-[#b9cacb]/60 hover:text-[#b9cacb]'
          }`}
        >
          <FolderOpen size={16} />
          <span className="font-mono text-[8px] uppercase mt-1">Navegador</span>
        </button>

        <button 
          onClick={() => definirAbaAtiva('EDITOR')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            abaAtiva === 'EDITOR' ? 'text-[#00f2ff]' : 'text-[#b9cacb]/60 hover:text-[#b9cacb]'
          }`}
        >
          <Sliders size={16} />
          <span className="font-mono text-[8px] uppercase mt-1">Editor</span>
        </button>

        <button 
          onClick={() => definirAbaAtiva('EFEITOS')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            abaAtiva === 'EFEITOS' ? 'text-[#00f2ff]' : 'text-[#b9cacb]/60 hover:text-[#b9cacb]'
          }`}
        >
          <AudioLines size={16} />
          <span className="font-mono text-[8px] uppercase mt-1">Efeitos</span>
        </button>

        <button 
          onClick={() => definirAbaAtiva('CONFIGURACOES')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            abaAtiva === 'CONFIGURACOES' ? 'text-[#00f2ff]' : 'text-[#b9cacb]/60 hover:text-[#b9cacb]'
          }`}
        >
          <Settings size={16} />
          <span className="font-mono text-[8px] uppercase mt-1">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
