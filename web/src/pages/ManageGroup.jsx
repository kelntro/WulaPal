import { useState } from "react";
import axios from "axios";

const ManageGroup = () => {
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState("30");
    const [requiredMembers, setRequiredMembers] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateGroup = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5050/api/create-group", {
                contributionAmount: amount,
                frequency: parseInt(frequency) * 86400,
                requiredMembers: parseInt(requiredMembers),
            });
    
            alert("Group Created! Contract Address: " + response.data.contractAddress);
        } catch (error) {
            alert("Error creating group: " + error.response?.data?.error || error.message);
        }
        setLoading(false);
    };
       

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold">Create a ROSCA Group</h2>
            <input type="number" placeholder="Contribution Amount (PHP)" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 m-2"/>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="border p-2 m-2">
                <option value="7">Weekly</option>
                <option value="30">Monthly</option>
            </select>
            <input type="number" placeholder="Number of Members" value={requiredMembers} onChange={(e) => setRequiredMembers(e.target.value)} className="border p-2 m-2"/>
            <button onClick={handleCreateGroup} className="bg-blue-500 text-white p-2" disabled={loading}>
                {loading ? "Creating..." : "Create Group"}
            </button>
        </div>
    );
};

export default ManageGroup;
