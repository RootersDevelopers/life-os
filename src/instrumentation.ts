export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { seedIfNeeded } = await import("@/lib/seed");
      await seedIfNeeded();
      console.log("[lifeos] seed check complete");
    } catch (e) {
      console.error("[lifeos] seed failed", e);
    }
  }
}
