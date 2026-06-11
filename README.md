# WishCart 🛍️✨

WishCart is a modern, AI-powered e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a premium shopping experience featuring an AI Outfit Builder, dynamic 3D elements, and a seamless checkout process.

## 🌟 Key Features

- **🛍️ E-Commerce Core**: Browse products, add to cart/wishlist, and place orders.
- **🤖 AI Outfit Builder**: Powered by Google Generative AI (Gemini), offering personalized style recommendations and outfit curation.
- **🔐 Modern Authentication**: Passwordless OTP login (via Resend) and Google Identity Services integration.
- **💳 Payments**: Integrated Razorpay for secure checkout.
- **🖼️ Media Management**: Cloudinary integration for scalable product image hosting.
- **📊 Admin Dashboard**: Full control over users, products, orders, and inventory.
- **✨ Premium UI**: Built with React, TailwindCSS, GSAP animations, and 3D elements using React Three Fiber.

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Animations & 3D**: GSAP, Three.js, React Three Fiber, React Three Drei
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs, google-auth-library
- **Integrations**: 
  - `@google/generative-ai` (AI Recommendations)
  - `resend` (Transactional Emails & OTP)
  - `razorpay` (Payment Gateway)
  - `cloudinary` & `multer` (Image Uploads)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary Account
- Razorpay Account
- Resend API Key
- Google Cloud Console Project (for OAuth)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/wishcart.git
cd wishcart
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
RESEND_API_KEY=your_resend_api_key
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env.local` file in the `/client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend development server:
```bash
npm run dev
```

## 📂 Project Structure

- `/client` - Contains all React frontend code, context providers, pages, and UI components.
- `/server` - Contains the Express backend, Mongoose models, authentication middleware, and API routes.

## 📜 License
This project is licensed under the MIT License.
