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


/**
 * Update review (only owner)
 */
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { text, rating } = req.body as { text?: string; rating?: number };

  if (text === undefined && rating === undefined) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const db = await readDb();
  const review = db.reviews.find((r) => r.id === id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (review.userId !== req.user!.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (text !== undefined) review.text = text;
  if (rating !== undefined) review.rating = Number(rating);

  await writeDb(db);
  return res.json(review);
});

/**
 * Delete review (only owner)
 */
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const db = await readDb();
  const index = db.reviews.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (db.reviews[index].userId !== req.user!.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const deleted = db.reviews.splice(index, 1)[0];
  await writeDb(db);

  return res.json({ message: "Deleted", deleted });
});

export default router;