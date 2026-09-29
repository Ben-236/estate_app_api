import "dotenv/config";
import landlordPrisma from "./src/config/landlordDatabase";

const main = async () => {
  try {
    await landlordPrisma.$connect();

    const userCount = await landlordPrisma.user.count();
    const estateCount = await landlordPrisma.estate.count();

    console.log("Landlord database connected");
    console.log("Users:", userCount);
    console.log("Estates:", estateCount);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await landlordPrisma.$disconnect();
  }
};

main();