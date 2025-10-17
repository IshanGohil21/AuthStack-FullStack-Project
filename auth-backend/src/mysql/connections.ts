import { createPool, Pool } from "mysql2/promise";
import { CREATE_TABLE_USERS } from "./tables";

let pool: Pool;

const connectToDatabase = async () => {
    try {
        pool = createPool({
            port: +process!.env!.MYSQL_PORT!,
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        })
        await pool.getConnection();
        console.log("Connected to MySQL database successfully");
        await pool.execute(CREATE_TABLE_USERS)
        console.log("Table user created!");
        

    } catch (error) {
        console.log("Error connecting to MySQL database:", error);
        throw error;
    }
};

export { connectToDatabase, pool };