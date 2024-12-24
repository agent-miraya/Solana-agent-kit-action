// import { SolanaAgentKit, createSolanaTools } from "../solana-agent-kit/dist/index.js";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import bs58 from "bs58";

globalThis.SolanaAgentKit = SolanaAgentKit;
globalThis.createSolanaTools = createSolanaTools;
globalThis.bs58 = bs58;
globalThis.HumanMessage = HumanMessage;
globalThis.ChatOpenAI = ChatOpenAI;
globalThis.createReactAgent = createReactAgent;
