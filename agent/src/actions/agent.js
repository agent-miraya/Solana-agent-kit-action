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

    const response = {
        agent: [],
        tools: []
    };

    for await (const chunk of stream) {
        if ("agent" in chunk) {
            response.agent.push(chunk.agent.messages[0].content);
            console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
            response.tools.push(chunk.tools.messages[0].content);
            console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
    }
    return response;
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
 * Function that handles chat operations with solana agent kit
 * 
 * @param {string} message - The chat message to be processed
 * @param {string} ciphertext - Encrypted text data
 * @param {string} dataToEncryptHash - Hash of the data to be encrypted
 * @param {Object} accessControlConditions - Conditions determining access permissions
 * @param {string} RPC_URL - Remote Procedure Call URL for API communication
 * @param {string} OPENAI_API_KEY - Authentication key for OpenAI API integration
 * 
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
        Lit.Actions.setResponse({ response: JSON.stringify(response) });
    } catch (error) {
        Lit.Actions.setResponse({ response: error.message });
    }
}

runChat().catch(console.error);
