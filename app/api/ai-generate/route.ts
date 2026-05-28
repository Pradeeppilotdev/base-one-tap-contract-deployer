import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are a Solidity smart contract expert. Generate only valid Solidity 0.8.19 code.

Rules:
- Use pragma solidity ^0.8.19
- Include // SPDX-License-Identifier: MIT
- Output ONLY the Solidity code wrapped in a single markdown code block starting with \`\`\`solidity
- Do NOT include any explanations, introductions, or conclusions outside the code block
- The contract should be self-contained (no imports except what's inside the block)
- Keep it simple and gas-efficient
- Avoid external dependencies (no OpenZeppelin imports unless specifically asked)
- If the request is unclear, make reasonable assumptions and note them in a // comment inside the code block
- The contract must be compilable with Solidity 0.8.19

Example output format:
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    // ...
}
\`\`\``;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please describe the contract you want to generate' },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt too long. Maximum 2000 characters.' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured on the server' },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI generation failed: ${response.statusText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return NextResponse.json(
        { error: 'AI returned empty response. Try a more specific prompt.' },
        { status: 500 }
      );
    }

    // Extract Solidity code from markdown code block
    const codeMatch = text.match(/```solidity\n([\s\S]*?)```/);
    const sourceCode = codeMatch ? codeMatch[1].trim() : text.trim();

    // Extract contract name
    const nameMatch = sourceCode.match(/contract\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    const contractName = nameMatch ? nameMatch[1] : 'GeneratedContract';

    return NextResponse.json({
      sourceCode,
      contractName,
    });
  } catch (err: any) {
    console.error('AI generate error:', err);
    return NextResponse.json(
      { error: `Generation failed: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
