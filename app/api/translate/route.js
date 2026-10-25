import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Comando não fornecido' }, { status: 400 });
    }

    // Lê a chave privada do servidor (sem NEXT_PUBLIC_)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor' }, { status: 500 });
    }

    // Chamada segura feita exclusivamente pelo servidor para o Gemini
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
        })
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Sem resposta da IA");
    }

    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (err) {
    console.error("Erro na API interna:", err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
