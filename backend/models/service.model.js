import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";

export const Service = sequelize.define(
  "Service",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    duration: { type: DataTypes.INTEGER, defaultValue: 30 }, // in minutes
    price: { type: DataTypes.FLOAT },
  },
  {
    tableName: "services",
    timestamps: false,
  }
);
