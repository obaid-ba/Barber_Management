import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";

export const User = sequelize.define(
  "User",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    pwd: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "client", "barber"),
      allowNull: false,
      defaultValue: "client",
    },
  },
  {
    tableName: "users",
    timestamps: true, // adds createdAt / updatedAt
  }
);
