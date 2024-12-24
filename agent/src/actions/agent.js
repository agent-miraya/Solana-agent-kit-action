async function initializeAgent(SOLANA_PRIVATE_KEY) {
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
  });

  const solanaKit = new SolanaAgentKit(
    SOLANA_PRIVATE_KEY,
    RPC_URL,
    OPENAI_API_KEY
  );

  const tools = createSolanaTools(solanaKit);

  return createReactAgent({
    llm,
    tools,
  });
}

async function callAgent(SOLANA_PRIVATE_KEY, message) {
  const agent = await initializeAgent(SOLANA_PRIVATE_KEY);
  const config = { configurable: { thread_id: "Solana Agent Kit!" } };
  
  const stream = await agent.stream({
    
    messages: [new HumanMessage(`${message}`)]
  }, config);
  
  for await (const chunk of stream) {
    if ("agent" in chunk) {
      console.log(chunk.agent.messages[0].content);
    } else if ("tools" in chunk) {
      console.log(chunk.tools.messages[0].content);
    }
    console.log("-------------------");
  }
}

async function getPrivateKey() {
  const response = await Lit.Actions.call({
    ipfsId: "QmUJ74pTUqeeHzDGdfwCph1vJVNJ1rRzJdvMiTjS1BMwYj", // Lit Action for signing on Solana
    params: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
    },
});
console.log("",response);
return response;
}

/*
  This is the main function that runs the chat.
  * message
  * ciphertext
  * dataToEncryptHash
  * accessControlConditions
  * RPC_URL
  * OPENAI_API_KEY
*/
async function runChat() {
  try {
    const privateKey = await getPrivateKey()
    const response = await callAgent(privateKey, message)
    console.log("Response: ", response)
    Lit.Actions.setResponse({response: response})
  } catch (error) {
    Lit.Actions.setResponse({response: error.message})
  }
  }
  
  runChat().catch(console.error);
  