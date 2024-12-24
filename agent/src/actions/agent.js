async function initializeAgent(SOLANA_PRIVATE_KEY, RPC_URL, OPENAI_API_KEY) {
    console.log("Initializing Agent");

    const llm = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.7,
        openAIApiKey: OPENAI_API_KEY,
    });

    const base58PrivateKey = bs58.encode(Buffer.from(SOLANA_PRIVATE_KEY, 'hex'));

    const solanaKit = new SolanaAgentKit(
        base58PrivateKey,
        RPC_URL,
        OPENAI_API_KEY
    );

    const tools = createSolanaTools(solanaKit);
    return createReactAgent({
        llm,
        tools,
    });
}

async function callAgent(SOLANA_PRIVATE_KEY, RPC_URL, OPENAI_API_KEY, MESSAGE) {
    const agent = await initializeAgent(
        SOLANA_PRIVATE_KEY,
        RPC_URL,
        OPENAI_API_KEY
    );
    
    const config = { configurable: { thread_id: "Solana Agent Kit!" } };

    const stream = await agent.stream(
        {
            messages: [new HumanMessage(`${MESSAGE}`)],
        },
        config
    );

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
    const LIT_PREFIX = "lit_";
    const response = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        chain: "ethereum",
        authSig: null,
    });
    const privateKey = response.startsWith(LIT_PREFIX)
        ? response.slice(LIT_PREFIX.length)
        : response;
    return privateKey;
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
        const privateKey = await getPrivateKey();
        const response = await callAgent(
            privateKey,
            RPC_URL,
            OPENAI_API_KEY,
            MESSAGE
        );
        console.log("Response: ", response);
        Lit.Actions.setResponse({ response: response });
    } catch (error) {
        Lit.Actions.setResponse({ response: error.message });
    }
}

runChat().catch(console.error);
