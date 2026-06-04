const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  // TOPS
  {
    name: "Oversized 'Acid' Tee",
    description: "Heavyweight 240GSM cotton drop shoulder tee with a washed acid finish. The essential Gen-Z staple.",
    price: 1899,
    discountPrice: 1599,
    category: "tops",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Deep Sea", "Vintage White"],
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    stock: 50,
    ratings: 4.8,
    numReviews: 12,
    tags: ["streetwear", "oversized", "unisex"],
    isFeatured: true
  },
  {
    name: "Pixel Graphic Box Tee",
    description: "Boxy fit featuring a retro 8-bit digital heart graphic on the chest. Digital nostalgia at its best.",
    price: 1499,
    category: "tops",
    gender: "unisex",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80"],
    stock: 35,
    ratings: 4.5,
    numReviews: 8,
    tags: ["90s", "retro-gaming", "essential"],
    isFeatured: true
  },
  {
    name: "Cyberpunk Mesh Top",
    description: "Sheer tech-mesh layer with neon green stitch detailing. Perfect for layering under hoodies.",
    price: 1299,
    discountPrice: 999,
    category: "tops",
    gender: "female",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80"],
    stock: 20,
    ratings: 4.9,
    numReviews: 15,
    tags: ["cyberpunk", "techwear", "neon"],
    isFeatured: false
  },
  {
    name: "Vintage Band Tee",
    description: "Faded graphic tee inspired by late 90s grunge bands. Cracked print for that authentic worn-in feel.",
    price: 2200,
    category: "tops",
    gender: "unisex",
    sizes: ["M", "L", "XL", "XXL"],
    images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80"],
    stock: 40,
    ratings: 4.7,
    numReviews: 22,
    tags: ["vintage", "grunge", "merch"],
    isFeatured: false
  },
  {
    name: "Distressed Layered Tee",
    description: "Two-in-one look with raw edges and asymmetrical length. For when one layer isn't enough vibe.",
    price: 1650,
    category: "tops",
    gender: "male",
    sizes: ["M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
    stock: 15,
    ratings: 4.2,
    numReviews: 5,
    tags: ["layered", "asymmetric", "raw"],
    isFeatured: false
  },

  // JEANS / BOTTOMS
  {
    name: "Baggy Cargo Denims",
    description: "Wide legged cotton denim with massive utility pockets. The ultimate 'Baggy is Better' statement.",
    price: 3499,
    discountPrice: 2999,
    category: "jeans",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80"],
    stock: 25,
    ratings: 4.9,
    numReviews: 19,
    tags: ["baggy", "cargo", "denim"],
    isFeatured: true
  },
  {
    name: "Distressed Skater Jean",
    description: "Raw hem and knee-rip details for that 'just came from the park' look. Low-rise fit.",
    price: 2499,
    category: "jeans",
    gender: "unisex",
    sizes: ["XS", "S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80"],
    stock: 30,
    ratings: 4.4,
    numReviews: 11,
    tags: ["skate", "distressed", "y2k"],
    isFeatured: false
  },
  {
    name: "Acid Wash Flare",
    description: "High-waisted with a dramatic flare from the knee. Vintage 70s energy, Gen-Z execution.",
    price: 3200,
    category: "jeans",
    gender: "female",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80"],
    stock: 12,
    ratings: 4.8,
    numReviews: 7,
    tags: ["flare", "acid-wash", "high-waist"],
    isFeatured: true
  },
  {
    name: "Tech Joggers v2.0",
    description: "Water-repellent fabric with reflective buckle straps. Comfort met with futuristic utility.",
    price: 2899,
    category: "jeans",
    gender: "male",
    sizes: ["M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"],
    stock: 18,
    ratings: 4.6,
    numReviews: 9,
    tags: ["techwear", "jogger", "reflective"],
    isFeatured: false
  },

  // HOME DECOR
  {
    name: "Minimalist Ceramic Vase",
    description: "Handcrafted ceramic with matte finish. A sculptural piece that adds subtle elegance to any room.",
    price: 2699,
    discountPrice: 2200,
    category: "home-decor",
    gender: "unisex",
    sizes: [],
    images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"],
    stock: 14,
    ratings: 5.0,
    numReviews: 10,
    tags: ["ceramic", "vase", "decor"],
    isFeatured: true
  },
  {
    name: "Linen Table Runner",
    description: "Natural linen with subtle texture and dyed finish. Elevates any dining space with timeless sophistication.",
    price: 3100,
    category: "home-decor",
    gender: "unisex",
    sizes: [],
    images: ["https://images.unsplash.com/photo-1604628346881-b72b27e84530?w=800&q=80"],
    stock: 8,
    ratings: 4.3,
    numReviews: 4,
    tags: ["linen", "table-runner", "decor"],
    isFeatured: false
  },
  {
    name: "Woven Wall Hanging",
    description: "Handwoven tapestry with organic fibers and earthy tones. Creates visual interest and warmth on any wall.",
    price: 2899,
    category: "home-decor",
    gender: "unisex",
    sizes: [],
    images: ["https://images.unsplash.com/photo-1578500494158-246ddaa1d5cc?w=800&q=80"],
    stock: 22,
    ratings: 4.7,
    numReviews: 13,
    tags: ["woven", "wall-art", "tapestry"],
    isFeatured: false
  },

  // HOODIES
  {
    name: "Hyper-Oversized Hoodie",
    description: "So big you could live in it. Ultra-soft brushed fleece with 'WISH' tonal embroidery.",
    price: 3899,
    category: "hoodies",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    stock: 45,
    ratings: 4.9,
    numReviews: 31,
    tags: ["soft", "cozy", "extreme-oversized"],
    isFeatured: true
  },
  {
    name: "Cropped Zip-Up Fleece",
    description: "Y2K era silhouette with a boxy crop and wide silver zipper. Perfect for high-waisted look.",
    price: 2499,
    category: "hoodies",
    gender: "female",
    sizes: ["XS", "S", "M"],
    images: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"],
    stock: 20,
    ratings: 4.5,
    numReviews: 6,
    tags: ["crop", "zip-up", "fleece"],
    isFeatured: false
  },

  // ACCESSORIES
  {
    name: "Cyber-Visor Shades",
    description: "Wraparound silver frames with blue gradient lenses. Straight from the year 2099.",
    price: 1200,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1511499767390-a73359586433?w=800&q=80"],
    stock: 25,
    ratings: 4.8,
    numReviews: 18,
    tags: ["shades", "sunglasses", "futuristic"],
    isFeatured: true
  },
  {
    name: "Utility Tech Backpack",
    description: "Modular design with multi-clips and waterproof canvas. Technical and aesthetic.",
    price: 4500,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
    stock: 10,
    ratings: 4.9,
    numReviews: 14,
    tags: ["bag", "utility", "travel"],
    isFeatured: true
  },
  {
    name: "Silver Chain 'Orb' Link",
    description: "Chunky 316L stainless steel chain with a custom orb pendant. Does not tarnish.",
    price: 1500,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1611085583191-a3b1a30a5af4?w=800&q=80"],
    stock: 50,
    ratings: 5.0,
    numReviews: 25,
    tags: ["jewelry", "chain", "silver"],
    isFeatured: false
  },
  {
    name: "Neon Beanies",
    description: "Ribbed knit that fits tight. Bright enough to be seen from the moon.",
    price: 899,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80"],
    stock: 60,
    ratings: 4.4,
    numReviews: 9,
    tags: ["beanie", "hat", "neon"],
    isFeatured: false
  },
  {
    name: "Leather Harness Belt",
    description: "Vegan leather construction with heavy metal rings. Edgy detail for any oversized fit.",
    price: 1800,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1624333129523-0bad82f9f9ca?w=800&q=80"],
    stock: 5,
    ratings: 4.6,
    numReviews: 3,
    tags: ["harness", "belt", "edgy"],
    isFeatured: false
  },
  {
    name: "Logo Canvas Tote",
    description: "Eco-friendly thick canvas with minimal typography. The daily driver for Gen-Z.",
    price: 999,
    category: "accessories",
    gender: "unisex",
    images: ["https://images.unsplash.com/photo-1544816155-12df96467464?w=800&q=80"],
    stock: 100,
    ratings: 4.7,
    numReviews: 40,
    tags: ["tote", "eco", "clean-girl"],
    isFeatured: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products first
    await Product.deleteMany({});
    console.log('🗑️ Existing products cleared');

    // Add new products
    await Product.insertMany(products);
    console.log(`🚀 Seeded ${products.length} products successfully!`);

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
