# 🛒 ShopEase — E-Commerce Web Application

A full-stack e-commerce web application built with **React**, **Node.js/Express**, and **MongoDB**.

---

## ✨ Features

### 👤 User Features
- Register & Login with JWT authentication
- Browse products with search, category filter, and price range filter
- Product detail page with ratings and customer reviews
- Add to cart, update quantities, remove items
- 3-step checkout (Shipping → Payment → Review)
- View order history and order status
- Update profile, address, and password

### ⚙️ Admin Features
- Admin dashboard with stats (revenue, orders, users, products)
- Manage Products — create, edit, delete with image preview
- Manage Orders — update order status (Pending → Processing → Shipped → Delivered)
- Role-based access control (Admin / User)

### 🔧 Technical Features
- RESTful API with Express
- JWT authentication with protected routes
- Password hashing with bcryptjs
- MongoDB with Mongoose ODM
- React Context API (AuthContext + CartContext)
- Axios interceptors for auto token injection
- Responsive design (mobile, tablet, desktop)

---

## 🗂️ Project Structure

```
e commerce/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── cartController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # protect + adminOnly
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   └── Cart.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── cartRoutes.js
│   │   ├── server.js             # Express app entry point
│   │   └── seed.js               # Database seeder
│   ├── .env                      # Environment variables (not committed)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/                  # Axios API modules
│   │   │   ├── axios.js          # Base instance + interceptors
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── cartApi.js
│   │   │   └── orderApi.js
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   ├── Spinner.js
│   │   │   └── Message.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── ProductDetailPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── OrderConfirmationPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── MyOrdersPage.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── ManageProducts.js
│   │   │       └── ManageOrders.js
│   │   ├── App.js                # Routes + providers
│   │   ├── App.css               # Global styles
│   │   └── index.js
│   └── package.json
│
├── .gitignore
├── package.json                  # Root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In the backend folder, create .env from the example:
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
```

### 3. Seed the Database (optional but recommended)

```bash
cd backend
node src/seed.js
```

This creates **8 sample products** and **2 accounts**:

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@ecommerce.com      | admin123  |
| User  | user@ecommerce.com       | user123   |

### 4. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev       # with nodemon (auto-restart)
# or
npm start         # without nodemon

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint        | Access        | Description        |
|--------|-----------------|---------------|--------------------|
| POST   | /register       | Public        | Register new user  |
| POST   | /login          | Public        | Login user         |
| GET    | /profile        | Private       | Get user profile   |
| PUT    | /profile        | Private       | Update profile     |
| GET    | /users          | Admin         | Get all users      |
| DELETE | /users/:id      | Admin         | Delete user        |

### Products — `/api/products`
| Method | Endpoint            | Access  | Description           |
|--------|---------------------|---------|-----------------------|
| GET    | /                   | Public  | Get all products      |
| GET    | /featured           | Public  | Featured products     |
| GET    | /categories         | Public  | All categories        |
| GET    | /:id                | Public  | Single product        |
| POST   | /                   | Admin   | Create product        |
| PUT    | /:id                | Admin   | Update product        |
| DELETE | /:id                | Admin   | Delete product        |
| POST   | /:id/reviews        | Private | Add review            |

### Orders — `/api/orders`
| Method | Endpoint        | Access  | Description           |
|--------|-----------------|---------|------------------------|
| POST   | /               | Private | Create order           |
| GET    | /myorders       | Private | My orders              |
| GET    | /stats          | Admin   | Order statistics       |
| GET    | /               | Admin   | All orders             |
| GET    | /:id            | Private | Order by ID            |
| PUT    | /:id/pay        | Private | Mark as paid           |
| PUT    | /:id/status     | Admin   | Update order status    |

### Cart — `/api/cart`
| Method | Endpoint        | Access  | Description           |
|--------|-----------------|---------|------------------------|
| GET    | /               | Private | Get cart               |
| POST   | /               | Private | Add item               |
| PUT    | /:productId     | Private | Update quantity        |
| DELETE | /:productId     | Private | Remove item            |
| DELETE | /               | Private | Clear cart             |

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Axios  |
| Backend   | Node.js, Express 4                |
| Database  | MongoDB, Mongoose                 |
| Auth      | JWT, bcryptjs                     |
| Styling   | Custom CSS (no framework)         |

---

## 📸 Pages Overview

| Page               | Route              |
|--------------------|--------------------|
| Home               | `/`                |
| All Products       | `/products`        |
| Product Detail     | `/products/:id`    |
| Cart               | `/cart`            |
| Checkout           | `/checkout`        |
| Order Confirmation | `/orders/:id`      |
| Login              | `/login`           |
| Register           | `/register`        |
| My Profile         | `/profile`         |
| My Orders          | `/my-orders`       |
| Admin Dashboard    | `/admin`           |
| Admin Products     | `/admin/products`  |
| Admin Orders       | `/admin/orders`    |

---

## 🔐 Role-Based Access

- **Public routes**: Home, Products, Product Detail, Login, Register
- **Private routes** (logged-in users): Cart, Checkout, Orders, Profile
- **Admin routes**: Admin Dashboard, Manage Products, Manage Orders

---

*Built as part of the Thiranex Internship Program — Task 3: E-Commerce Web Application*
