import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { appName } = await req.json();

    if (!appName) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 });
    }

    const tavilyKey = process.env.TAVILY_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    if (!tavilyKey || !groqKey) {
      return NextResponse.json({ error: 'Missing API keys in .env.local' }, { status: 500 });
    }

    // Step A: Search documentation via Tavily
    const searchQuery = `${appName} oauth app setup developer documentation approval verification`;
    const searchRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: searchQuery,
        search_depth: 'advanced',
        max_results: 5,
      }),
    });

    if (!searchRes.ok) {
      const tavilyErr = await searchRes.json().catch(() => ({}));
      throw new Error(`Tavily Error (${searchRes.status}): ${tavilyErr.message || searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const context = searchData.results?.map((r: { url: string; content: string }) => 
      `Source (${r.url}):\n${r.content}`
    ).join('\n\n') || 'No docs found.';

    // Step B: Synthesize via Groq with typo resilience
    const prompt = `You are an expert integration engineer analyzing an OAuth provider.
The user submitted: "${appName}".
NOTE: The input might contain typos, misspellings, or missing letters (e.g., "ubspot" -> "HubSpot", "lienar" -> "Linear", "gogle" -> "Google"). 
First, identify the correct, intended SaaS platform and use its official canonical name.

Extracted Documentation Context:
${context}

Output ONLY raw JSON matching this schema (no markdown formatting, no \`\`\`json blocks):
{
  "slug": "string (canonical lowercase hyphenated name, e.g. 'hubspot', 'linear')",
  "appName": "string (The official, properly capitalized brand name, e.g. 'HubSpot', 'Linear')",
  "developerPortalUrl": "string (URL to dev portal or best guess from docs)",
  "category": "string",
  "complexity": "Low" | "Medium" | "High" | "Gatekept",
  "estimatedEffort": {
    "setupTime": "string (e.g. 15 mins)",
    "approvalWaitTime": "string (e.g. Instant / 2-4 weeks)"
  },
  "prerequisites": {
    "requiresPaidAccount": boolean,
    "requiresDomainVerification": boolean,
    "requiresPrivacyPolicyUrl": boolean,
    "requiresVideoDemo": boolean
  },
  "divisionOfLabor": {
    "agentCanAutomate": ["string"],
    "humanRequired": ["string"]
  },
  "steps": [
    {
      "stepNumber": 1,
      "title": "string",
      "instructions": "string",
      "gotchas": "string"
    }
  ],
  "evidence": {
    "confidenceLevel": "High (Verified Docs)" | "Medium (Inferred from Docs)" | "Uncertain / Community Sourced",
    "verifiedSources": ["URLs found in context"],
    "uncertainties": ["Things docs did not clarify"]
  }
}`;

    const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!llmRes.ok) {
      const groqErr = await llmRes.json().catch(() => ({}));
      throw new Error(`Groq Error (${llmRes.status}): ${groqErr.error?.message || llmRes.statusText}`);
    }

    const llmData = await llmRes.json();
    const content = llmData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('LLM returned an empty response.');
    }

    const guide = JSON.parse(content);
    return NextResponse.json({ guide });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}