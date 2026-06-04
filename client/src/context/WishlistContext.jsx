import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('wishcart_wishlist')
    if (saved) setWishlist(JSON.parse(saved))
  }, [])

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist)
    localStorage.setItem('wishcart_wishlist', JSON.stringify(newWishlist))
  }

  const addToWishlist = (product) => {
    const exists = wishlist.find(item => item._id === product._id)
    if (!exists) saveWishlist([...wishlist, product])
  }

  const removeFromWishlist = (productId) => {
    saveWishlist(wishlist.filter(item => item._id !== productId))
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId)
  }

  return (
    <WishlistContext.Provider value={{
      wishlist, addToWishlist, removeFromWishlist, isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)