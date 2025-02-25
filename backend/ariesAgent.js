// ariesAgent.js - Setup Hyperledger Aries Agent
import { Agent, HttpOutboundTransport, WsOutboundTransport } from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const setupAriesAgent = async () => {
    const agentConfig = {
        label: "VotingAgent",
        walletConfig: {
            id: "voting_wallet",
            key: "secure_wallet_key",
        },
        walletCredentials: {
            key: "secure_wallet_key",
        },
        endpoints: [process.env.ARIES_AGENT_ENDPOINT || "http://localhost:3001"], // Load from .env
    };

    console.log("🔍 Debug: Aries Agent Config:", agentConfig); // Debug to check endpoints

    const agent = new Agent(agentConfig, agentDependencies);

    // Register transports
    agent.registerOutboundTransport(new HttpOutboundTransport());
    agent.registerOutboundTransport(new WsOutboundTransport());

    await agent.initialize();
    console.log(`✅ Hyperledger Aries Agent Initialized at ${agentConfig.endpoints[0]}`);
    return agent;
};

export default setupAriesAgent;
