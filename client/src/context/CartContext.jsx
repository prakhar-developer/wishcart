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
    setCart(prevCart => {
      const existing = prevCart.find(
        item => item.product._id === product._id && item.size === size
      )
      let newCart;
      if (existing) {
        newCart = prevCart.map(item =>
          item.product._id === product._id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newCart = [...prevCart, { product, size, quantity }]
      }
      localStorage.setItem('wishcart_cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (productId, size) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(
        item => !(item.product._id === productId && item.size === size)
      )
      localStorage.setItem('wishcart_cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity < 1) return removeFromCart(productId, size)
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.product._id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
      localStorage.setItem('wishcart_cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    localStorage.setItem('wishcart_cart', JSON.stringify([]))
  }

  const cartTotal = cart.reduce((acc, item) => {
    const activePrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price
    return acc + activePrice * item.quantity
  }, 0)

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