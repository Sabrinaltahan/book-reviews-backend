import { Router } from "express";
import Review from "../models/Review";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/my", authMiddleware, async (req: any, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.get("/object/:objectId", async (req, res) => {
  try {
    const reviews = await Review.find({
      objectId: req.params.objectId,
    }).sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { objectId, text, rating } = req.body;

    if (!objectId || !text || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReview = await Review.create({
      objectId,
      userId: req.user.userId,
      text,
      rating,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(newReview);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create review" });
  }
});

router.put("/:id", authMiddleware, async (req: any, res) => {
  try {
    const { text, rating } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    review.text = text ?? review.text;
    review.rating = rating ?? review.rating;

    await review.save();

    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update review" });
  }
});

router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await review.deleteOne();

    return res.json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;