import { generateAnalysis } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dataInput, dataType, timeRange, region } = body;

    if (!dataInput || dataInput.trim().length < 10) {
      return Response.json({ error: 'Insufficient data provided for pattern recognition.' }, { status: 400 });
    }

    const prompt = `You are an expert criminal pattern recognition and data analysis AI. Identify patterns, clusters, and anomalies in the following crime/behaviour data.

Data Type: ${dataType || 'General Crime Data'}
Time Range: ${timeRange || 'Unspecified'}
Region: ${region || 'Unspecified'}

Data Input:
${dataInput}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "totalPatterns": <number>,
  "clusters": [
    {
      "id": "<C1>",
      "name": "<cluster name>",
      "size": <number of records in cluster>,
      "description": "<cluster description>",
      "dominantFeature": "<most distinctive feature>",
      "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>"
    }
  ],
  "patterns": ["<pattern description 1>", "<pattern description 2>", "<pattern description 3>", "<pattern description 4>"],
  "anomalies": ["<anomaly1>", "<anomaly2>", "<anomaly3>"],
  "temporalTrend": "<description of time-based trend>",
  "geographicConcentration": "<geographic pattern if any>",
  "predictiveInsights": ["<insight1>", "<insight2>", "<insight3>"],
  "summary": "<comprehensive 3-4 sentence summary of findings>",
  "confidenceScore": <number 0-100>,
  "recommendedActions": ["<action1>", "<action2>", "<action3>"]
}`;

    const raw = await generateAnalysis(prompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pattern analysis failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
