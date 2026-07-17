# 📸 Instagram Clone - Full Stack Web Application

Welcome to the **Instagram Clone**, a fully functional, modern, full-stack web application designed to replicate core features of Instagram. This repository is split into a robust **Node.js/Express Backend** with MongoDB Mongoose, and a high-performance **React/Vite Frontend** styled with Tailwind CSS v4.

---

## 🌟 Key Features

*   🔐 **Secure Authentication**: User signup, login, and profile fetching backed by JWT (JSON Web Tokens) stored securely in HttpOnly cookies.
*   🖼️ **Post Creation & CDN Uploads**: Upload post images seamlessly using Multer middleware, and host them via the **ImageKit.io** CDN.
*   ❤️ **Likes & Interactions**: Interactive toggle to like/unlike posts in real time.
*   💬 **Comments System**: Add comments to posts, linking users, posts, and comments.
*   👥 **Follower Graph**: Follow/Unfollow users with database integrity (unique indices to prevent duplicate follows).
*   👤 **Detailed Profiles**: Displays user bio, profile photo, follower/following counts, follow status, and a beautiful grid layout of user's posts.
*   🎨 **Modern Responsive UI**: Built with React and Tailwind CSS v4 featuring micro-interactions and transitions.

---

## 🏗️ Project Architecture & Directory Structure

```text
XYZ/ (Root)
├── Frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── assets/           # Static assets & icons
│   │   ├── components/       # Global/Shared UI components
│   │   ├── feature/          # Feature-based folders (auth, user, post)
│   │   │   ├── auth/         # Login, Register, Auth Context
│   │   │   ├── user/         # Profile, Profile Hooks
│   │   │   └── post/         # Create Post, Feed, Comments, Likes
│   │   ├── routes/           # Routing configuration
│   │   ├── services/         # Axios API connection layer
│   │   ├── index.css         # Styling styles
│   │   └── main.jsx          # App bootstrapping
│   ├── vite.config.js        # Vite & Tailwind configurations
│   └── package.json          # Frontend dependencies & scripts
│
└── backend/                  # Node.js + Express MVC server
    ├── src/
    │   ├── config/           # Database & server configurations
    │   ├── controller/       # Request handlers & logic
    │   ├── middlewares/      # Authentication & file upload middleware
    │   ├── models/           # Mongoose schemas (User, Post, Comment, Follow)
    │   ├── Routes/           # Express endpoint routers
    │   ├── validations/      # Express-validator input checkers
    │   └── app.js            # Express app configuration & middleware pipeline
    ├── server.js             # Server entry point
    ├── API_DOCUMENTATION.md  # Detailed API schema & design patterns
    ├── .env                  # Port, Database URI, & ImageKit API keys
    └── package.json          # Backend dependencies & scripts
```

---

## 🛠️ Tech Stack

### Frontend
*   **React 19**
*   **Vite** (Next-generation frontend tooling)
*   **Tailwind CSS v4** (Utility-first styling framework)
*   **Axios** (Promise-based HTTP client for API calls)
*   **React Router DOM v7** (Declarative routing)

### Backend
*   **Node.js & Express**
*   **MongoDB & Mongoose** (NoSQL database and Object Data Modeling)
*   **JWT & Cookie Parser** (Secure stateless session management)
*   **Multer** (Multipart form data handling for files)
*   **ImageKit.io Node SDK** (Cloud image optimization & CDN storage)
*   **Express Validator** (Server-side validation)

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas account)
*   [ImageKit.io Account](https://imagekit.io/) (For free image storage and CDN endpoint keys)

---

### 1. Backend Setup & Run

1.  Navigate into the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the `backend/` directory and configure the environment variables as follows:
    ```env
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/insta-clone
    JWT_SECRET_KEY=your_jwt_secret_key_here
    IMAGEKIT_PUBLIC_KEY=public_your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=private_your_imagekit_private_key
    IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint_id
    ```
4.  Start the development server (runs on `http://localhost:5000` by default):
    ```bash
    npm run dev
    ```

---

### 2. Frontend Setup & Run

1.  Open a new terminal and navigate to the `Frontend` folder:
    ```bash
    cd Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure the API endpoint base URL matches your backend environment in [api.js](file:///c:/Users/DELL/Desktop/XYZ/Frontend/src/services/api.js):
    ```javascript
    baseURL: "http://localhost:5000/api"
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to the URL printed in the terminal (usually `http://localhost:5173`).

---

## 📘 API Routes Reference

A comprehensive breakdown of all API endpoints is documented in [API_DOCUMENTATION.md](file:///c:/Users/DELL/Desktop/XYZ/backend/API_DOCUMENTATION.md). Below is a quick overview:

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| **POST** | `/api/auth/register` | No | Register a new user |
| **POST** | `/api/auth/login` | No | Log in and receive JWT HttpOnly Cookie |
| **GET** | `/api/auth/get-me` | Yes | Retrieve session info for current logged-in user |
| **POST** | `/api/auth/logout` | Yes | Clear cookies and log out user |
| **GET** | `/api/users/:userId` | Yes | Get target user profile details |
| **PUT** | `/api/users/profile` | Yes | Edit bio/profile details |
| **POST** | `/api/users/:userId/follow`| Yes | Toggle follow/unfollow status |
| **POST** | `/api/posts` | Yes | Create a post and upload image to ImageKit |
| **GET** | `/api/posts` | Yes | Fetch all posts of the current user |
| **GET** | `/api/posts/:postId` | Yes | Get detailed views for a post |
| **DELETE**| `/api/posts/:postId` | Yes | Remove post and CDN image |

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use and modify it for your personal learning and portfolio!
