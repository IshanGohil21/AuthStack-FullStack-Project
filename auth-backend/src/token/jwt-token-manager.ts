import jwt from 'jsonwebtoken';
import { generateRedisKey, generateTTL } from '../utils/helpers';
import { encryptData } from '../encryption';
import { setCache } from '../redis/actions';

export const generateJWTToken = (
    id: string, email: string, tokenType: "access | refresh") => {
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET_KEY!, {
        // @ts-ignore
        expiresIn: tokenType === "access" ? "1h" : "7d",
    });
    return token;
};

export const saveRefreshToken = async(token:string, encryptedToken:string) => {
    try {
    const decodedData = jwt.decode(token, {json: true});
    if (!token) throw new Error ("Unable to decode token");
    // @ts-ignore
    const key = generateRedisKey(decodedData.id);
    // @ts-ignore
    const TTL = generateTTL(decodedData.exp!);
    
        // @ts-ignore
        await setCache(key, encryptedToken, TTL);
        console.log("Refresh token saved successfully");
    } catch (error) {
        console.error("Error saving refresh token: ", error);
        throw error;
    }
};

