# Smart E-commerce System

A full-stack Smart E-commerce System built using **React**, **Flask**, and **PostgreSQL**. The system provides user authentication, product browsing, shopping cart, wishlist, order management, admin dashboard, and product recommendations by integrating external APIs.

-------------------------------------------------------------------------------------------------


# Project Structure

```
smart-ecommerce/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── routes/
│   ├── migrations/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

--------------------------------------------------------------------------------------------------
# Prerequisites

Install the following software before running the project:

- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL

-------------------------------------------------------------------------------------------------

# Backend Setup

## 1. Navigate to backend

```bash
cd backend
```

## 2. Create virtual environment

Windows

```bash
python -m venv venv
```

Activate

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db

JWT_SECRET_KEY=your_secret_key

FLASK_APP=app.py

FLASK_ENV=development
```

---

## 5. Create Database

Create a PostgreSQL database.

Example:

```
ecommerce_db
```

---

## 6. Run Database Migration

```bash
flask db upgrade
```

If running for the first time:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## 7. Start Backend

```bash
python app.py
```

Backend runs on

```
http://localhost:5000
```

---

# Frontend Setup

## 1. Navigate to frontend

```bash
cd frontend
```

---

## 2. Install packages

```bash
npm install
```

---

## 3. Start React Application

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

## Products

```
GET /api/products
GET /api/products/:id
```

## Categories

```
GET /api/categories
```

## Wishlist

```
GET
POST
DELETE
```

## Cart

```
GET
POST
PUT
DELETE
```

## Orders

```
GET
POST
```

## Reviews

```
GET
POST
```

## Best Deals

```
GET /api/recommendations/best-deals
```

---

# Running the Complete Project

Open two terminals.

### Terminal 1

```bash
cd backend
venv\Scripts\activate
python app.py
```

### Terminal 2

```bash
cd frontend
npm install
npm run dev
```

Open your browser:

```
http://localhost:5173
```

---

# Default Workflow

1. Register a new account.
2. Login to receive a JWT token.
3. Browse available products.
4. Add products to the wishlist or shopping cart.
5. Manage shipping addresses.
6. Place an order.
7. View order history.
8. Admin users can manage products, categories, users, and orders.

---

# Future Improvements

- Payment Gateway Integration
- Email Notifications
- Product Recommendation using Machine Learning
- Product Image Upload
- Docker Deployment
- CI/CD Pipeline

---

# Authors

**Rabin Subedi**

Master's Student of The Kyoto College of Graduate Studies for Informatics (KCGI)

---

# License
This project is developed for my educational purposes as part of the Web Service Development course.


# Features

## User Features
- User Registration & Login (JWT Authentication)
- Browse Products
- Search & Filter Products
- Product Details
- Shopping Cart
- Wishlist
- Shipping Address Management
- Order Placement
- Order History
- Product Reviews
- Best Deals Recommendation

## Admin Features
- Dashboard
- Product Management
- Category Management
- User Management
- Order Management

---

# Technology Stack

### Frontend
- React
- React Router
- Axios
- CSS

### Backend
- Flask
- Flask SQLAlchemy
- Flask JWT Extended
- Flask Bcrypt
- Flask Migrate
- Flask CORS

### Database
- PostgreSQL

### External APIs
- FakeStore API
- DummyJSON API

---

Admin ID PASS
username: admin@gmail.com
password:Admin1234
