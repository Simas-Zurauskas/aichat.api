import { createRetrievalChain } from 'langchain/chains/retrieval';
import { llmDeepSeekR1, llmGemini, llmGpt4o } from './client';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { vectorStore } from './vectorStores';
import { LanguageModelLike } from '@langchain/core/language_models/base';
import { LLM } from '@models/Instance';

const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a knowledgeable assistant. The user may provide context from uploaded documents, which you should use to answer their questions as accurately as possible.
    When the context is unclear or incomplete, feel free to provide additional insights based on your general knowledge, but prioritize the provided context.
    User may leave additional settings for you to consider when answering their questions.
    User may also leave feedback on your responses, which you should take into account when generating new responses. The feedback can be 'negative', or 'positive'.
    \n\n
    User settings: {userSettings}
    \n\n
    Context: {context}`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
]);

export const createRChain = async (params: { instanceId: string; llmId: LLM }) => {
  const { instanceId, llmId } = params;

  let llm: LanguageModelLike;

  switch (llmId) {
    case LLM.GPT4O:
      llm = llmGpt4o;
      break;
    case LLM.GEMINI15PRO:
      llm = llmGemini;
      break;
    case LLM.R1:
      llm = llmDeepSeekR1;
      break;
    default:
      throw new Error(`Unsupported LLM: ${llmId}`);
  }

  const retriever = vectorStore.asRetriever({
    k: 10,
    filter: {
      instanceId,
    },
  });

  const combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt: questionAnsweringPrompt,
  });

  return await createRetrievalChain({
    retriever,
    combineDocsChain,
  });
};
