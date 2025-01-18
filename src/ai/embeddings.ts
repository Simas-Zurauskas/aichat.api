import { OPENAI_KEY } from '@conf/env';
import { OpenAIEmbeddings } from '@langchain/openai';

export const embeddings = new OpenAIEmbeddings({
  //   model: 'gpt-4o',
  model: 'text-embedding-3-small',
  openAIApiKey: OPENAI_KEY,
});
