import { AgentConfig } from "@aries-framework/core";

const walletConfig = {
    id: "voting_wallet",        // Unique wallet ID
    key: "secure_wallet_key",   // Wallet encryption key
    storageType: "sqlite",      // Using SQLite for persistent storage
};

export default walletConfig;
