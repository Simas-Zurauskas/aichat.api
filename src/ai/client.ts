import { DEEPSEEK_API_KEY, GEMINI_API_KEY, OPENAI_KEY } from '@conf/env';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import OpenAI from 'openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, ChatMessage } from '@langchain/core/messages';
import { ChatResult } from '@langchain/core/outputs';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: DEEPSEEK_API_KEY,
});

export const llmGemini = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-pro',
  apiKey: GEMINI_API_KEY,
});

export const llmGpt4o = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 1,
  openAIApiKey: OPENAI_KEY,
});

// ---------------------------------------------------
interface ChatDeepSeekParams {
  model?: string;
  temperature?: number;
}

export class ChatDeepSeek extends BaseChatModel {
  private deepseek: OpenAI;
  private model: string;
  private temperature: number;

  constructor(deepseek: OpenAI, params?: ChatDeepSeekParams) {
    super({});

    this.deepseek = deepseek;
    this.model = params?.model ?? 'deepseek-reasoner';
    this.temperature = params?.temperature ?? 0.7;
  }

  _llmType(): string {
    return 'deepseek';
  }

  async _generate(messages: ChatMessage[]): Promise<ChatResult> {
    const deepseekMessages = this._convertMessages(messages);

    const response = await this.deepseek.chat.completions.create({
      model: this.model,
      messages: deepseekMessages,
      temperature: this.temperature,
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    return {
      generations: [
        {
          text: content,
          message: new AIMessage(content),
        },
      ],
    };
  }

  private _convertMessages(messages: ChatMessage[]): Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }> {
    return messages.map((msg) => {
      let role: 'user' | 'assistant' | 'system' = 'user';
      if (msg._getType() === 'human') {
        role = 'user';
      } else if (msg._getType() === 'ai') {
        role = 'assistant';
      } else if (msg._getType() === 'system') {
        role = 'system';
      }

      let content = msg.content;
      if (typeof content !== 'string') {
        content = JSON.stringify(content);
      }

      return { role, content };
    });
  }
}

export const llmDeepSeekR1 = new ChatDeepSeek(deepseek, {
  model: 'deepseek-reasoner',
  temperature: 1,
});

export const llmDeepSeekV3 = new ChatDeepSeek(deepseek, {
  model: 'deepseek-chat',
  temperature: 1,
});
