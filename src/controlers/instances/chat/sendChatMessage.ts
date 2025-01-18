import InstanceModel, { Message } from '@models/Instance';
import asynchandler from 'express-async-handler';
import { createRChain } from '@ai/retrievalChain';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).length;
};

const buildHistoryByWords = (messages: Message[], maxWords: number): Message[] => {
  const result: Message[] = [];
  let totalWords = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const msgWordCount = countWords(msg.content);

    if (totalWords + msgWordCount <= maxWords) {
      result.push(msg);
      totalWords += msgWordCount;
    } else {
      break;
    }
  }

  return result.reverse();
};

// ------------------------------------------------------------------
// @route POST /api/instances/:uxId/chat
// @access Private, Owner
export const sendChatMessage = asynchandler(async (req, res) => {
  try {
    const { uxId } = req.params;
    const userMessage = req.body.message as string;

    const instance = await InstanceModel.findOne({ uxId });

    if (!instance) {
      res.status(404);
      throw new Error('Instance not found');
    }

    const rchain = await createRChain(instance._id.toString());

    const truncatedHistory = buildHistoryByWords(instance.chat, 20000);

    const history: BaseMessage[] = truncatedHistory.map((msg) => {
      if (msg.role === 'ai') {
        const feedback = msg.feedback ? ` [User feedback: ${msg.feedback}]` : '';
        return new AIMessage(`${msg.content} ${feedback}`);
      }
      return new HumanMessage(msg.content);
    });

    const aiResponse = await rchain.invoke({
      input: userMessage,
      chat_history: history,
      userSettings: instance.userSettings ? `Additional user settings: ${instance.userSettings}` : '',
    });

    // ===== Save chat =====
    instance.chat.push({
      role: 'user',
      content: userMessage,
      date: new Date(),
    });

    instance.chat.push({
      role: 'ai',
      content: aiResponse.answer,
      date: new Date(),
    });
    await instance.save();
    const msg = instance.chat[instance.chat.length - 1];

    res.json({ data: msg });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
