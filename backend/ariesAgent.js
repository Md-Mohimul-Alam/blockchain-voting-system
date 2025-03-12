import { Agent, HttpOutboundTransport } from "@aries-framework/core";
import { AskarModule } from "@aries-framework/askar";
import { agentDependencies } from "@aries-framework/node";
import { HttpInboundTransport } from "@aries-framework/node"; // Ensure this is properly imported

async function setupAriesAgent() {
  const agent = new Agent({
    config: {
      label: "VotingAgent",
      walletConfig: {
        id: "voting_wallet",
        key: "secure_wallet_key",
      },
      walletCredentials: {
        key: "secure_wallet_key",
      },
      endpoints: ["http://localhost:3001"],
    },
    dependencies: agentDependencies, // ✅ Fix FileSystem issue by using correct dependencies
    modules: {
      askar: new AskarModule({
        multiWalletDatabaseScheme: "sqlite", // Ensure correct database type
      }),
    },
  });

  // ✅ Add transports
  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }));

  await agent.initialize();
  console.log("✅ Aries Agent is up and running!");
  return agent;
}

export default setupAriesAgent;
