# WulaPal

## Structure:

### web/
│── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Pages (e.g., Home, Dashboard)
│   ├── hooks/           # Custom hooks for fetching blockchain data
│   ├── context/         # Context API for global state
│   ├── styles/          # Tailwind CSS
│   ├── App.jsx
│   └── main.jsx
│── public/              # Static assets
│── package.json
│── vite.config.js
└── tailwind.config.js

### mobile/
│── lib/
│   ├── screens/         # Screens (Home, Wallet, Transactions)
│   ├── widgets/         # Reusable UI components
│   ├── providers/       # State management (e.g., WalletProvider)
│   ├── services/        # API or blockchain services
│   ├── models/          # Data models (User, Transactions)
│   ├── main.dart
│── pubspec.yaml
└── android/ios/        # Native folders

### blockchain/
│── contracts/         # Smart contracts (Paluwagan.sol)
│── scripts/           # Deployment scripts
│── test/              # Smart contract tests
│── hardhat.config.js
└── package.json

### backend/

│── routes/         # API routes
│── controllers/    # Business logic
│── models/         # Database models
│── config/         # Config files
│── index.js        # Main server file
│── .env
└── package.json

