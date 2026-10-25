import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Comando não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedData = null;

    // Se houver chave, tenta conectar à IA oficial
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert professional football tactical assistant for coaches. 
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
        console.warn("Aviso: Falha na IA externa, ativando motor tático local.", aiErr);
      }
    }

    // Se a IA falhar ou a chave não estiver ativa, usa o Dicionário Tático Inteligente
    if (!parsedData) {
      const q = query.toLowerCase();
      
      if (q.includes("passe") || q.includes("bola") || q.includes("passa")) {
        parsedData = {
          english: "Pass the ball!",
          phonetic: "Pas da bol",
          tacticalMeaning: "Comando direto para executar o passe limpo e dar seguimento à circulação.",
          context: "Construção de Jogo"
        };
      } else if (q.includes("press") || q.includes("cima") || q.includes("alto") || q.includes("pressiona")) {
        parsedData = {
          english: "Press high now!",
          phonetic: "Pres rai nau",
          tacticalMeaning: "Subir as linhas de marcação coletivamente para sufocar a saída adversária.",
          context: "Bloco Defensivo Alto"
        };
      } else if (q.includes("marca") || q.includes("homem") || q.includes("acompanha")) {
        parsedData = {
          english: "Track your runner!",
          phonetic: "Trek ior raner",
          tacticalMeaning: "Acompanhar rigorosamente a infiltração do jogador adversário no setor.",
          context: "Transição Defensiva"
        };
      } else if (q.includes("inverte") || q.includes("vira")) {
        parsedData = {
          english: "Switch the play!",
          phonetic: "Suitch da plei",
          tacticalMeaning: "Mudar rapidamente a bola de corredor para atacar o lado fraco do adversário.",
          context: "Organização Ofensiva"
        };
      } else {
        parsedData = {
          english: query.toUpperCase(),
          phonetic: "Siga a pronúncia tática natural",
          tacticalMeaning: "Instrução personalizada aplicada diretamente no corredor de atuação.",
          context: "Comando de Campo"
        };
      }
    }

    return NextResponse.json(parsedData);
  } catch (err) {
    console.error("Erro na API interna:", err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
