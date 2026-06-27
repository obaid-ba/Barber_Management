import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST || "localhost",
    port: process.env.PG_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected :)", process.env.PG_HOST || "localhost");
    // Creates the tables if they don't exist yet.
    await sequelize.sync();
    // Idempotently add columns introduced after the table was first created.
    // (Plain ALTER ... IF NOT EXISTS avoids the ENUM issues that `sync({ alter: true })` hits on Postgres.)
    await sequelize.query(
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;'
    );
    console.log("Models synced");
    await seedAdmin();
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

// Creates a default admin account if none exists yet.
// Dynamic imports avoid a circular dependency (the models import `sequelize` from this file).
const seedAdmin = async () => {
  const { User } = await import("../models/user.model.js");
  const bcrypt = (await import("bcryptjs")).default;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (existingAdmin) return;

  const salt = await bcrypt.genSalt(10);
  const hashedPwd = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", salt);
  await User.create({
    firstName: "Admin",
    lastName: "User",
    email: adminEmail,
    phone: "0000000000",
    pwd: hashedPwd,
    role: "admin",
  });
  console.log("Default admin created:", adminEmail);
};
