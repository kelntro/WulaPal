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

## **How to Run the Project**

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

#### **Check Environment Setup**
To ensure all dependencies are correctly installed:
```sh
npx react-native doctor
```

## **System Requirements**
- **JDK Version**: 17
- **Node.js**: LTS version recommended
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### **Environment Variables Setup**
Ensure that the necessary environment variables are configured:
1. Set up `ANDROID_HOME` and add the SDK paths.
2. Configure Node.js and React Native dependencies.




You can view the project structure here: [Project Structure](https://docs.google.com/document/d/12DnbbxJcT9sUX2L0ZjYYpNZj0cSG13GaEYiKG7Rs3W4/edit?usp=sharing)
