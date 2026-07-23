import { generateAnalysis } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, gender, priorOffenses, behavioralIndicators, location, description, incidentType } = body;

    if (!description && !behavioralIndicators?.length) {
      return Response.json({ error: 'Insufficient data for analysis.' }, { status: 400 });
    }

    const prompt = `You are a criminal behaviour assessment expert AI. Analyse the following subject profile and return a JSON object with your assessment.

Subject Profile:
- Name/ID: ${name || 'Unknown'}
- Age: ${age || 'Unknown'}
- Gender: ${gender || 'Unknown'}
- Prior Offenses: ${priorOffenses || 0}
- Location: ${location || 'Unknown'}
- Incident Type: ${incidentType || 'Unknown'}
- Behavioral Indicators: ${behavioralIndicators?.join(', ') || 'None specified'}
- Description: ${description || 'None'}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence assessment>",
  "factors": ["<factor1>", "<factor2>", "<factor3>", "<factor4>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "behaviouralProfile": "<detailed paragraph>",
  "recidivismProbability": <number 0-100>,
  "threatCategory": "<threat category string>",
  "confidenceLevel": <number 0-100>
}`;

    const raw = await generateAnalysis(prompt);

    // Strip any markdown fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
