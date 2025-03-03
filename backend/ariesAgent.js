import pkg from "@aries-framework/core";
const { Agent, HttpOutboundTransport, WsOutboundTransport } = pkg;
import { AskarModule } from "@aries-framework/askar"; // ✅ Import Askar for Wallet
import { agentDependencies } from "@aries-framework/node";
import dotenv from "dotenv";

dotenv.config();

// Ensure environment variables are loaded
console.log("🔍 Debug: Loaded Environment Variables:");
console.log("ARIES_AGENT_ENDPOINT:", process.env.ARIES_AGENT_ENDPOINT);

const setupAriesAgent = async () => {
  try {
    const agentConfig = {
      label: "VotingAgent",
      walletConfig: { id: "voting_wallet", key: "secure_wallet_key" },
      walletCredentials: { key: "secure_wallet_key" },
      endpoints: process.env.ARIES_AGENT_ENDPOINT
        ? [process.env.ARIES_AGENT_ENDPOINT]
        : ["http://localhost:3001"],
    };

    console.log("🔍 Debug: Aries Agent Config:", agentConfig);

    if (!agentConfig.endpoints || agentConfig.endpoints.length === 0) {
      throw new Error("❌ Aries Agent endpoint is not properly configured.");
    }

    const agent = new Agent({
      config: agentConfig,
      dependencies: agentDependencies,
      modules: {
        // ✅ Register Askar Wallet Module
        askar: new AskarModule(),
      },
    });

    agent.registerOutboundTransport(new HttpOutboundTransport());
    agent.registerOutboundTransport(new WsOutboundTransport());
    await agent.initialize();

    console.log(`✅ Hyperledger Aries Agent Initialized at ${agentConfig.endpoints[0]}`);
    return agent;
  } catch (error) {
    console.error("❌ Error initializing Aries Agent:", error);
    throw error;
  }
};

export default setupAriesAgent;
