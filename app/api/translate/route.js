import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Comando não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor' }, { status: 500 });
    }

    // Lista de modelos para testar em ordem de prioridade
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    let data = null;
    let lastError = null;

    // Tenta cada modelo até que um funcione com sucesso
    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
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
                  }
                ]
              }
            ]
          })
        });

        const result = await response.json();
        if (!result.error && result.candidates) {
          data = result;
          break; // Sucesso! Encontrou um modelo compatível.
        } else {
          lastError = result.error?.message || "Erro desconhecido no modelo";
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!data) {
      throw new Error(lastError || "Nenhum modelo Gemini compatível foi encontrado para esta chave.");
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Sem resposta válida da IA");
    }

    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (err) {
    console.error("Erro na API interna:", err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
