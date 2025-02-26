import pkg from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import { HttpOutboundTransport, WsOutboundTransport } from "@aries-framework/core";
import dotenv from "dotenv";

dotenv.config();

const setupAriesAgent = async () => {
  const agentConfig = {
    label: "VotingAgent",
    walletConfig: { id: "voting_wallet", key: "secure_wallet_key" },
    walletCredentials: { key: "secure_wallet_key" },
    endpoints: [process.env.ARIES_AGENT_ENDPOINT || "http://localhost:3001"],
  };

  console.log("🔍 Debug: Aries Agent Config:", agentConfig);

  const agent = new pkg.Agent(agentConfig, agentDependencies);
  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerOutboundTransport(new WsOutboundTransport());
  await agent.initialize();
  console.log(`✅ Hyperledger Aries Agent Initialized at ${agentConfig.endpoints[0]}`);
  return agent;
};

export default setupAriesAgent;
