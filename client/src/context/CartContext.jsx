import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('wishcart_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('wishcart_cart', JSON.stringify(newCart))
  }

  const addToCart = (product, size, quantity = 1) => {
    const existing = cart.find(
      item => item.product._id === product._id && item.size === size
    )
    if (existing) {
      const updated = cart.map(item =>
        item.product._id === product._id && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
      saveCart(updated)
    } else {
      saveCart([...cart, { product, size, quantity }])
    }
  }

  const removeFromCart = (productId, size) => {
    saveCart(cart.filter(
      item => !(item.product._id === productId && item.size === size)
    ))
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity < 1) return removeFromCart(productId, size)
    const updated = cart.map(item =>
      item.product._id === productId && item.size === size
        ? { ...item, quantity }
        : item
    )
    saveCart(updated)
  }

  const clearCart = () => saveCart([])

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity, 0
  )

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)