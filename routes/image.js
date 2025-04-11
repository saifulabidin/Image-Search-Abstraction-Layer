// routes/image.js
const express = require('express');
const axios = require('axios');
const Search = require('../models/Search');
const router = express.Router();

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

router.get('/:query', async (req, res) => {
  const query = req.params.query;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * 10 + 1;

  // Simpan ke DB
  await Search.create({ term: query });

  try {
    const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: CX,
        q: query,
        searchType: 'image',
        start: startIndex,
      },
    });

    const results = data.items.map(item => ({
      image_url: item.link,
      description: item.title,
      page_url: item.image.contextLink,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

router.get('/recent/searches', async (req, res) => {
  const recent = await Search.find()
    .sort({ when: -1 })
    .limit(10)
    .select({ _id: 0, term: 1, when: 1 });

  res.json(recent);
});

module.exports = router;
