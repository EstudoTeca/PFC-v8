const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Substitua pela sua chave da API do Google AI Studio
const genAI = new GoogleGenerativeAI("SUA_CHAVE_AQUI");

router.post('/tutor', async (req, res) => {
    const { pergunta, contextoAno } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Configuração do "Personalidade" do Tutor
        const promptSistema = `
            Você é o Tutor IA da plataforma EstudoTeca. 
            Seu objetivo é ajudar alunos do Ensino Médio (1º ao 3º ano) e vestibulandos do ENEM.
            O aluno está no: ${contextoAno}.
            Regras:
            1. Seja didático e use exemplos práticos.
            2. Se o aluno pedir uma resposta de exercício, não dê apenas a resposta, explique o passo a passo.
            3. Use uma linguagem amigável, mas respeitosa.
            4. Se for algo fora do contexto escolar, tente trazer o assunto de volta para os estudos.
        `;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: promptSistema }] },
                { role: "model", parts: [{ text: "Entendido. Sou o Tutor da EstudoTeca e estou pronto para ensinar!" }] },
            ],
        });

        const result = await chat.sendMessage(pergunta);
        const response = await result.response;
        res.json({ resposta: response.text() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro na IA" });
    }
});

module.exports = router;

// ... (mantenha o código anterior do Chat Tutor)

// ROTA PARA CORREÇÃO DE REDAÇÃO
router.post('/corrigir-redacao', async (req, res) => {
    const { texto, tema } = req.body;

    const promptRedacao = `
        Aja como um corretor oficial do ENEM. Corrija a redação abaixo com o tema: "${tema}".
        Forneça a nota de 0 a 200 para cada uma das 5 competências do ENEM:
        1. Domínio da norma culta.
        2. Compreensão do tema.
        3. Organização das informações.
        4. Mecanismos linguísticos (coesão).
        5. Proposta de intervenção.
        
        Ao final, dê um feedback geral e a nota total (0-1000).
        Responda em formato JSON estruturado: 
        { "c1": 160, "c2": 200, "c3": 120, "c4": 160, "c5": 200, "total": 840, "feedback": "..." }
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([promptRedacao, texto]);
        // Limpar a resposta para garantir que seja um JSON puro
        const responseText = result.response.text().replace(/```json|```/g, "");
        res.json(JSON.parse(responseText));
    } catch (error) {
        res.status(500).json({ error: "Erro ao corrigir redação" });
    }
});

// ROTA PARA GERAR SIMULADO
router.post('/gerar-simulado', async (req, res) => {
    const { materia } = req.body;

    const promptSimulado = `
        Gere 3 questões de múltipla escolha de nível ENEM sobre: ${materia}.
        Retorne APENAS um JSON no seguinte formato:
        [
          { "pergunta": "...", "opcoes": ["A", "B", "C", "D"], "correta": 0, "explicacao": "..." }
        ]
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(promptSimulado);
        const responseText = result.response.text().replace(/```json|```/g, "");
        res.json(JSON.parse(responseText));
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar questões" });
    }
});