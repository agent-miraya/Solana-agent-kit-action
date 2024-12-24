import { LIT_ABILITY, LIT_RPC } from "@lit-protocol/constants";
import { EthWalletProvider } from "@lit-protocol/lit-auth-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { getEnv, createPkp } from "./utils";
import { ethers } from "ethers";
import fs from "fs";
import { api } from "@lit-protocol/wrapped-keys";

const { generatePrivateKey, getEncryptedKey } = api;

const PKP_PUBLIC_KEY = getEnv("PKP_PUBLIC_KEY");
const PKP_ETHERS_ADDRESS = getEnv("PKP_ETHERS_ADDRESS");
const WRAPPED_KEY_ID = getEnv("WRAPPED_KEY_ID");
const RPC_URL = getEnv("RPC_URL");
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");
const LIT_ACTION = fs.readFileSync("./actions/agent.js");

// createPkp()
// createWrappedKey()
executeJsHandler()

async function createWrappedKey() {
    let pkpPublicKey = PKP_PUBLIC_KEY;
    const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
    const litNodeClient = new LitNodeClient({
        litNetwork: "datil-dev",
        debug: false,
    });

    try {
        await litNodeClient.connect();

        const ethersWallet = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        const authMethod = await EthWalletProvider.authenticate({
            signer: ethersWallet,
            litNodeClient: litNodeClient,
        });

        const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
            pkpPublicKey: pkpPublicKey,
            chain: "ethereum",
            authMethods: [authMethod],
            resourceAbilityRequests: [
                {
                    resource: new LitActionResource("*"),
                    ability: LIT_ABILITY.LitActionExecution,
                },
                {
                    resource: new LitPKPResource("*"),
                    ability: LIT_ABILITY.PKPSigning,
                },
            ],
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        });

        const wrappedKeyInfo = await generatePrivateKey({
            pkpSessionSigs,
            network: "solana",
            memo: "This is a test memo",
            litNodeClient: litNodeClient,
        });
        console.log("Wrapped Key Info: ", wrappedKeyInfo);
    } catch (error) {
        console.log("Error: ", error);
    } finally {
        await litNodeClient?.disconnect();
    }
}

async function executeJsHandler() {
    let pkpPublicKey = PKP_PUBLIC_KEY;
    const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
    const litNodeClient = new LitNodeClient({
        litNetwork: "datil-dev",
        debug: false,
    });

    try {
        await litNodeClient.connect();

        const ethersWallet = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY,
            new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        const authMethod = await EthWalletProvider.authenticate({
            signer: ethersWallet,
            litNodeClient: litNodeClient,
        });

        const pkpSessionSigs = await litNodeClient.getPkpSessionSigs({
            pkpPublicKey: pkpPublicKey,
            chain: "ethereum",
            authMethods: [authMethod],
            resourceAbilityRequests: [
                {
                    resource: new LitActionResource("*"),
                    ability: LIT_ABILITY.LitActionExecution,
                },
                {
                    resource: new LitPKPResource("*"),
                    ability: LIT_ABILITY.PKPSigning,
                },
            ],
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        });

        const {
            ciphertext: solanaCipherText,
            dataToEncryptHash: solanaDataToEncryptHash,
        } = await getEncryptedKey({
            pkpSessionSigs,
            litNodeClient: litNodeClient,
            id: WRAPPED_KEY_ID,
        });

        console.log("Solana Cipher Text: ", solanaCipherText);
        console.log("Solana Data To Encrypt Hash: ", solanaDataToEncryptHash);

        let accessControlConditions = {
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "",
            parameters: [":userAddress"],
            returnValueTest: {
                comparator: "=",
                value: PKP_ETHERS_ADDRESS,
            },
        };

        const response = await litNodeClient.executeJs({
            sessionSigs: pkpSessionSigs,
            code: LIT_ACTION.toString(),
            jsParams: {
                // MESSAGE: "Launch token names LIT with ticker $LIT on pump.fun with description 'hahaha, it worked!",
                MESSAGE: "What's my account's sol balance?",
                ciphertext: solanaCipherText,
                dataToEncryptHash: solanaDataToEncryptHash,
                accessControlConditions: [accessControlConditions],
                RPC_URL,
                OPENAI_API_KEY,
            },
        });

        console.log("Response: ", response);

        return response;
    } catch (error) {
        console.log("Error: ", error);
    } finally {
        await litNodeClient?.disconnect();
    }
}
