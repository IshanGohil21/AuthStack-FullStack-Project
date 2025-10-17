import app from './app';
import { config } from 'dotenv';
import { connectToDatabase } from './mysql/connections';
import { initiliazeRedis } from './redis/connection';

config();

const init = async () => {
    try {
        await connectToDatabase();
        await initiliazeRedis();
        const PORT = process.env.PORT || 2108;
        app.listen(PORT, () =>
            console.log("Application is running on port: ", PORT)
        )
    } catch (error) {
        console.error("Error initializing the application:", error);
        process.exit(1); // Exit the process with failure
    }
}

init();