import axios from "axios";

export const contribute = async (amount) => {
    try {
        const response = await axios.post("http://localhost:5000/api/contribute", { amount });
        return response.data;
    } catch (error) {
        console.error(error);
        return { success: false };
    }
};

export const getBalance = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/get-balance");
        return response.data.balance;
    } catch (error) {
        console.error(error);
        return "Error";
    }
};
