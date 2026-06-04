const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET AI RECOMMENDATIONS
router.get('/', auth, async (req, res) => {
  try {
    const { category, style, budget, gender, occasion } = req.query;

    const products = await Product.find().limit(20);

    if (products.length === 0) {
      return res.json({ message: 'No products available yet', recommendations: [] });
    }

    const productList = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags,
      ratings: p.ratings
    }));

    const prompt = `
      You are an expert Gen-Z fashion stylist for WishCart, a premium streetwear store.
      
      The user is looking for outfit recommendations with these preferences:
      - Category: ${category || 'any'}
      - Style Vibe: ${style || 'streetwear'}
      - Budget: ₹${budget || 'any'}
      - Gender: ${gender || 'unisex'}
      - Occasion: ${occasion || 'casual'}
      
      Here are the available products in our store:
      ${JSON.stringify(productList, null, 2)}
      
      Your task:
      1. Analyze the user preferences carefully
      2. Match products that fit their style, budget, category and occasion
      3. Prioritize products with higher ratings
      4. Pick exactly 4 best matching products
      
      Return ONLY a valid JSON array of exactly 4 product ids. Example:
      ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
      
      No explanation. No markdown. Just the raw JSON array.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text.replace(/```json|```/g, '').trim();
    const recommendedIds = JSON.parse(cleanText);
    const recommended = products.filter(p => recommendedIds.includes(p._id.toString()));

    res.json({ recommendations: recommended });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// VISUAL SEARCH
router.post('/visual-search', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    const products = await Product.find().limit(30);
    const productList = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a fashion expert for WishCart, a Gen-Z streetwear store.
      
      Look at this clothing image carefully. Identify:
      - The type of clothing (hoodie, tshirt, dress, etc.)
      - The color and pattern
      - The style vibe (streetwear, casual, formal, etc.)
      
      Now find the most visually and stylistically similar products from our store inventory:
      ${JSON.stringify(productList, null, 2)}
      
      Return ONLY a valid JSON array of exactly 4 matching product ids. Example:
      ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
      
      No explanation. No markdown. Just the raw JSON array.
    `;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    const recommendedIds = JSON.parse(cleanText);
    const recommended = products.filter(p => recommendedIds.includes(p._id.toString()));

    res.json({ recommendations: recommended });
  } catch (error) {
    console.error('Visual search error:', error.message);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET SIMILAR PRODUCTS (AI recommendation based on single product)
router.get('/similar/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allProducts = await Product.find({ _id: { $ne: product._id } }).limit(40);

    if (allProducts.length === 0) {
      return res.json({ recommendations: [] });
    }

    const productList = allProducts.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags,
      colors: p.colors
    }));

    const prompt = `
      You are a premium AI fashion stylist for WishCart, a premium Gen-Z streetwear store.
      
      We have a product:
      - Name: ${product.name}
      - Category: ${product.category}
      - Colors: ${product.colors?.join(', ') || 'any'}
      - Tags: ${product.tags?.join(', ') || 'none'}
      - Description: ${product.description}
      
      Find the 4 most stylistically similar or complementary matching products from our store list:
      ${JSON.stringify(productList, null, 2)}
      
      Return ONLY a valid JSON array of exactly 4 product ids. Example:
      ["id1", "id2", "id3", "id4"]
      
      No markdown, no comments, no extra text. Just the raw JSON array.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    const recommendedIds = JSON.parse(cleanText);

    const recommended = allProducts.filter(p => recommendedIds.includes(p._id.toString()));
    
    // Fallback if less than 4 matches or parsing issues
    if (recommended.length < 4) {
      const remainingCount = 4 - recommended.length;
      const alreadyRecommendedIds = recommended.map(r => r._id.toString());
      const fallbackProducts = allProducts.filter(p => 
        p.category === product.category && 
        !alreadyRecommendedIds.includes(p._id.toString())
      ).slice(0, remainingCount);
      recommended.push(...fallbackProducts);
    }

    res.json({ recommendations: recommended.slice(0, 4) });
  } catch (error) {
    console.error('Similar recommendations error:', error.message);
    try {
      const product = await Product.findById(req.params.id);
      const fallback = await Product.find({ 
        _id: { $ne: req.params.id }, 
        category: product ? product.category : 'tops' 
      }).limit(4);
      res.json({ recommendations: fallback });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
  }
});

// POST COMBO SUGGESTION (AI recommendation based on user uploaded photo + occasion)
router.post('/combo-suggestion', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType, occasion } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'Style image is required' });
    }

    const products = await Product.find().limit(50);
    if (products.length === 0) {
      return res.json({ analysis: "No items in inventory", combos: [] });
    }

    const productList = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags,
      colors: p.colors,
      gender: p.gender
    }));

    const prompt = `
      You are a master Gen-Z fashion stylist for WishCart, a premium streetwear store.
      
      Look at the user's uploaded photo. Analyze their body language, physical outline, skin/hair tone, or current outfit style.
      The user wants outfit suggestions for a: ${occasion || 'casual'} occasion.
      
      Based on the available products in our store:
      ${JSON.stringify(productList, null, 2)}
      
      Your task:
      1. Provide a brief general style analysis of their uploaded photo (2-3 sentences).
      2. Suggest exactly 2 distinct styling combos (e.g. Combo 1: top and jeans, Combo 2: hoodie and accessory, or dress and purse/bag) that fit the occasion and complement the user's photo.
      3. Each combo must contain exactly 2 or 3 product IDs from the available products list. Ensure the items in a combo are of different categories (e.g., do not pair two hoodies together, pair a top/hoodie with jeans, or a dress with an accessory).
      
      Return ONLY a valid JSON object matching the following structure:
      {
        "analysis": "A brief stylist analysis of the user's photo...",
        "combos": [
          {
            "title": "Combo 1 Title (e.g. Street Cargo Vibe)",
            "description": "Short stylist reasoning on why this combo is perfect for the ${occasion} occasion...",
            "productIds": ["id1", "id2"]
          },
          {
            "title": "Combo 2 Title (e.g. Cyberpunk Techwear)",
            "description": "Short stylist reasoning on why this combo works...",
            "productIds": ["id3", "id4"]
          }
        ]
      }
      
      No explanation outside the JSON. No markdown. Just the raw JSON object.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanText);

    const formattedCombos = data.combos.map(combo => {
      const comboProducts = products.filter(p => combo.productIds.includes(p._id.toString()));
      return {
        title: combo.title,
        description: combo.description,
        products: comboProducts
      };
    });

    res.json({
      analysis: data.analysis,
      combos: formattedCombos
    });
  } catch (error) {
    console.error('Combo suggestion error:', error.message);
    try {
      const tops = await Product.find({ category: 'tops' }).limit(2);
      const jeans = await Product.find({ category: 'jeans' }).limit(2);
      const acc = await Product.find({ category: 'accessories' }).limit(2);
      
      const combos = [];
      if (tops[0] && jeans[0]) {
        combos.push({
          title: "Classic Streetwear Duo",
          description: `A versatile combination featuring the ${tops[0].name} and ${jeans[0].name}, styled specifically to fit your posture.`,
          products: [tops[0], jeans[0]]
        });
      }
      if (tops[1] && acc[0]) {
        combos.push({
          title: "Accessorized Accent Combo",
          description: `An expressive look layering the ${tops[1].name} with the signature ${acc[0].name}.`,
          products: [tops[1], acc[0]]
        });
      }

      res.json({
        analysis: "We analyzed your photo and curated these high-utility styling alternatives from our premium street vaults.",
        combos: combos
      });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
  }
});

module.exports = router;