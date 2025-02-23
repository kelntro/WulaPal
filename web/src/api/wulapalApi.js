import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

export const joinPaluwagan = async (userAddress, amount) => {
    return axios.post(`${API_BASE_URL}/join`, { userAddress, amount });
};

export const getContractBalance = async () => {
    return axios.get(`${API_BASE_URL}/balance`);
};

export const distributePayout = async () => {
    return axios.post(`${API_BASE_URL}/distribute`);
};
