import { Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { readDb, writeDb } from "../utils/db";
import { randomUUID } from "crypto";

const router = Router();

/**
 * Create review
 */
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  const { objectId, text, rating } = req.body;

  if (!objectId || !text || !rating) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const db = await readDb();

  const newReview = {
    id: randomUUID(),
    objectId,
    userId: req.user!.userId,
    text,
    rating: Number(rating),
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);
  await writeDb(db);

  return res.status(201).json(newReview);
});

/**
 * Get my reviews
 */
router.get("/my", authenticateToken, async (req: AuthRequest, res) => {
  const db = await readDb();

  const myReviews = db.reviews.filter(
    (r) => r.userId === req.user!.userId
  );

  return res.json(myReviews);
});


// Get reviews for a specific object (book)
router.get("/object/:objectId", async (req, res) => {
  const { objectId } = req.params;

  const db = await readDb();
  const reviews = db.reviews.filter((r) => r.objectId === objectId);

  return res.json(reviews);
});

export default router;