import "dotenv/config";
import { auth } from "../lib/auth";

async function seed() {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        name: "admin",
        email: "bbolorchuluun065@gmail.com",
        password: "Tomntoms2000$$",
      },
    });
    console.log("Admin user created:", user.user.email);
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
  process.exit(0);
}

seed();
