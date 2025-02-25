// startAriesAgent.js - Starts the Aries Agent
import setupAriesAgent from "./ariesAgent.js";

(async () => {
    try {
        await setupAriesAgent();
        console.log("✅ Aries Agent is running at http://localhost:3001");
    } catch (error) {
        console.error("❌ Error initializing Aries Agent:", error);
    }
})();
