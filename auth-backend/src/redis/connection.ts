import { createClient } from "redis";

let redisClient = createClient();

const initiliazeRedis = async () => {
    try {
        redisClient.on("error", (err) => 
            console.log("Error event occured in redis", err)
        );
        await redisClient.connect();
        console.log("Connected to Redis successfully");
              
    } catch (error) {
        console.log("Error connecting to Redis:", error);
        throw error;    
        
    }
};

export { redisClient, initiliazeRedis };