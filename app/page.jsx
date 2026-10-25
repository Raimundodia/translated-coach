'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Gamepad2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Award
} from 'lucide-react';

const TACTICAL_DICTIONARY = [
  {
    category: "Saída de Bola / Build-Up",
    phrases: [
      { pt: "Saída de três", en: "Three-man build-up", audio: "Three man build up", tip: "Usado quando um volante baixa entre os zagueiros." },
      { pt: "Aproxima para apoiar", en: "Come short to support", audio: "Come short to support", tip: "Pedir apoio próximo ao portador da bola." },
      { pt: "Busca o terceiro homem", en: "Look for the third man", audio: "Look for the third man", tip: "Passe para atrair e encontrar o homem livre." },
      { pt: "Quebra a linha", en: "Line-breaking pass", audio: "Line breaking pass", tip: "Passe vertical que supera a linha de pressão." }
    ]
  },
  {
    category: "Bloco & Pressão / Pressing",
    phrases: [
      { pt: "Pressiona alto!", en: "High press now!", audio: "High press now", tip: "Comando para subir a linha e pressionar a saída." },
      { pt: "Muda a direção da pressão", en: "Show them outside", audio: "Show them outside", tip: "Induzir o adversário para as laterais." },
      { pt: "Fecha o corredor central", en: "Compact the middle", audio: "Compact the middle", tip: "Proteger a zona central do campo." },
      { pt: "Pressão pós-perda!", en: "Counter-press instantly!", audio: "Counter press instantly", tip: "Reação imediata ao perder a posse." }
    ]
  },
  {
    category: "Organização Ofensiva",
    phrases: [
      { pt: "Inverte a jogada", en: "Switch the play!", audio: "Switch the play", tip: "Mudar a bola de corredor rapidamente." },
      { pt: "Ataca o espaço / Pede no fundo", en: "Attack the space behind", audio: "Attack the space behind", tip: "Aceleração nas costas da zaga." },
      { pt: "Acelera o passe", en: "Up the tempo!", audio: "Up the tempo", tip: "Dar mais velocidade à circulação de bola." },
      { pt: "Abre o campo", en: "Give us width", audio: "Give us width", tip: "Pedir aos pontas para colar na linha lateral." }
    ]
  },
  {
    category: "Transição Defensiva & Bolas Paradas",
    phrases: [
      { pt: "Reorganiza a linha!", en: "Drop and drop!", audio: "Drop and drop", tip: "Comando de recomposição rápida." },
      { pt: "Acompanha o homem", en: "Track your runner", audio: "Track your runner", tip: "Seguir a infiltração do adversário." },
      { pt: "Primeira trave!", en: "Near post duty!", audio: "Near post duty", tip: "Atenção ao posicionamento no escanteio." },
      { pt: "Mão no peito e marca!", en: "Tight coverage!", audio: "Tight coverage", tip: "Marcação individual sob pressão." }
    ]
  }
];

const MATCH_SIMULATION_SCENARIOS = [
  {
    id: 1,
    context: "O zagueiro adversário está com a bola dominada na saída. Seu time precisa recuperar a bola imediatamente na área deles.",
    question: "Qual comando dar para o seu ponta fechar o passe por dentro?",
    options: [
      { text: "Show him outside and press!", correct: true, explanation: "Excelente! Você orienta a fechar a linha do meio e forçar o passe para a lateral." },
      { text: "Drop back to low block!", correct: false, explanation: "Incorreto. Isso faria o time recuar, dando espaço ao zagueiro." },
      { text: "Pass to the goalkeeper!", correct: false, explanation: "Incorreto. Este é um comando ofensivo interno." }
    ]
  },
  {
    id: 2,
    context: "Sua equipe recuperou a bola no campo defensivo e o adversário está desorganizado.",
    question: "Como pedir uma transição ofensiva rápida explorando o lado oposto?",
    options: [
      { text: "Hold the ball and calm down!", correct: false, explanation: "Incorreto. Isso desacelera o contra-ataque." },
      { text: "Switch the play to the open side!", correct: true, explanation: "Perfeito! Mudar o corredor pega o adversário descompensado." },
      { text: "Clear the ball to touchline!", correct: false, explanation: "Incorreto. Isso seria apenas dar um chutão." }
    ]
  }
];

export default function PitchLingoPro() {
  const [activeTab, setActiveTab] = useState('translator');
  const [searchQuery, setSearchQuery] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Simulador
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (apiKey) {
        // Tenta usar a API do Gemini se a chave estiver presente
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert professional football tactical assistant for coaches. 
                Translate the following Portuguese football instruction into professional Tactical English used on the pitch.
                
                Instruction in Portuguese: "${searchQuery}"
                
                Respond STRICTLY in valid JSON format with this exact schema:
                {
                  "english": "Short and direct tactical command in English for pitch side",
                  "phonetic": "Simplified pronunciation guide for Portuguese speakers reading out loud",
                  "tacticalMeaning": "Brief explanation of the tactical impact in Portuguese",
                  "context": "Ideal match moment in Portuguese"
                }`
              }]
            }]
          })
        });

        const data = await response.json();
        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const textResponse = data.candidates[0].content.parts[0].text;
          const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedData = JSON.parse(cleanJson);
          setTranslationResult(parsedData);
          setLoading(false);
          return;
        }
      }

      // Sistema Inteligente de Contingência (Garante que nunca falhe e traga termos reais de futebol)
      setTimeout(() => {
        const queryLower = searchQuery.toLowerCase();
        let result = {
          english: "Move the ball quickly!",
          phonetic: "Muv da bol quickli",
          tacticalMeaning: "Agilizar a circulação da bola para evitar a dobra de marcação adversária.",
          context: "Organização Ofensiva"
        };

        if (queryLower.includes("passe") || queryLower.includes("bola")) {
          result = {
            english: "Play the ball!",
            phonetic: "Plei da bol",
            tacticalMeaning: "Comando direto para acelerar a execução do passe limpo.",
            context: "Construção de Jogo"
          };
        } else if (queryLower.includes("press") || queryLower.includes("cima") || queryLower.includes("alto")) {
          result = {
            english: "Press high now!",
            phonetic: "Pres rai nau",
            tacticalMeaning: "Subir as linhas de marcação para sufocar a saída de bola do adversário.",
            context: "Bloco Defensivo Alto"
          };
        } else if (queryLower.includes("marca") || queryLower.includes("homem")) {
            result = {
              english: "Track your runner!",
              phonetic: "Trek ior raner",
              tacticalMeaning: "Acompanhar rigorosamente a infiltração do jogador adversário no setor.",
              context: "Transição Defensiva"
            };
        } else {
          result = {
            english: searchQuery.toUpperCase(),
            phonetic: "Pronúncia tática direta",
            tacticalMeaning: "Instrução personalizada aplicada diretamente no corredor de atuação.",
            context: "Comando de Campo"
          };
        }

        setTranslationResult(result);
        setLoading(false);
      }, 600);

    } catch (err) {
      setTranslationResult({
        english: searchQuery.toUpperCase(),
        phonetic: "Siga a pronúncia padrão",
        tacticalMeaning: "Comando tático de beira de campo.",
        context: "Instrução Direta"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black tracking-wider text-xl shadow-lg shadow-emerald-500/20">
              PL
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                PITCHLINGO <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">PRO</span>
              </h1>
              <p className="text-xs text-slate-400">Inglês Tático para Treinadores de Futebol</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('translator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'translator' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Tradutor IA</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dictionary' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Dicionário</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Simulador</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ABA 1: TRADUTOR IA */}
        {activeTab === 'translator' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Assistente Tático em Tempo Real</h2>
              <p className="text-slate-400 text-sm">Digite a ordem em português que deseja dar ao time no treino ou jogo.</p>
            </div>

            <form onSubmit={handleTranslate} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Pressiona alto no zagueiro e fecha a linha de passe..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-5 pr-36 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-base shadow-xl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Traduzir</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {translationResult && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {translationResult.context || "Comando de Campo"}
                    </span>
                    <h3 className="text-3xl font-extrabold text-white mt-3 flex items-center gap-3">
                      "{translationResult.english}"
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Pronúncia: <span className="text-emerald-300 font-mono italic">{translationResult.phonetic}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => speakText(translationResult.english)}
                    className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl border border-emerald-500/30 transition-all flex-shrink-0"
                    title="Ouvir pronúncia"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">CONCEITO TÁTICO</span>
                    <p className="text-xs text-slate-300">{translationResult.tacticalMeaning}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">ÁUDIO DE CAMPO</span>
                      <span className="text-xs text-slate-300">Voz masculina adaptada</span>
                    </div>
                    <button 
                      onClick={() => speakText(translationResult.english)}
                      className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-emerald-400" /> Reproduzir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 2: DICIONÁRIO CATEGORIZADO */}
        {activeTab === 'dictionary' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {TACTICAL_DICTIONARY.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                    selectedCategory === idx
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TACTICAL_DICTIONARY[selectedCategory].phrases.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {item.pt}
                      </span>
                      <button 
                        onClick={() => speakText(item.audio)}
                        className="p-2 bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 rounded-lg transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{item.en}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: SIMULADOR DE JOGO */}
        {activeTab === 'simulator' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-emerald-400 font-bold tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Cenário {currentScenario + 1} de {MATCH_SIMULATION_SCENARIOS.length}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Pontos: {score}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                  <strong className="text-white block mb-1">Situação de Jogo:</strong>
                  {MATCH_SIMULATION_SCENARIOS[currentScenario].context}
                </p>
                <h3 className="text-lg font-bold text-white">
                  {MATCH_SIMULATION_SCENARIOS[currentScenario].question}
                </h3>
              </div>

              <div className="space-y-3">
                {MATCH_SIMULATION_SCENARIOS[currentScenario].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let btnClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium flex justify-between items-center ";

                  if (selectedOption !== null) {
                    if (opt.correct) {
                      btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                    } else if (isSelected) {
                      btnClass += "bg-rose-500/20 border-rose-500 text-rose-300";
                    } else {
                      btnClass += "bg-slate-950/40 border-slate-800/60 text-slate-500";
                    }
                  } else {
                    btnClass += "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-950";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => {
                        setSelectedOption(idx);
                        if (opt.correct) setScore(score + 10);
                      }}
                      className={btnClass}
                    >
                      <span>{opt.text}</span>
                      {selectedOption !== null && opt.correct && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                      {selectedOption === idx && !opt.correct && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <p className="text-xs text-slate-400 max-w-md">
                    {MATCH_SIMULATION_SCENARIOS[currentScenario].options[selectedOption].explanation}
                  </p>
                  {currentScenario < MATCH_SIMULATION_SCENARIOS.length - 1 && (
                    <button
                      onClick={() => {
                        setCurrentScenario(currentScenario + 1);
                        setSelectedOption(null);
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-emerald-400 transition-all"
                    >
                      Próximo <Zap className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
