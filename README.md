**Deployed link:** [Visit App](https://bookhives--zv3n5yog5w.expo.app/)
# 📚 BookHive – Community Book Rental App

BookHive is a modern **React Native + Expo** application designed to enable users to **rent, lend, and share books** within their local community.  
It uses **Firebase (Auth + Firestore)** and **Cloudinary** for image storage.

---

## 📝 Table of Contents
- [🚀 Overview](#-overview)
- [✨ Features](#-features)
- [👤 User Authentication](#-user-authentication)
- [📘 Book Management](#-book-management)
- [🔍 Search & Discovery](#-search--discovery)
- [🛒 Cart & Renting System](#-cart--renting-system)
- [📫 Notifications](#-notifications)
- [📚 My Library](#-my-library)
- [⚡ Smart UI Features](#-smart-ui-features)
- [🏛️ System Architecture](#-system-architecture)
- [🧱 Database Structure](#-database-structure)
- [🏗️ Technology Stack](#-technology-stack)
- [📸 Screens Included](#-screens-included)
- [☁️ Cloudinary Integration](#️-cloudinary-integration)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🧪 Testing the App](#-testing-the-app)
- [🚀 Future Enhancements](#-future-enhancements)
- [👨‍💻 Author](#-author)

---

# 🚀 Overview

BookHive creates a neighborhood ecosystem where readers can:

- Add their own books  
- Rent books from others  
- Track availability  
- Manage their personal library  
- View complete rental history  
- Receive real-time notifications  
- Browse/search the full community library  

It provides a lightweight, intuitive, fast mobile experience.

---

# ✨ Features

## 👤 User Authentication
- Firebase Authentication (Email/Password)  
- User profiles stored in Firestore  
- Personalized Home Screen  
- Secure session persistence  

---

## 📘 Book Management
Users can:  
✔ Add books  
✔ Upload covers via Cloudinary  
✔ Edit book details  
✔ Delete Books (*only if available*)  
✔ Auto-track availability (available/rented)

### Book fields:
- Title  
- Author  
- Description  
- Image  
- Price  
- Owner ID  
- Availability  

---

## 🔍 Search & Discovery
- Search by title or author  
- Real-time filtering  
- “Featured Books” on home  
- Detailed book page with **Amazon-style preview**

---

## 🛒 Cart & Renting System

### Add to Cart
- Anyone except the owner can add a book  
- Stored in Firestore

### Rent Now
- Direct checkout from **Book Details**  
- Cannot rent own books  
- Cannot rent unavailable books  

### Checkout Process:
- Enter delivery address  
- Select return date  
- Choose payment method  
- Confirm rental  

After confirmation:
- Book becomes unavailable  
- Rental entry saved  
- **Notifications generated for both renter and owner**

---

## 📫 Notifications

Two automated notifications after checkout:

### ✔ Owner Notification  
> 📘 *Your book "XYZ" was rented by <User> on <Date>.*

### ✔ Renter Notification  
> 📗 *You rented "XYZ" from <Owner> on <Date>.*

Stored in:  
`notifications → userId → message, createdAt, isRead`

---

## 📚 My Library

### 1️⃣ My Listed Books
- Books uploaded by the user  
- Read-only  
- Shows availability (Available / Rented)

### 2️⃣ Rental History
- Books rented by the current user  
- Shows:  
  - Rent date  
  - Return date  
  - Status  
- Fully read-only

---

## ⚡ Smart UI Features
- Pull-to-refresh on all list screens  
- Disabled button logic:
  - Owners cannot rent their own books  
  - Can't delete rented books  
- Attractive empty-state screens  
- Consistent headers  
- Responsive Amazon-style image preview  

---

# 🏛️ System Architecture

React Native (Expo)  
→ Firebase Authentication → Login, Profile  
→ Firestore Database ↔ Screens (Home, Search, Library, Cart)  
→ Cloudinary (Image Uploads)

---

# 🧱 Database Structure

### 🔹 users
```json
{
  "uid": "123",
  "name": "John Doe",
  "email": "john@gmail.com",
  "createdAt": "timestamp"
}
```

### 🔹 books
```json
{
  "title": "Rich Dad Poor Dad",
  "author": "Robert Kiyosaki",
  "description": "...",
  "price": 40,
  "image": "cloudinary_url",
  "ownerId": "user123",
  "isAvailable": true,
  "rentedBy": null,
  "createdAt": "timestamp"
}
```

### 🔹 rentals
```json
{
  "userId": "renter_id",
  "ownerId": "owner_id",
  "bookId": "book_id",
  "rentedAt": "timestamp",
  "returnDate": "timestamp",
  "status": "rented"
}
```

### 🔹 notifications
```json
{
  "userId": "owner_id",
  "message": "Your book 'XYZ' was rented...",
  "isRead": false,
  "createdAt": "timestamp"
}
```

### 🔹 cart
```json
{
  "userId": "123",
  "bookId": "789",
  "addedAt": "timestamp"
}
```

---

# 🏗️ Technology Stack

### **Frontend**
- React Native (Expo)
- Context API
- React Navigation
- Ionicons / Material Icons

### **Backend**
- Firebase Authentication
- Firebase Firestore
- Cloudinary (image hosting)

---

# 📸 Screens Included
- Home Screen  
- Search Screen  
- Add Book  
- Edit Book  
- Book Details  
- My Library (Listed + History)  
- Notifications  
- Cart  
- Checkout  
- Profile  
- Login / Register  

---

# ☁️ Cloudinary Integration

### Setup:
1. Create Cloudinary account  
2. Go to **Settings → Upload**  
3. Create **Unsigned Upload Preset**  
4. Allowed: JPG/PNG  
5. Upload URL:
```
https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload
```

### Upload Example:
```js
formData.append("file", file);
formData.append("upload_preset", "YOUR_PRESET");
```

---

# ⚙️ Installation & Setup

### 1️⃣ Clone repository
```bash
git clone https://github.com/yourusername/bookhive.git
cd bookhive
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure Firebase
Create:
```
/src/services/firebaseConfig.js
```
Add Firebase Web SDK keys.

### 4️⃣ Configure Cloudinary
Add:
```js
const CLOUD_NAME = "xxxx";
const UPLOAD_PRESET = "xxxx";
```

### 5️⃣ Run the app
```bash
npm start
```

Run on:
- Expo Go (Android)
- Emulator  
- Web (`npm run web`)

---

# 🧪 Testing the App
Checklist:

- Add book → Appears in list  
- Rent book → becomes unavailable  
- Cannot rent own book  
- Notifications created after checkout  
- Rental history updates  
- My library displays correct data  
- Delete disabled for rented books  
- Amazon-style preview  

---

# 🚀 Future Enhancements
- Owner ↔ Renter chat  
- Ratings & Reviews  
- Wallet system  
- AI-based recommendations  
- Delivery tracking  
- OTP verification  
- Dark mode  

---

# 👨‍💻 Author
**Prashant Kumar**  
React Native & Full-Stack Developer
