import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const handleWishlist = (e) => {
    e.preventDefault()
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product, product.sizes[0], 1)
  }

  return (
    <Link to={`/product/${product._id}`} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-pink-50">
      <div className="relative overflow-hidden bg-pink-50 aspect-[3/4]">
        <img
          src={product.images[0] || 'https://placehold.co/300x400?text=WishCart'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button onClick={handleWishlist} className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:scale-110 transition">
          {isInWishlist(product._id) ? '❤️' : '🤍'}
        </button>
        {product.discountPrice > 0 && (
          <div className="absolute top-3 left-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
        <button onClick={handleAddToCart} className="absolute bottom-0 left-0 right-0 bg-pink-500 text-white text-sm py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium">
          Quick Add 🛍️
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 capitalize mb-1">{product.category}</p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">₹{product.discountPrice > 0 ? product.discountPrice : product.price}</span>
          {product.discountPrice > 0 && <span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
        </div>
        {product.ratings > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-xs text-gray-500">{product.ratings.toFixed(1)} ({product.numReviews})</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductCard