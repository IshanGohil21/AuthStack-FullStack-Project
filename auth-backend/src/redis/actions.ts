import { redisClient } from "./connection";

const setCache = async( key:string, data: string, EX:number ) => {
    try {
        await redisClient.set(key, data, {EX});
        console.log("Redis- Set-Cache", key, "Value: ", data);
    } catch (error) {
        console.log("Error setting the cached data into Redis", error)
        throw error;
    }
};

const getCache = async(key: string) => {
    try {
        const value = await redisClient.get(key);
        console.log("Redis: GET-Chache", key, "Value:", value);
        return value;
    } catch (error) {
        console.log("Error getting the cached data from Redis", error);
        throw error;
    }
};

export { setCache, getCache };