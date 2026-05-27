import { PredefinicaoSintetizador, AjustesEfeitos } from './types';

class MotorSintetizador {
  private contextoAudio: AudioContext | null = null;
  private ganhoMaster: GainNode | null = null;
  private noFiltro: BiquadFilterNode | null = null;
  private noAnalisador: AnalyserNode | null = null;

  private osciladoresAtivos: Map<number, { oscilador: OscillatorNode; ganho: GainNode; nota: number }> = new Map();

  private noDelay: DelayNode | null = null;
  private retroalimentacaoDelay: GainNode | null = null;
  private misturaDelay: GainNode | null = null;

  private eqGraves: BiquadFilterNode | null = null;
  private eqMedios: BiquadFilterNode | null = null;
  private eqAgudos: BiquadFilterNode | null = null;

  private misturaReverb: GainNode | null = null;
  private delayReverb: DelayNode | null = null;
  private retroalimentacaoReverb: GainNode | null = null;

  private predefinicaoAtual: PredefinicaoSintetizador = {
    id: '1',
    nome: 'Neon Lead 01',
    categoria: 'Leads',
    autor: 'Aurora',
    tipo: 'Wavetable',
    formaOnda: 'sawtooth',
    desafinacao: 12.4,
    deslize: 30,
    frequenciaCorte: 850,
    ressonancia: 2.1,
    adsr: { ataque: 0.1, decaimento: 0.35, sustentacao: 0.65, liberacao: 0.4 }
  };

  private efeitosAtuais: AjustesEfeitos = {
    delay: { ativo: true, tempo: 450, retroalimentacao: 62, mistura: 30 },
    reverb: { ativo: true, tamanho: 8.0, decaimento: 3.2, mistura: 15 },
    chorus: { ativo: true, taxa: 1.2, profundidade: 40, mistura: 50 },
    equalizador: { ativo: true, graves: -3, medios: 4, agudos: 0 }
  };

  constructor() {}

  public inicializar() {
    if (this.contextoAudio) return;

    try {
      const ClasseContextoOuvido = window.AudioContext || (window as any).webkitAudioContext;
      this.contextoAudio = new ClasseContextoOuvido();

      this.noAnalisador = this.contextoAudio.createAnalyser();
      this.noAnalisador.fftSize = 256;

      this.ganhoMaster = this.contextoAudio.createGain();
      this.ganhoMaster.gain.setValueAtTime(0.4, this.contextoAudio.currentTime);

      this.noFiltro = this.contextoAudio.createBiquadFilter();
      this.noFiltro.type = 'lowpass';
      this.noFiltro.frequency.setValueAtTime(this.predefinicaoAtual.frequenciaCorte, this.contextoAudio.currentTime);
      this.noFiltro.Q.setValueAtTime(this.predefinicaoAtual.ressonancia, this.contextoAudio.currentTime);

      this.eqGraves = this.contextoAudio.createBiquadFilter();
      this.eqGraves.type = 'lowshelf';
      this.eqGraves.frequency.setValueAtTime(220, this.contextoAudio.currentTime);
      this.eqGraves.gain.setValueAtTime(this.efeitosAtuais.equalizador.graves, this.contextoAudio.currentTime);

      this.eqMedios = this.contextoAudio.createBiquadFilter();
      this.eqMedios.type = 'peaking';
      this.eqMedios.frequency.setValueAtTime(1200, this.contextoAudio.currentTime);
      this.eqMedios.Q.setValueAtTime(1.0, this.contextoAudio.currentTime);
      this.eqMedios.gain.setValueAtTime(this.efeitosAtuais.equalizador.medios, this.contextoAudio.currentTime);

      this.eqAgudos = this.contextoAudio.createBiquadFilter();
      this.eqAgudos.type = 'highshelf';
      this.eqAgudos.frequency.setValueAtTime(6000, this.contextoAudio.currentTime);
      this.eqAgudos.gain.setValueAtTime(this.efeitosAtuais.equalizador.agudos, this.contextoAudio.currentTime);

      this.noDelay = this.contextoAudio.createDelay(1.0);
      this.noDelay.delayTime.setValueAtTime(this.efeitosAtuais.delay.tempo / 1000, this.contextoAudio.currentTime);

      this.retroalimentacaoDelay = this.contextoAudio.createGain();
      this.retroalimentacaoDelay.gain.setValueAtTime(this.efeitosAtuais.delay.retroalimentacao / 100, this.contextoAudio.currentTime);

      this.misturaDelay = this.contextoAudio.createGain();
      const misturaAtivaDelay = this.efeitosAtuais.delay.ativo ? (this.efeitosAtuais.delay.mistura / 100) : 0;
      this.misturaDelay.gain.setValueAtTime(misturaAtivaDelay, this.contextoAudio.currentTime);

      this.delayReverb = this.contextoAudio.createDelay(1.0);
      this.delayReverb.delayTime.setValueAtTime(0.08, this.contextoAudio.currentTime);

      this.retroalimentacaoReverb = this.contextoAudio.createGain();
      this.retroalimentacaoReverb.gain.setValueAtTime(this.efeitosAtuais.reverb.decaimento / 6, this.contextoAudio.currentTime);

      this.misturaReverb = this.contextoAudio.createGain();
      const misturaAtivaReverb = this.efeitosAtuais.reverb.ativo ? (this.efeitosAtuais.reverb.mistura / 100) : 0;
      this.misturaReverb.gain.setValueAtTime(misturaAtivaReverb, this.contextoAudio.currentTime);

      this.noFiltro.connect(this.eqGraves);
      this.eqGraves.connect(this.eqMedios);
      this.eqMedios.connect(this.eqAgudos);
      this.eqAgudos.connect(this.ganhoMaster);

      this.eqAgudos.connect(this.noDelay);
      this.noDelay.connect(this.retroalimentacaoDelay);
      this.retroalimentacaoDelay.connect(this.noDelay);
      this.noDelay.connect(this.misturaDelay);
      this.misturaDelay.connect(this.ganhoMaster);

      this.eqAgudos.connect(this.delayReverb);
      this.delayReverb.connect(this.retroalimentacaoReverb);
      this.retroalimentacaoReverb.connect(this.delayReverb);
      this.delayReverb.connect(this.misturaReverb);
      this.misturaReverb.connect(this.ganhoMaster);

      this.ganhoMaster.connect(this.noAnalisador);
      this.noAnalisador.connect(this.contextoAudio.destination);
    } catch (e) {
      console.error(e);
    }
  }

  public obterAnalisador(): AnalyserNode | null {
    return this.noAnalisador;
  }

  public atualizarParametrosPredefinicao(predefinicao: PredefinicaoSintetizador) {
    this.predefinicaoAtual = { ...predefinicao };
    if (!this.contextoAudio || !this.noFiltro) return;

    const tempo = this.contextoAudio.currentTime;
    
    this.noFiltro.frequency.setTargetAtTime(predefinicao.frequenciaCorte, tempo, 0.05);
    this.noFiltro.Q.setTargetAtTime(Math.max(0.1, predefinicao.ressonancia), tempo, 0.05);

    for (const [_, voz] of this.osciladoresAtivos.entries()) {
      voz.oscilador.detune.setTargetAtTime(predefinicao.desafinacao, tempo, 0.03);
      voz.oscilador.type = predefinicao.formaOnda;
    }
  }

  public atualizarEfeitos(efeitos: AjustesEfeitos) {
    this.efeitosAtuais = { ...efeitos };
    if (!this.contextoAudio || !this.noDelay || !this.retroalimentacaoDelay || !this.misturaDelay || !this.eqGraves || !this.eqMedios || !this.eqAgudos || !this.misturaReverb || !this.delayReverb || !this.retroalimentacaoReverb) {
      return;
    }

    const tempo = this.contextoAudio.currentTime;

    this.noDelay.delayTime.setTargetAtTime(efeitos.delay.tempo / 1000, tempo, 0.05);
    this.retroalimentacaoDelay.gain.setTargetAtTime(efeitos.delay.retroalimentacao / 100, tempo, 0.05);
    const misturaEspelhoDelay = efeitos.delay.ativo ? (efeitos.delay.mistura / 100) : 0;
    this.misturaDelay.gain.setTargetAtTime(misturaEspelhoDelay, tempo, 0.05);

    this.delayReverb.delayTime.setTargetAtTime(0.04 + (efeitos.reverb.tamanho / 100), tempo, 0.05);
    this.retroalimentacaoReverb.gain.setTargetAtTime(Math.min(0.95, efeitos.reverb.decaimento / 5), tempo, 0.05);
    const misturaEspelhoReverb = efeitos.reverb.ativo ? (efeitos.reverb.mistura / 100) : 0;
    this.misturaReverb.gain.setTargetAtTime(misturaEspelhoReverb, tempo, 0.05);

    this.eqGraves.gain.setTargetAtTime(efeitos.equalizador.graves, tempo, 0.05);
    this.eqMedios.gain.setTargetAtTime(efeitos.equalizador.medios, tempo, 0.05);
    this.eqAgudos.gain.setTargetAtTime(efeitos.equalizador.agudos, tempo, 0.05);
  }

  public ativarNota(numeroNota: number) {
    this.inicializar();
    if (!this.contextoAudio || !this.noFiltro) return;

    if (this.contextoAudio.state === 'suspended') {
      this.contextoAudio.resume();
    }

    const tempo = this.contextoAudio.currentTime;
    const frequencia = 440 * Math.pow(2, (numeroNota - 69) / 12);

    if (this.osciladoresAtivos.has(numeroNota)) {
      this.desativarNota(numeroNota);
    }

    const oscilador = this.contextoAudio.createOscillator();
    oscilador.type = this.predefinicaoAtual.formaOnda;
    oscilador.frequency.setValueAtTime(frequencia, tempo);
    oscilador.detune.setValueAtTime(this.predefinicaoAtual.desafinacao, tempo);

    const ganhoVoz = this.contextoAudio.createGain();
    ganhoVoz.gain.setValueAtTime(0, tempo);

    oscilador.connect(ganhoVoz);
    ganhoVoz.connect(this.noFiltro);

    const { ataque, decaimento, sustentacao } = this.predefinicaoAtual.adsr;
    
    ganhoVoz.gain.cancelScheduledValues(tempo);
    ganhoVoz.gain.setValueAtTime(0, tempo);
    ganhoVoz.gain.linearRampToValueAtTime(0.4, tempo + Math.max(0.01, ataque));
    
    ganhoVoz.gain.setTargetAtTime(0.4 * sustentacao, tempo + Math.max(0.01, ataque), Math.max(0.01, decaimento));

    oscilador.start(tempo);

    this.osciladoresAtivos.set(numeroNota, { oscilador, ganho: ganhoVoz, nota: numeroNota });
  }

  public desativarNota(numeroNota: number) {
    if (!this.contextoAudio) return;
    const voz = this.osciladoresAtivos.get(numeroNota);
    if (!voz) return;

    const tempo = this.contextoAudio.currentTime;
    const { liberacao } = this.predefinicaoAtual.adsr;
    
    const ganhoVoz = voz.ganho;
    const valorGanhoAtual = ganhoVoz.gain.value;

    ganhoVoz.gain.cancelScheduledValues(tempo);
    ganhoVoz.gain.setValueAtTime(valorGanhoAtual, tempo);
    ganhoVoz.gain.setTargetAtTime(0, tempo, Math.max(0.01, liberacao));

    const oscilador = voz.oscilador;
    const atrasoParada = Math.max(0.05, liberacao * 4);
    
    setTimeout(() => {
      try {
        oscilador.stop();
        oscilador.disconnect();
        ganhoVoz.disconnect();
      } catch (err) {}
    }, atrasoParada * 1000);

    this.osciladoresAtivos.delete(numeroNota);
  }

  public desligarTodasNotas() {
    for (const [numeroNota, _] of this.osciladoresAtivos.entries()) {
      this.desativarNota(numeroNota);
    }
  }
}

export const synthEngine = new MotorSintetizador();
export default synthEngine;
