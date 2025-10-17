import { Router } from "express";
import * as userHandler from '../handlers/users-handlers';
 
const userRouters = Router();

userRouters.get("/:id",  userHandler.getUser);

userRouters.post("/register", userHandler.registerUser);

userRouters.post("/login", userHandler.loginUser);

export default userRouters;