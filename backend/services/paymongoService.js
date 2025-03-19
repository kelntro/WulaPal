import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

if (!PAYMONGO_SECRET_KEY) {
    console.error("❌ PAYMONGO_SECRET_KEY is missing. Make sure `.env` is loaded!");
}

const createPaymentIntent = async (amount) => {
    try {
        const response = await axios.post(
            'https://api.paymongo.com/v1/payment_intents',
            {
                data: {
                    attributes: {
                        amount: amount * 100, // Convert PHP to centavos
                        currency: 'PHP',
                        payment_method_allowed: ['gcash', 'card'],
                        capture_type: 'automatic'
                    }
                }
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error.response?.data || error);
        throw error;
    }
};

export { createPaymentIntent };
