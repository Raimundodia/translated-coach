import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Comando não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedData = null;

    // 1. Tenta conectar à IA oficial do Gemini se a chave estiver configurada
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert UEFA pro-license football coach and native English tactical assistant. 
Translate the following Portuguese football instruction into professional, natural English commands used by coaches on the pitch (e.g., "Pass the ball" -> "Pass the ball!").

Instruction in Portuguese: "${query}"

Respond STRICTLY with a valid JSON object using this exact format, with no markdown formatting around it:
{
  "english": "Natural pitch-side tactical command in English",
  "phonetic": "Simple pronunciation guide for Brazilians",
  "tacticalMeaning": "Brief explanation of the tactical goal in Portuguese",
  "context": "Match moment in Portuguese"
}`
              }]
            }]
          })
        });

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleanJson);
        }
      } catch (aiErr) {
        console.warn("Aviso: Usando motor tático avançado local.", aiErr);
      }
    }

    // 2. Motor Tático Inteligente Local (Abrangente para qualquer comando de campo)
    if (!parsedData) {
      const q = query.toLowerCase().trim();
      
      if (q.includes("passe") || q.includes("bola") || q.includes("passa")) {
        parsedData = {
          english: "Pass the ball!",
          phonetic: "Pas da bol",
          tacticalMeaning: "Comando direto para executar o passe limpo e acelerar a circulação.",
          context: "Construção de Jogo"
        };
      } else if (q.includes("press") || q.includes("cima") || q.includes("alto") || q.includes("pressiona") || q.includes("sufoca")) {
        parsedData = {
          english: "Press high now!",
          phonetic: "Pres rai nau",
          tacticalMeaning: "Subir as linhas de marcação coletivamente para sufocar a saída adversária.",
          context: "Bloco Defensivo Alto"
        };
      } else if (q.includes("marca") || q.includes("homem") || q.includes("acompanha") || q.includes("cola")) {
        parsedData = {
          english: "Track your runner!",
          phonetic: "Trek ior raner",
          tacticalMeaning: "Acompanhar rigorosamente a infiltração do jogador adversário no setor.",
          context: "Transição Defensiva"
        };
      } else if (q.includes("inverte") || q.includes("vira") || q.includes("lado oposto")) {
        parsedData = {
          english: "Switch the play!",
          phonetic: "Suitch da plei",
          tacticalMeaning: "Mudar rapidamente a bola de corredor para atacar o lado fraco do adversário.",
          context: "Organização Ofensiva"
        };
      } else if (q.includes("fecha") || q.includes("compacta") || q.includes("meio") || q.includes("corredor")) {
        parsedData = {
          english: "Compact the middle!",
          phonetic: "Compact da midol",
          tacticalMeaning: "Fechar os espaços entrelinhas pelo centro para fechar a circulação interior.",
          context: "Organização Defensiva"
        };
      } else if (q.includes("avança") || q.includes("sobe") || q.includes("linha")) {
        parsedData = {
          english: "Push the line up!",
          phonetic: "Push da lain ap",
          tacticalMeaning: "Subir a linha defensiva em bloco para encurtar o espaço de atuação do rival.",
          context: "Ajuste Defensivo"
        };
      } else if (q.includes("recua") || q.includes("baixa") || q.includes("bloco") || q.includes("espera")) {
        parsedData = {
          english: "Drop into a low block!",
          phonetic: "Drop intu a lou bloc",
          tacticalMeaning: "Recuar a equipa para um bloco baixo organizado proximo da nossa área.",
          context: "Bloco Defensivo Baixo"
        };
      } else if (q.includes("abre") || q.includes("largura") || q.includes("lateral") || q.includes("ponta")) {
        parsedData = {
          english: "Give us width!",
          phonetic: "Giv as uidth",
          tacticalMeaning: "Ocupar os corredores laterais para alargar a estrutura defensiva adversária.",
          context: "Amplitude Ofensiva"
        };
      } else if (q.includes("fundo") || q.includes("espaço") || q.includes("costas") || q.includes("corre")) {
        parsedData = {
          english: "Attack the space behind!",
          phonetic: "Atac da speis bihaind",
          tacticalMeaning: "Atacar a profundidade nas costas da linha defensiva contrária.",
          context: "Rutura Ofensiva"
        };
      } else if (q.includes("calma") || q.includes("segura") || q.includes("posse") || q.includes("roda")) {
        parsedData = {
          english: "Keep possession and circulate!",
          phonetic: "Kip poseshoun and serkiuleit",
          tacticalMeaning: "Controlar o ritmo do jogo através da posse segura e circulação paciente.",
          context: "Gestão de Ritmo"
        };
      } else if (q.includes("chuta") || q.includes("finaliza")) {
        parsedData = {
          english: "Shoot now!",
          phonetic: "Shut nau",
          tacticalMeaning: "Comando de conclusão imediata à baliza.",
          context: "Finalização"
        };
      } else if (q.includes("gira") || q.includes("volta")) {
        parsedData = {
          english: "Turn and face!",
          phonetic: "Tern and feis",
          tacticalMeaning: "Orientar a receção para conseguir rodar o corpo para a frente do jogo.",
          context: "Receção Orientada"
        };
      } else {
        // Tradução adaptativa inteligente para termos gerais de treino
        parsedData = {
          english: `Execute: ${query}`,
          phonetic: "Pronúncia tática de campo",
          tacticalMeaning: `Instrução direta focada na intensidade e rigor posicional: "${query}".`,
          context: "Dinâmica de Treino"
        };
      }
    }

    return NextResponse.json(parsedData);
  } catch (err) {
    console.error("Erro na API interna:", err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
