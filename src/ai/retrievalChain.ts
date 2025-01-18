import { createRetrievalChain } from 'langchain/chains/retrieval';
import { llm } from './client';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { vectorStore } from './vectorStores';

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

export const createRChain = async (instanceId: string) => {
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
