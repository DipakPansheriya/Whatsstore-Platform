"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-website-builder', {
                serverSelectionTimeoutMS: 5000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            break;
        }
        catch (error) {
            console.error(`MongoDB connection error: ${error.message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                console.error('Failed to connect to MongoDB after 5 attempts.');
                process.exit(1);
            }
            // Wait for 5 seconds before retrying
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};
exports.default = connectDB;
