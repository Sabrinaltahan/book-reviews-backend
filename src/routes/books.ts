import { Router } from "express";

const router = Router();

router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q) {
    return res.status(400).json({ message: "Query required" });
  }

  try {
    const openLibraryRes = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`
    );

    if (!openLibraryRes.ok) {
      return res.status(openLibraryRes.status).json({
        message: "Open Library API error",
      });
    }

    const data = await openLibraryRes.json();

    const items = Array.isArray(data.docs)
      ? data.docs.slice(0, 10).map((book: any) => ({
          id: book.key?.replace("/works/", "") || crypto.randomUUID(),
          volumeInfo: {
            title: book.title || "Untitled",
            authors: book.author_name || ["Unknown author"],
            description: "",
            imageLinks: {
              thumbnail: book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : undefined,
            },
          },
        }))
      : [];

    return res.json({ items });
  } catch {
    return res.status(500).json({
      message: "Failed to fetch books",
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id || "").trim();

  if (!id) {
    return res.status(400).json({ message: "Book id required" });
  }

  try {
    const workRes = await fetch(`https://openlibrary.org/works/${id}.json`);

    if (!workRes.ok) {
      return res.status(workRes.status).json({
        message: "Failed to fetch book details",
      });
    }

    const work = await workRes.json();

    let authors: string[] = [];

    if (Array.isArray(work.authors)) {
      const authorResults = await Promise.all(
        work.authors.slice(0, 3).map(async (a: any) => {
          try {
            const authorKey = a.author?.key;
            if (!authorKey) return null;

            const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
            if (!authorRes.ok) return null;

            const authorData = await authorRes.json();
            return authorData.name || null;
          } catch {
            return null;
          }
        })
      );

      authors = authorResults.filter(Boolean);
    }

    return res.json({
      id,
      title: work.title || "Untitled",
      authors: authors.length > 0 ? authors : ["Unknown author"],
      description:
        typeof work.description === "string"
          ? work.description
          : work.description?.value || "",
      thumbnail: work.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
        : undefined,
    });
  } catch {
    return res.status(500).json({
      message: "Failed to fetch book details",
    });
  }
});

export default router;