// walletConfig.js
import path from 'path';

// Use the FABRIC_WALLET_PATH environment variable if defined,
// otherwise default to the "wallet" directory in the project root.
export const walletPath = path.resolve(process.cwd(), process.env.FABRIC_WALLET_PATH || 'wallet');

// You can export additional wallet-related configuration if needed.
// For example, if you later want to configure wallet type or options, you might do so here:
export const walletOptions = {
  // Example option: wallet type can be "FileSystemWallet" or "InMemoryWallet"
  type: 'FileSystemWallet',
};

