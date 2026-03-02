import { Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
const router = Router();

router.get("/my", authenticateToken, (req: AuthRequest, res) => {
  return res.json({
    message: "You are authenticated ✅",
    user: req.user,
  });
});

export default router;