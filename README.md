# KrishiVyapar - Farmer Marketplace 🌾

<div align="center">

![KrishiVyapar Banner](https://github.com/user-attachments/assets/a26ee4ce-3e2d-406b-b157-4a05b443450a)

<h3>Empowering Farmers. Connecting Markets. Transforming Agriculture.</h3>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-brightgreen?style=for-the-badge)](https://framer-market-place.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 📖 Overview

**KrishiVyapar** *(Hindi: कृषिव्यापार — "Agricultural Commerce")* is a comprehensive, full-stack digital marketplace built to **empower farmers** by connecting them directly with buyers, APMC mandis, and agricultural resources.

> 🎯 **Mission:** Eliminate middlemen, ensure fairer prices for farmers, deliver fresher produce to consumers, and democratize access to agricultural intelligence using AI.

### 💡 The Problem We Solve

| Pain Point | Our Solution |
|---|---|
| 🔗 Middlemen eating profits | Direct farmer-to-buyer marketplace |
| 📊 No market price visibility | Real-time APMC mandi integration |
| 🤝 Small farmers can't fulfill bulk orders | Community group selling & buying |
| 🌱 Crop selection uncertainty | AI-powered crop prediction engine |
| ⚡ Delayed payment settlements | Integrated Razorpay secure payments |

---

## ✨ Features

<details>
<summary><b>🧑‍🌾 For Farmers</b></summary>

<br>

- **🛒 Direct Selling** — List your crops directly to buyers with complete price transparency. No commission agents, no hidden deductions.
- **🤝 Community Group Selling** — Pool resources with neighboring farmers to fulfill large bulk orders and unlock better negotiated rates collectively.
- **📈 APMC Mandi Integration** — Access live market prices, historical trends, and demand forecasts across mandis to make data-driven selling decisions.
- **🤖 AI Crop Prediction** — Machine learning models analyze your soil composition, local weather patterns, and district-level data to recommend the most profitable and sustainable crops for your land.
- **🌦️ Hyperlocal Weather Alerts** — Receive timely, GPS-accurate weather forecasts and agricultural advisories tailored to your farm's location.
- **⭐ Farmer Profiles & Ratings** — Build credibility and trust with a verified public profile showcasing your produce history and buyer reviews.

</details>

<details>
<summary><b>🧑‍💼 For Buyers</b></summary>

<br>

- **🌿 Direct Sourcing** — Purchase farm-fresh, high-quality produce directly from verified farmers — cutting the supply chain short.
- **💰 Community Group Buying** — Join or create group buy deals to access wholesale pricing on bulk orders, even as an individual buyer.
- **🔍 Transparent Traceability** — Every product links back to the farm it came from. View full farmer profiles, growing practices, and community ratings.
- **💳 Secure Payments** — End-to-end encrypted transactions powered by **Razorpay** with support for UPI, cards, net banking, and wallets.

</details>

<details>
<summary><b>⚙️ Platform-Wide</b></summary>

<br>

- **🔔 Real-time Notifications** — Instant in-app and email alerts for order status, deal updates, price changes, and market advisories via WebSockets.
- **📱 Fully Responsive Design** — Pixel-perfect experience across mobile, tablet, and desktop — optimized for both rural low-bandwidth and urban high-speed connections.
- **🌐 Multilingual Ready** — Architecture supports localization for regional Indian languages.
- **🎨 Premium Modern UI** — Clean, intuitive, and visually rich interface designed with accessibility and ease-of-use at its core.

</details>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
| Technology | Purpose |
|---|---|
| ⚛️ **React.js** (Vite) | Core UI framework with lightning-fast HMR |
| 🎨 **Tailwind CSS** | Utility-first, responsive styling |
| 🎭 **Framer Motion** | Fluid animations and micro-interactions |
| 🐻 **Zustand** | Lightweight, scalable state management |
| 📋 **React Hook Form + Zod** | Type-safe form handling and validation |
| 📊 **Recharts** | Interactive data visualization & charts |
| 🗺️ **Leaflet** | Interactive maps for farm locations & mandis |
| 🔌 **Socket.io-client** | Real-time bidirectional event communication |

### Backend
| Technology | Purpose |
|---|---|
| 🟢 **Node.js + Express.js** | RESTful API server and middleware |
| 🍃 **MongoDB + Mongoose** | Flexible NoSQL database with ODM |
| 🔐 **JWT** | Stateless, secure authentication |
| 🔌 **Socket.io** | WebSocket server for real-time features |
| 💳 **Razorpay** | Payment gateway integration |
| 📧 **Nodemailer** | Transactional email service |
| ☁️ **Cloudinary** | Cloud-based image hosting and optimization |
| 🤖 **Google Gemini AI API** | Intelligent crop advisory and smart features |

</div>

---


---

## 📸 Screenshots

<div align="center">

### 🏠 Homepage
![Homepage](https://github.com/user-attachments/assets/9bf6128e-0a8e-4413-9b53-5d1d1cca5d5d)

### 📊 Marketplace Dashboard
![Dashboard](https://github.com/user-attachments/assets/5b68cd3f-3ba5-409b-ad8f-f339bb9423f7)

</div>

---

## 🚀 Getting Started

### ✅ Prerequisites

Before you begin, ensure you have the following installed and ready:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB** — Local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **Git** — [Download](https://git-scm.com/)
- API keys for: **Razorpay**, **Cloudinary**, **Google Gemini**, and an **SMTP email provider**

---

### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/farmer-marketplace.git
cd farmer-marketplace
```
#### 2. Configure & Install Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
# ─── Server ───────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ─────────────────────────────────────────
MONGODB_URI=your_mongodb_connection_string

# ─── Authentication ───────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# ─── Payments ─────────────────────────────────────────
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ─── Cloud Storage ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── AI Services ──────────────────────────────────────
GEMINI_API_KEY=your_google_gemini_api_key

# ─── Email Service ────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EMAIL_FROM=noreply@krishivyapar.com

# ─── Client ───────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

#### 3. Configure & Install Frontend

```bash
cd ../client
npm install
```

Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

### ▶️ Running the Application

Open **two separate terminals** and run:

**Terminal 1 — Backend Server:**

```bash
cd server
npm run dev
```

> 🟢 API server running at `http://localhost:5000`

**Terminal 2 — Frontend Dev Server:**

```bash
cd client
npm run dev
```

> 🌐 Frontend running at `http://localhost:5173`

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| **Frontend** | [Vercel](https://vercel.com/) — Zero-config React deployment |
| **Backend** | [Render](https://render.com/) / [Railway](https://railway.app/) — Node.js hosting |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Managed cloud DB |
| **Images** | [Cloudinary](https://cloudinary.com/) — CDN-backed media storage |

---

## 🗺️ Roadmap

- [x] Farmer & buyer authentication
- [x] Crop listing marketplace
- [x] Group buying & selling deals
- [x] APMC mandi price integration
- [x] AI crop prediction
- [x] Real-time notifications (WebSockets)
- [x] Razorpay payment gateway
- [ ] 🔜 Mobile app (React Native)
- [ ] 🔜 Multilingual support (Hindi, Marathi, Punjabi, Tamil)
- [ ] 🔜 Logistics & delivery partner integration
- [ ] 🔜 Farmer loan & credit advisory module
- [ ] 🔜 Government scheme eligibility checker

---

## 🤝 Contributing

Contributions make the open-source community thrive. Any contribution you make is **greatly appreciated**!

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/AmazingFeature`
3. **Commit** your changes: `git commit -m 'feat: Add AmazingFeature'`
4. **Push** to the branch: `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ for the farming community of India**

*"When farmers prosper, nations flourish."*

⭐ **Star this repo** if you find it helpful — it motivates us to keep building!


</div>
