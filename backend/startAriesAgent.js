import setupAriesAgent from "./ariesAgent.js";

(async () => {
  try {
    await setupAriesAgent();
    console.log("✅ Aries Agent is running.");
  } catch (error) {
    console.error("❌ Error initializing Aries Agent:", error);
  }
})();
