import { generateAnalysis } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceIP, destinationIP, port, protocol, payload, logEntries } = body;

    const prompt = `You are a cybersecurity and physical intrusion detection AI expert. Analyse the following intrusion data and return a structured JSON assessment.

Intrusion Data:
- Source IP: ${sourceIP || 'Unknown'}
- Destination IP: ${destinationIP || 'Unknown'}
- Port: ${port || 'Unknown'}
- Protocol: ${protocol || 'Unknown'}
- Payload Snippet: ${payload || 'None'}
- Log Entries: ${logEntries?.join('\n') || 'None provided'}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<concise 2-3 sentence analysis>",
  "intrusionType": "<classification of attack type>",
  "patterns": ["<pattern1>", "<pattern2>", "<pattern3>"],
  "anomalies": ["<anomaly1>", "<anomaly2>"],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "falsePositiveProbability": <number 0-100>,
  "affectedSystems": ["<sys1>", "<sys2>"],
  "mitreTechniques": ["<technique1>", "<technique2>"],
  "immediateActions": ["<action1>", "<action2>", "<action3>"]
}`;

    const raw = await generateAnalysis(prompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
