import { PINECONE_API_KEY, PINECONE_INDEX_NAME } from '@conf/env';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { embeddings } from './embeddings';

const pc = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const pineconeIndex = pc.index(PINECONE_INDEX_NAME);

let vectorStore: PineconeStore;

(async () => {
  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  // pc.deleteIndex(PINECONE_INDEX_NAME);
})();

export { vectorStore };
