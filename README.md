# WulaPal

## Overview
WulaPal is a blockchain-powered platform that digitalizes the traditional Paluwagan system to enhance transparency, security, and automation. It is a cross-platform system comprising:

- A **web dashboard** for organizers
- A **mobile app** for members
- A **blockchain backend** for contribution and payout automation
- A **Node.js backend** for API services, wallet handling, and cron jobs

---

## Programming Languages & Frameworks

### Blockchain
- **Network**: Polygon (Matic)
- **Smart Contract Language**: Solidity
- **Framework**: Hardhat

### Web
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express.js

### Mobile
- **Framework**: React Native CLI (JavaScript)
- **Supported Platforms**: Android, iOS

---

## Project Structure
📄 [Project Structure Documentation](https://docs.google.com/document/d/12DnbbxJcT9sUX2L0ZjYYpNZj0cSG13GaEYiKG7Rs3W4/edit?usp=sharing)

---

## System Requirements & Dependencies

### General Requirements
- Node.js (v18+ recommended)
- npm (comes with Node.js)
- Git

### Blockchain (Hardhat)
```bash
npm install --save-dev hardhat
```

### Web Frontend (React + Vite + Tailwind)
```bash
npm create vite@latest
npm install react react-dom
npm install -D tailwindcss postcss autoprefixer
```

### Backend (Express.js)
```bash
npm install
```

### Mobile (React Native CLI)
```bash
npm install -g react-native-cli
npm install
```

> ⚠️ Also install Android Studio (for Android) and Xcode (for iOS/macOS only). JDK 17 is required.

---

## Environment Variables Setup

Create a `.env` file in each of the following directories:

### ✅ `blockchain/.env`
```
PRIVATE_KEY=your_private_key
RPC_URL=https://polygon-mumbai.infura.io/v3/your_project_id
CONTRACT_ADDRESS=deployed_contract_address
```

### ✅ `backend/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/wulapal
JWT_SECRET=your_jwt_secret
XENDIT_API_KEY=your_xendit_api_key
```

### ✅ `web/.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

### ✅ `mobile/.env`
```
API_BASE_URL=http://your-local-ip:5000/api
FIREBASE_API_KEY=your_firebase_api_key
```

> 🛑 **Important:** Make sure `.env` is included in `.gitignore`.

---

## How to Run the Project

### 🔗 Blockchain
```bash
cd blockchain
npm install
npx hardhat test
```

### 🌐 Web

#### Web Frontend
```bash
cd web
npm install
npm run dev
```

#### Web Backend
```bash
cd backend
npm install
npm run dev
```

> Make sure MongoDB is running and your `.env` is properly configured.

### 📱 Mobile

#### Install & Start
```bash
cd mobile
npm install
npx react-native start
```

#### Run on Android
```bash
npx react-native run-android
```

If issues occur:
```bash
cd android
./gradlew clean
cd ..
npx react-native start
npx react-native run-android
```

#### Run on iOS (macOS only)
```bash
npx react-native run-ios
```

#### Check Environment Setup
```bash
npx react-native doctor
```

---

## Troubleshooting

| Issue | Fix |
|-------|------|
| Metro Bundler not starting | Kill process on port 8081 |
| Gradle build failed | Ensure JDK 17 is correctly installed |
| React Native iOS issues | `cd ios && npx pod install` |
| API not reachable in mobile | Use IP address instead of `localhost` in `.env` |

---

## Author
Developed by RAM_S Team – 2025
