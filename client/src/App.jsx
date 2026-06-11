import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import HomeDecor from './pages/HomeDecor'
import Dress from './pages/Dress'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import OutfitBuilder from './pages/OutfitBuilder'
import ForYou from './pages/ForYou'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/dress" element={<Dress />} />
        <Route path="/home-decor" element={<HomeDecor />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/outfit-builder" element={<OutfitBuilder />} />
        <Route path="/for-you" element={<ForYou />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
      <Footer />

    </BrowserRouter>
  )
}

export default App