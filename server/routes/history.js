const express = require('express');
const router = express.Router();
const UserHistory = require('../models/UserHistory');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Track product view
router.post('/view', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    let history = await UserHistory.findOne({ user: req.user.userId });
    if (!history) history = new UserHistory({ user: req.user.userId, viewedProducts: [], searchHistory: [] });

    // Avoid duplicate consecutive views
    const alreadyViewed = history.viewedProducts.find(v => v.product.toString() === productId);
    if (!alreadyViewed) {
      history.viewedProducts.push({ product: productId });
      // Keep only last 20 views
      if (history.viewedProducts.length > 20) history.viewedProducts.shift();
    }
    await history.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track search query
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2) return res.json({ success: true });

    let history = await UserHistory.findOne({ user: req.user.userId });
    if (!history) history = new UserHistory({ user: req.user.userId, viewedProducts: [], searchHistory: [] });

    history.searchHistory.push({ query: query.trim() });
    // Keep only last 20 searches
    if (history.searchHistory.length > 20) history.searchHistory.shift();
    await history.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET For You recommendations
router.get('/for-you', auth, async (req, res) => {
  try {
    const history = await UserHistory.findOne({ user: req.user.userId })
      .populate('viewedProducts.product', 'name category tags price');

    const allProducts = await Product.find().limit(30);

    if (allProducts.length === 0) {
      return res.json({ recommendations: [], reason: 'No products available' });
    }

    const productList = allProducts.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags
    }));

    // Build user taste context
    let tasteContext = 'No history yet — recommend trending streetwear products.';
    if (history) {
      const views = history.viewedProducts
        .filter(v => v.product)
        .map(v => `${v.product.name} (${v.product.category})`)
        .join(', ');
      const searches = history.searchHistory
        .map(s => s.query)
        .join(', ');
      if (views || searches) {
        tasteContext = `
          Recently viewed products: ${views || 'none'}
          Recent searches: ${searches || 'none'}
        `;
      }
    }

    const prompt = `
      You are a personal AI stylist for WishCart, a Gen-Z streetwear store.
      
      Based on this user's taste profile:
      ${tasteContext}
      
      Analyze their interests — what categories, styles, and price ranges they prefer.
      Then recommend up to 6 most relevant products from our store:
      ${JSON.stringify(productList, null, 2)}
      
      Return ONLY a valid JSON array of up to 6 product ids.
      Example: ["id1", "id2", "id3", "id4", "id5", "id6"]
      No explanation. No markdown. Just the raw JSON array.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    let recommended = [];
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const match = text.match(/\[.*\]/s);
      const cleanText = match ? match[0] : text.replace(/```json|```/g, '').trim();
      const recommendedIds = JSON.parse(cleanText);
      recommended = allProducts.filter(p => recommendedIds.includes(p._id.toString()));
    } catch (aiError) {
      console.error('AI fallback for for-you page:', aiError.message);
      recommended = allProducts.slice(0, 6);
    }

    if (recommended.length === 0) {
      recommended = allProducts.slice(0, 6);
    }

    res.json({ recommendations: recommended, tasteContext });
  } catch (error) {
    console.error('For you page error:', error);
    res.status(500).json({ message: 'Failed to load recommendations', error: error.message });
  }
});

module.exports = router;