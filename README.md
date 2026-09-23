# 🛒 Swabi Market — Buy & Sell Anything in Swabi

Swabi's first local online marketplace — a modern web app where people can **buy and sell anything** in their area. Built with React, Supabase, and Tailwind CSS.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-0a4d3c?style=for-the-badge&logo=vercel)](https://swabi-marketplace.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## ✨ Features

- 🔐 **User Authentication** — Email/Phone signup & login
- 📸 **Product Upload** — Auto image compression before upload
- 🔍 **Search & Filter** — Search by title, category, location
- 🏷️ **28 Categories** — From vehicles to electronics to property
- 👤 **User Profile** — Update personal details anytime
- 📊 **My Ads Dashboard** — Manage your posted ads
- 📱 **Fully Responsive** — Works on mobile, tablet, desktop
- 🎨 **Modern UI** — Clean design with Tailwind CSS
- ⚡ **SEO Optimized** — Dynamic meta tags for every page
- 🔒 **Secure** — Row Level Security (RLS) in Supabase

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (Auth, Postgres, Storage) |
| **State Management** | React Query, Context API |
| **Form Validation** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **SEO** | React Helmet Async |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mr-WaqasAhmad/swabi-marketplace.git
   cd swabi-marketplace
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   ⚠️ **Never commit `.env` to GitHub!** See `.env.example` for reference.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

---

## 📂 Project Structure

```
swabi-marketplace/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and icons
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── App.jsx              # Main app with routes
│   └── main.jsx             # Entry point
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🗄️ Database Schema

### `profiles` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | User ID |
| `email` | text | User email |
| `full_name` | text | User's full name |
| `phone` | text | Phone number |
| `location` | text | User's address |
| `created_at` | timestamptz | Account creation date |

### `posts` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Post ID |
| `user_id` | uuid | Seller ID |
| `title` | text | Ad title |
| `price` | numeric | Price in PKR |
| `category` | text | Product category |
| `warranty` | text | Warranty info |
| `location` | text | Product location |
| `description` | text | Product description |
| `image_url` | text | Image URL |
| `created_at` | timestamptz | Post creation date |

---

## 🔐 Security

- ✅ **Environment variables** stored in `.env` (never committed)
- ✅ **Row Level Security (RLS)** enabled on all Supabase tables
- ✅ **Auto image compression** — reduces storage usage by 80%
- ✅ **HTTPS only** in production
- ✅ **Input validation** with Zod schemas

---

## 🌐 Live Demo

👉 **[swabi-marketplace.vercel.app](https://swabi-marketplace.vercel.app)**

---

## 👨‍💻 Developer

**Waqas Ahmad** — Frontend Web Developer from Swabi, KPK, Pakistan

[![WhatsApp](https://img.shields.io/badge/WhatsApp-+92_310_0094241-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/923100094241)
[![GitHub](https://img.shields.io/badge/GitHub-Mr--WaqasAhmad-181717?style=for-the-badge&logo=github)](https://github.com/Mr-WaqasAhmad)
[![Email](https://img.shields.io/badge/Email-wa9580670@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:wa9580670@gmail.com)

---

⭐ **If you like this project, please give it a star!** ⭐
