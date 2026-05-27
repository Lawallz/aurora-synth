import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, AlertTriangle, CheckCircle2, RefreshCw, Key } from 'lucide-react';
import { EstadoFormularioFaturamento } from '../types';

interface CheckoutPageProps {
  estadoFaturamento: EstadoFormularioFaturamento;
  definirEstadoFaturamento: React.Dispatch<React.SetStateAction<EstadoFormularioFaturamento>>;
  aoAtivarSucesso: (chave: string) => void;
  aoVoltar: () => void;
}

export default function CheckoutPage({
  estadoFaturamento,
  definirEstadoFaturamento,
  aoAtivarSucesso,
  aoVoltar
}: CheckoutPageProps) {
  const [cupom, definirCupom] = useState('');
  const [estaVerificando, definirEstaVerificando] = useState(false);
  const [mensagemErro, definirMensagemErro] = useState('');
  const [alturasBarras, definirAlturasBarras] = useState<number[]>([40, 60, 35, 85, 95, 45, 20, 70, 30, 50]);

  useEffect(() => {
    const temporizador = setInterval(() => {
      definirAlturasBarras((prev) => 
        prev.map(() => Math.floor(Math.random() * 80) + 20)
      );
    }, 180);

    return () => clearInterval(temporizador);
  }, []);

  const lidarAplicarCupom = () => {
    if (cupom.toUpperCase() === 'AURORA70') {
      definirEstadoFaturamento((prev) => ({
        ...prev,
        codigoCupom: 'AURORA70',
        cupomAplicado: true
      }));
      definirMensagemErro('');
    } else {
      definirMensagemErro('Cupom inválido! Experimente o código oficial: AURORA70');
    }
  };

  const lidarGatilhoAtivacao = () => {
    const { nomeCompleto, email } = estadoFaturamento;
    if (!nomeCompleto || !email) {
      definirMensagemErro('Por favor, preencha as Informações da Conta antes de prosseguir.');
      return;
    }

    definirEstaVerificando(true);
    definirMensagemErro('');

    setTimeout(() => {
      const letras = 'ABCDEF0123456789';
      let assinaturaRsa = 'AUR-';
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          assinaturaRsa += letras[Math.floor(Math.random() * letras.length)];
        }
        if (i < 3) assinaturaRsa += '-';
      }

      definirEstadoFaturamento((prev) => ({
        ...prev,
        ativo: true,
        chaveAtivacao: assinaturaRsa
      }));
      
      aoAtivarSucesso(assinaturaRsa);
      definirEstaVerificando(false);
    }, 2200);
  };

  const alternarAbaPagamento = (metodo: 'cartao' | 'pix') => {
    definirEstadoFaturamento((prev) => ({
      ...prev,
      metodoPagamento: metodo
    }));
  };

  const precoOriginal = 149.00;
  const valorDesconto = estadoFaturamento.cupomAplicado ? precoOriginal * 0.7 : 0;
  const precoTotal = precoOriginal - valorDesconto;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-sans font-bold text-2xl text-white mb-8 tracking-wide">
        FORMULÁRIO DE CADASTRO E FATURAMENTO
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <section className="lg:col-span-6 space-y-4">
          <div className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-[#353534]/30 pb-2">
              <User size={14} className="text-[#00f2ff]" />
              <h2 className="font-mono text-[10px] text-[#b9cacb]/80 font-bold uppercase tracking-wider">
                INFORMAÇÕES DA CONTA
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">NOME COMPLETO</label>
                <input 
                  type="text"
                  required
                  placeholder="Seu nome"
                  className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]/65"
                  value={estadoFaturamento.nomeCompleto}
                  onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, nomeCompleto: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">E-MAIL COMPLETO</label>
                <input 
                  type="email"
                  required
                  placeholder="exemplo@aurora-audio.com"
                  className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]/65"
                  value={estadoFaturamento.email}
                  disabled={estadoFaturamento.ativo}
                  onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">CONFIRMAR SENHA DE SEGURANÇA</label>
                <input 
                  type="password"
                  placeholder="••••••••••••"
                  className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]/65"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-[#353534]/30 pb-2">
              <MapPin size={14} className="text-[#00f2ff]" />
              <h2 className="font-mono text-[10px] text-[#b9cacb]/80 font-bold uppercase tracking-wider">
                ENDEREÇO DE FATURAMENTO
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">PAÍS</label>
                <select 
                  className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f2ff]/65"
                  value={estadoFaturamento.pais}
                  onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, pais: e.target.value }))}
                >
                  <option value="Brasil">Brasil</option>
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">CEP</label>
                <input 
                  type="text"
                  placeholder="00000-000"
                  className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]/65"
                  value={estadoFaturamento.codigoPostal}
                  onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, codigoPostal: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded p-4 shadow-md">
            <div className="flex items-center gap-2 mb-4 border-b border-[#353534]/30 pb-2">
              <CreditCard size={14} className="text-[#00f2ff]" />
              <h2 className="font-mono text-[10px] text-[#b9cacb]/80 font-bold uppercase tracking-wider">
                MÉTODO DE PAGAMENTO
              </h2>
            </div>

            <div className="flex gap-2 p-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg mb-4">
              <button
                type="button"
                onClick={() => alternarAbaPagamento('cartao')}
                className={`flex-1 py-2 font-mono text-[10px] rounded cursor-pointer transition-all ${
                  estadoFaturamento.metodoPagamento === 'cartao'
                    ? 'bg-[#2ff801] text-[#0f6d00] font-bold shadow-md'
                    : 'text-[#b9cacb] hover:bg-[#201f1f]'
                }`}
              >
                CARTÃO DE CRÉDITO
              </button>

              <button
                type="button"
                onClick={() => alternarAbaPagamento('pix')}
                className={`flex-1 py-1 px-1 py-2 font-mono text-[10px] rounded cursor-pointer transition-all ${
                  estadoFaturamento.metodoPagamento === 'pix'
                    ? 'bg-[#2ff801] text-[#0f6d00] font-bold shadow-md'
                    : 'text-[#b9cacb] hover:bg-[#201f1f]'
                }`}
              >
                PIX TRANSFERÊNCIA
              </button>
            </div>

            {estadoFaturamento.metodoPagamento === 'cartao' ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">NÚMERO DO CARTÃO</label>
                  <input 
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none focus:border-[#00f2ff]/65 w-full"
                    value={estadoFaturamento.numeroCartao}
                    onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, numeroCartao: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">VALIDADE</label>
                    <input 
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none"
                      value={estadoFaturamento.dataValidade}
                      onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, dataValidade: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] text-[#b9cacb]/50 uppercase tracking-wide">CVV / CÓDIGO</label>
                    <input 
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      className="bg-[#0e0e0e] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none"
                      value={estadoFaturamento.cvv}
                      onChange={(e) => definirEstadoFaturamento((prev) => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-3.5 bg-black/30 border border-dashed border-[#222] rounded-lg">
                <div className="w-40 h-40 bg-white p-2.5 rounded-md flex items-center justify-center shadow-lg">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_UsctyUNHgCcg5BEOruMjrqcKFIzGr6bb0PtI91jnQU3c8wU7Kby6F9Amxpi-nlThmUBJI-gTxd0dRUSQyfMzKcMob7bjFPYRKJsW6aQo4EauZjN43fbV05-xSl0EVG4DT70Oe3GuydABg3j4qJGMEX4mKXB-U_h-HYktarKMV88uDXhgf55oOHxahO5-iOxxTFfXa5tnJF9z85GG9PP4w8HJCvetn1HaDyZzhL1EX3-5DhBZMo7HsDPSZep9bwEMzQ6xNcjycAeb" 
                    alt="Pix QR Code" 
                    className="w-full h-full"
                  />
                </div>
                <p className="font-mono text-[9px] text-[#79ff5b] font-bold animate-pulse text-center leading-tight">
                  ESCANEIE O QR CODE ACIMA PARA PROCESSAR AUTOMATICAMENTE<br/>
                  OU INSIRA O CUPOM PARA OBTER DESCONTO
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-4 h-fit space-y-4">
          <div className="bg-[#1c1b1b] border-t border-l border-[#333] border-r border-[#000] border-b border-[#000] rounded-lg p-4 shadow-xl">
            <h2 className="font-mono text-xs text-white font-medium border-b border-[#353534] pb-3 mb-4 uppercase tracking-wider">
              RESUMO DO PEDIDO
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Licença Aurora Synth VST3/AU</span>
                  <span className="font-mono text-[8px] text-[#b9cacb]/40 uppercase tracking-widest mt-0.5 font-sans font-medium">
                    MOTOR DSP PROFISSIONAL
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-[#00f2ff]">{precoOriginal.toFixed(2)} USD</span>
              </div>

              <div className="border-t border-[#353534]/30 pt-3 space-y-2">
                <div className="flex justify-between font-mono text-[9px] text-[#b9cacb]/60">
                  <span>SUBTOTAL</span>
                  <span>{precoOriginal.toFixed(2)} USD</span>
                </div>
                
                {estadoFaturamento.cupomAplicado && (
                  <div className="flex justify-between font-mono text-[9px] text-[#79ff5b] font-bold">
                    <span>DESCONTO (70% OFF)</span>
                    <span>-{valorDesconto.toFixed(2)} USD</span>
                  </div>
                )}
                
                <div className="flex justify-between font-mono text-[9px] text-[#b9cacb]/60">
                  <span>IMPOSTO (0%)</span>
                  <span>0.00 USD</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="font-mono text-[8px] text-[#b9cacb]/50 uppercase tracking-wide">CUPOM DE DESCONTO</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ex. AURORA70"
                    disabled={estadoFaturamento.cupomAplicado}
                    className="flex-1 bg-[#0e0e0e] border border-[#2a2a2a] rounded px-2.5 py-1 text-xs text-white placeholder:text-[#b9cacb]/30 focus:outline-none uppercase"
                    value={cupom}
                    onChange={(e) => {
                      definirCupom(e.target.value);
                      if (mensagemErro) definirMensagemErro('');
                    }}
                  />
                  <button 
                    type="button"
                    onClick={lidarAplicarCupom}
                    disabled={estadoFaturamento.cupomAplicado || estaVerificando}
                    className="bg-[#2a2a2a] hover:bg-[#353534] disabled:opacity-50 text-[9px] font-mono text-white px-3 py-1 rounded cursor-pointer transition-colors border border-black"
                  >
                    {estadoFaturamento.cupomAplicado ? 'APLICADO' : 'APLICAR'}
                  </button>
                </div>
              </div>

              {mensagemErro && (
                <div className="text-[10px] text-red-400 font-mono mt-2 bg-red-950/20 border border-red-900/45 p-2 rounded flex items-center gap-1.5">
                  <AlertTriangle size={12} className="shrink-0" />
                  <span>{mensagemErro}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-[#353534] pt-4 mb-6">
              <span className="font-sans font-bold text-sm text-white">TOTAL</span>
              <span className="font-sans font-extrabold text-xl text-[#00f2ff]">{precoTotal.toFixed(2)} USD</span>
            </div>

            {estadoFaturamento.ativo ? (
              <div className="bg-[#79ff5b]/10 border border-[#79ff5b]/30 rounded-lg p-4 text-center space-y-2 mb-2">
                <div className="flex items-center justify-center gap-2 text-[#79ff5b] font-mono text-xs font-bold uppercase">
                  <CheckCircle2 size={16} /> LICENÇA ATIVADA COM SUCESSO!
                </div>
                <p className="font-mono text-[9px] text-[#b9cacb]/70 leading-relaxed uppercase">
                  SUA CHAVE RSA DA MÁQUINA É:
                  <strong className="block text-white text-xs font-bold mt-1 bg-black py-1.5 px-3 rounded select-all font-mono border border-[#333]">
                    {estadoFaturamento.chaveAtivacao}
                  </strong>
                </p>
                <button
                  onClick={aoVoltar}
                  className="mt-2 text-xs text-[#00f2ff] hover:underline cursor-pointer block w-full text-center"
                >
                  Voltar para o Sintetizador
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={lidarGatilhoAtivacao}
                disabled={estaVerificando}
                className="w-full bg-[#00f2ff] hover:bg-[#00dbe7] text-[#002022] font-semibold text-xs py-4 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:shadow-[0_0_25px_rgba(0,242,255,0.6)] cursor-pointer active:scale-[0.98] uppercase flex items-center justify-center gap-2"
              >
                {estaVerificando ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    CRIPTOGRAFANDO E GERANDO CHAVE...
                  </>
                ) : (
                  <>
                    FINALIZAR CADASTRO E GERAR CHAVE RSA
                    <Key size={14} className="stroke-[3px]" />
                  </>
                )}
              </button>
            )}

            <p className="font-mono text-[8px] text-[#b9cacb]/40 text-center mt-4 leading-relaxed uppercase">
              Ao cadastrar-se e finalizar, você concorda expressamente com o <br/>
              <strong className="text-[#b9cacb]/60 font-sans">Contrato de Licença de Usuário Final da Aurora Audio DSP</strong>.
            </p>
          </div>

          <div className="bg-black border border-[#222222] p-4 rounded-md shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[8px] text-[#00f2ff]/70 font-semibold uppercase tracking-wider">
                MATRIZ DO MOTOR DE CRIPTOGRAFIA
              </span>
              <span className={`font-mono text-[8px] font-bold ${estadoFaturamento.ativo ? 'text-[#79ff5b]' : 'text-orange-400'}`}>
                {estadoFaturamento.ativo ? 'ASSINATURA_SEGURA_GERADA' : 'AGUARDANDO_CONEXAO_CRIPTOGRAFICA'}
              </span>
            </div>

            <div className="h-14 w-full flex items-end gap-[1.5px] border-b border-[#222]/30">
              {alturasBarras.map((h, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-[#00f2ff] transition-all duration-150"
                  style={{ 
                    height: `${h}%`,
                    opacity: 0.15 + (i / alturasBarras.length) * 0.7
                  }}
                ></div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
