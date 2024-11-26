import express from "express";
const router = express.Router();

import { controllers } from "../../controllers";
import { verifyToken } from "@/middlewares/auth";

router.get('/profile', verifyToken, controllers.userController.getUserDetails);
router.put('/profile', verifyToken, controllers.userController.editOwnProfile);
router.get("/documents",verifyToken, controllers.userController.getAllDocumentsByUserId);

export default router;