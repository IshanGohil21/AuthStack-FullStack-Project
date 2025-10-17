import { Router } from "express";
import userRouters from "./user";
import validationRouter from "./validation";

const appRouter = Router();

appRouter.use("/users", userRouters)
appRouter.use("/validation", validationRouter)


export default appRouter;