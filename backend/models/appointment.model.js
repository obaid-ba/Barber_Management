import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import { User } from "./user.model.js";

export const Appointment = sequelize.define(
  "Appointment",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    appointmentDate: { type: DataTypes.DATE },
    appointmentDay: { type: DataTypes.STRING }, // Monday, Tuesday, etc.
    appointmentTime: { type: DataTypes.STRING }, // 09:00, 10:00, etc.
    service: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled"),
      defaultValue: "Pending",
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "_id" },
    },
  },
  {
    tableName: "appointments",
    timestamps: true, // adds createdAt / updatedAt
  }
);

// Relations (the equivalent of Mongoose "ref")
Appointment.belongsTo(User, { foreignKey: "userId" });
