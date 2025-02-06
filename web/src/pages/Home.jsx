import React from 'react';
import Button from '../components/Button';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to WulaPal</h1>
            <p className="text-lg mb-6 opacity-90">A blockchain-powered Paluwagan system for financial transparency.</p>
            <Button 
                onClick={() => alert('Welcome to WulaPal!')} 
                className="px-6 py-3 text-lg font-semibold bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:bg-yellow-300 transition"
            >
                Get Started
            </Button>
        </div>
    );
};

export default Home;
