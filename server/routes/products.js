const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// GET ALL PRODUCTS (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, search, sort, limit } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: regex },
        { description: regex },
        { tags: regex }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'rating') sortOption.ratings = -1;

    let productsQuery = Product.find(query).sort(sortOption);
    if (limit) productsQuery = productsQuery.limit(Number(limit));
    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// ADD PRODUCT (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// UPDATE PRODUCT (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated successfully!', product });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// DELETE PRODUCT (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET FEATURED PRODUCTS
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router;