import { OPENAI_KEY } from '@conf/env';
import { ChatOpenAI } from '@langchain/openai';

export const llm = new ChatOpenAI({
  model: 'gpt-4o', //o1-preview gpt-4o gpt-4o-mini
  temperature: 1,
  openAIApiKey: OPENAI_KEY,
});
