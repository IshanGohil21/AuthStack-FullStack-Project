import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// KEY => 32 Bytes BASE64 -> convert into buffer -> env -> BASE64 -> BUFFER
// IV => 16 Bytes BASE64 -> convert into buffer -> dynamic -> BUFFER
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "base64");
const iv = crypto.randomBytes(16);
const algorithm = "aes-256-cbc";

export const encryptData = (data: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decryptData = ( encryptData: string ) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptData, "hex", "utf-8");
    decrypted += decipher.final("utf-8");   
    return decrypted;
};