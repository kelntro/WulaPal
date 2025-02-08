# WulaPal

## Overview
WulaPal is a blockchain-powered platform that digitalizes the Paluwagan system for better transparency, security, and automation.

## Programming Languages & Frameworks

### **Blockchain**:
- **Blockchain Network**: Polygon (Matic)
- **Smart Contract Language**: Solidity
- **Development Framework**: Hardhat

### **Web**:
- **Backend**: Node.js (Express.js)
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS

### **Mobile**:
- **Framework**: React Native CLI (JavaScript)
- **Platforms**: Android, iOS

## **Project Structure**
Refer to the project structure documentation here: [Project Structure](https://docs.google.com/document/d/12DnbbxJcT9sUX2L0ZjYYpNZj0cSG13GaEYiKG7Rs3W4/edit?usp=sharing)

## **System Requirements & Dependencies**
Before running the project, ensure the following dependencies are installed:

### **General Requirements**
- **Node.js**: LTS version (Recommended: Node 18+)
- **npm**: Installed with Node.js
- **Git**: Latest version recommended

### **Blockchain Development Requirements**
- **Hardhat**: `npm install --save-dev hardhat`
- **Solidity Compiler**: Comes with Hardhat

### **Web Application Requirements**
- **Vite**: `npm create vite@latest`
- **React**: `npm install react react-dom`
- **Tailwind CSS**: `npm install -D tailwindcss postcss autoprefixer`

### **Mobile Development Requirements**
- **React Native CLI**: `npm install -g react-native-cli`
- **JDK**: Version 17
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Watchman** (for macOS, recommended for React Native): `brew install watchman`

### **Environment Variables Setup**
Ensure that the necessary environment variables are configured:
1. Set up `ANDROID_HOME` and add the SDK paths.
2. Configure Node.js and React Native dependencies.

## **How to Run the Project**

### **Running the Blockchain Development Environment**
```sh
cd blockchain
npm install
npx hardhat test
```

### **Running the Web Application**
```sh
cd web
npm install
npm run dev
```

### **Running the Mobile Application**
Ensure that you have set up your React Native environment correctly. Run the following commands:

#### **Start Metro Bundler**
```sh
cd mobile
npx react-native start
```

#### **Run on Android Emulator or Device**
```sh
npx react-native run-android
```

If you face build issues, try cleaning the Gradle cache:
```sh
cd android
./gradlew clean
cd ..
```
Then restart:
```sh
npx react-native start
npx react-native run-android
```

#### **Run on iOS Emulator (macOS only)**
```sh
npx react-native run-ios
```

#### **Check Environment Setup**
To ensure all dependencies are correctly installed:
```sh
npx react-native doctor
```

## **Troubleshooting**
### **Common Issues & Fixes**
- **Metro Bundler not starting**: Ensure that no process is running on port 8081. Kill any running process and restart.
- **Gradle build failed**: Ensure `JDK 17` is correctly installed and configured.
- **React Native build issues**: Try running `npm install` and `npx pod install` (for iOS).

