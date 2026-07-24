import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Platform } from '../../generated/prisma/client';
import { buildPrompt, Dialect } from './prompts/platform-prompts';

export type AiProvider = 'GEMINI' | 'GROQ';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async generateForPlatform(
    text: string,
    platform: Platform,
    topic?: string | null,
    provider: AiProvider = 'GEMINI',
    dialect?: Dialect | null,
  ): Promise<string> {
    const prompt = buildPrompt(platform, text, topic, dialect);

    return provider === 'GROQ'
      ? this.callGroq(prompt)
      : this.callGemini(prompt);
  }

  private async callGemini(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    const model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      console.error(`Gemini API error (${res.status}):`, errorBody);
      throw new InternalServerErrorException(
        `AI generation failed: ${res.status}`,
      );
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generated) {
      throw new InternalServerErrorException('AI returned empty response');
    }

    return generated.trim();
  }

  private async callGroq(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    const model =
      this.config.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      console.error(`Groq API error (${res.status}):`, errorBody);
      throw new InternalServerErrorException(
        `AI generation failed: ${res.status}`,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const generated = data.choices?.[0]?.message?.content;

    if (!generated) {
      throw new InternalServerErrorException('AI returned empty response');
    }

    return generated.trim();
  }
}
