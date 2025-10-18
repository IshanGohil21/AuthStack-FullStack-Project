import { Request, Response } from "express";
import { pool } from "../mysql/connections";
import { GET_USER_BY_EMAIL, GET_USER_BY_ID } from "../mysql/queries";
import { INSERT_USER_STATEMENT } from "../mysql/mutations";
import bcrypt from "bcrypt";
import { generateJWTToken, saveRefreshToken } from "../token/jwt-token-manager";
import { encryptData } from "../encryption";

const setCookies = (accessToken: string, refreshToken: string, res: Response,) => {
    res.clearCookie(
        'access_token',
        {
            domain: 'localhost',
            httpOnly: true,
            path: '/',

        });

    res.clearCookie(
        'refresh_token',
        {
            domain: 'localhost',
            httpOnly: true,
            path: '/',

        });

    const expiryAccessToken = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour

    res.cookie("access_token", accessToken,
        {
            domain: "localhost",
            httpOnly: true,
            path: '/',
            expires: expiryAccessToken,
            sameSite: 'lax',
        });

    const expiryRefreshToken = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    res.cookie("refresh_token", refreshToken,
        {
            domain: "localhost",
            httpOnly: true,
            path: '/',
            expires: expiryRefreshToken,
            sameSite: 'lax',
        });
    return;

};

const setAuthTokens = async (id: string, email: string, res: Response) => {
    try {
        // @ts-ignore
        const accessToken = generateJWTToken(id, email, "access");
        // @ts-ignore
        const refreshToken = generateJWTToken(id, email, "refresh");
        const encryptedToken = encryptData(refreshToken);
        await saveRefreshToken(refreshToken, encryptedToken);
        setCookies(accessToken, encryptedToken, res);

    } catch (error) {
        console.log("Error setting auth tokens: ", error);
        throw error;
    }
}

const getUserBy = async (by: "email" | "id", value: string) => {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(
            by === "email" ? GET_USER_BY_EMAIL : GET_USER_BY_ID,
            [value]
        );
        // @ts-ignore
        const user = result[0][0];
        console.log("User Retrived: ", user);
        return user;
    } catch (error) {
        console.error(`Error retrieving user by ${by}:`, error);
        throw error;
    }
}

const getUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const user = await getUserBy("id", id);
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "User not found" });
        }
        return res.status(200).json({ message: `User retrived`, user });

    } catch (error) {
        console.log("Error retrieving user: ", error);
        res.status(500).json({ message: "Error retrieving user" });
        throw error;
    }
};

const registerUser = async (req: Request, res: Response) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(422).json({ message: "Data Missing" });
        }

        const user = await getUserBy("email", email);
        if (user) {
            console.log("User already exists", user);
            return res.status(401).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const conn = await pool.getConnection();
        const result = await conn.query(INSERT_USER_STATEMENT, [name, email, hashedPassword]);
        console.log("User data processed successfully: ", result);

        // set Token
        // @ts-ignore
        const insertID = result[0].insertId as number;
        await setAuthTokens(String(insertID), email, res);

        return res.status(200).json({ message: `User retrived`, user: result[0] });

    } catch (error) {
        console.log("Error retrieving user: ", error);
        res.status(500).json({ message: "Error retrieving user" });
        throw error;
    }

}

const loginUser = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ message: "Data Missing" });
        }

        const user = await getUserBy("email", email);
        console.log("User found: ", user);

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        // set Token
        await setAuthTokens(String(user.id), user.email, res);

        return res.status(200).json({ message: `Login Successfull`, user });

    } catch (error) {
        console.log("Error retrieving user: ", error);
        res.status(500).json({ message: "Error retrieving user" });
        throw error;
    }
}

export { getUser, registerUser, loginUser };