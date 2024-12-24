import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


globalThis.SolanaAgentKit = SolanaAgentKit;
globalThis.createSolanaTools = createSolanaTools;
globalThis.HumanMessage = HumanMessage;
globalThis.ChatOpenAI = ChatOpenAI;
globalThis.createReactAgent = createReactAgent;
