import bcrypt from "bcrypt";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function generatePasswordHash() {
  try {
    console.log("🔐 Password Hash Generator");
    console.log("========================\n");

    const password = await askQuestion("Enter password to hash: ");

    if (!password.trim()) {
      console.log("❌ Password cannot be empty!");
      rl.close();
      return;
    }

    const saltRoundsInput = await askQuestion("Enter salt rounds (default: 12): ");
    let saltRounds = saltRoundsInput.trim() ? parseInt(saltRoundsInput) : 12;

    if (isNaN(saltRounds) || saltRounds < 1) {
      console.log("❌ Invalid salt rounds! Using default value 12.");
      saltRounds = 12;
    }

    console.log("\n⏳ Generating hash...");

    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log("\n✅ Password hash generated successfully!");
    console.log("=====================================");
    console.log(`Original password: ${password}`);
    console.log(`Salt rounds: ${saltRounds}`);
    console.log(`Hash: ${passwordHash}`);
    console.log("=====================================\n");

    const verify = await askQuestion("Do you want to verify this hash? (y/n): ");

    if (verify.toLowerCase() === "y" || verify.toLowerCase() === "yes") {
      const testPassword = await askQuestion("Enter password to verify: ");
      const isValid = await bcrypt.compare(testPassword, passwordHash);

      console.log(`\n🔍 Verification result: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    }
  } catch (error) {
    console.error("❌ Error generating hash:", error);
  } finally {
    rl.close();
  }
}

generatePasswordHash();
