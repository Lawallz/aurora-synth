export type TipoVisualizacao = 'NAVEGADOR' | 'EDITOR' | 'EFEITOS' | 'CONFIGURACOES' | 'CADASTRO';

export interface PredefinicaoSintetizador {
  id: string;
  nome: string;
  categoria: string;
  autor: string;
  tipo: 'Analogico' | 'Digital' | 'Wavetable' | 'Fisico' | 'Hibrido' | 'Senoide';
  formaOnda: 'sine' | 'triangle' | 'sawtooth' | 'square';
  desafinacao: number;
  deslize: number;
  frequenciaCorte: number;
  ressonancia: number;
  adsr: {
    ataque: number;
    decaimento: number;
    sustentacao: number;
    liberacao: number;
  };
  favoritado?: boolean;
}

export interface AjustesEfeitos {
  delay: {
    ativo: boolean;
    tempo: number;
    retroalimentacao: number;
    mistura: number;
  };
  reverb: {
    ativo: boolean;
    tamanho: number;
    decaimento: number;
    mistura: number;
  };
  chorus: {
    ativo: boolean;
    taxa: number;
    profundidade: number;
    mistura: number;
  };
  equalizador: {
    ativo: boolean;
    graves: number;
    medios: number;
    agudos: number;
  };
}

export interface DispositivoMidi {
  id: string;
  nome: string;
  tipo: 'fisico' | 'virtual';
  status: 'conectado' | 'ocioso' | 'desconectado';
}

export interface MapeamentoMidi {
  id: string;
  parametro: string;
  cc: string;
}

export interface EstadoConfiguracoesGlobais {
  escala: string;
  tamanhoBuffer: number;
  latenciaEntrada: number;
  latenciaSaida: number;
  dispositivosMidi: DispositivoMidi[];
  mapeamentos: MapeamentoMidi[];
}

export interface EstadoFormularioFaturamento {
  nomeCompleto: string;
  email: string;
  senha?: string;
  pais: string;
  codigoPostal: string;
  metodoPagamento: 'cartao' | 'pix';
  numeroCartao: string;
  dataValidade: string;
  cvv: string;
  codigoCupom: string;
  cupomAplicado: boolean;
  ativo: boolean;
  chaveAtivacao?: string;
}
