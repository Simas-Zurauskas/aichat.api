import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

export const bufferToDocs = async (params: { buffer: Buffer; mimetype: string }) => {
  const { buffer, mimetype } = params;

  const fileBlob = new Blob([buffer], { type: mimetype });
  let docs: Document[] = [];

  if (mimetype === 'application/pdf') {
    const loader = new PDFLoader(fileBlob);
    docs = await loader.load();
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const loader = new DocxLoader(fileBlob);
    docs = await loader.load();
  } else {
    throw new Error('Unsupported file type');
  }

  const splitDocs = await textSplitter.splitDocuments(docs);

  return splitDocs;
};
