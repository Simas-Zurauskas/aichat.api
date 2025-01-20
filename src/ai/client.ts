import { GEMINI_API_KEY, OPENAI_KEY } from '@conf/env';
import { ChatOpenAI } from '@langchain/openai';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const llmGemini = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-pro',
  apiKey: GEMINI_API_KEY,
});

export const llmGpt4o = new ChatOpenAI({
  model: 'gpt-4o', //o1-preview gpt-4o gpt-4o-mini
  temperature: 1,
  openAIApiKey: OPENAI_KEY,
});
