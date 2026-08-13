import express from 'express';
import youtubeSearchApi from 'youtube-search-api';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }

    // Search for 5 videos max to keep it quick
    const result = await youtubeSearchApi.GetListByKeyword(q, false, 5, [{type: 'video'}]);
    
    return res.status(200).json(result.items);
  } catch (error) {
    console.error("YouTube search error:", error);
    return res.status(500).json({ message: "Failed to search YouTube" });
  }
});

export default router;
