import { useState } from "react";
import { contribute, getBalance } from "../api/WulapalApi";
import { View, Text, TextInput, Button } from "react-native";

const ContributeScreen = () => {
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState("");

    const handleContribute = async () => {
        const result = await contribute(amount);
        alert(result.success ? "Contribution Successful!" : "Failed to contribute");
    };

    const fetchBalance = async () => {
        const balance = await getBalance();
        setBalance(balance);
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Current Contract Balance: {balance} ETH</Text>
            <Button title="Refresh Balance" onPress={fetchBalance} />
            <TextInput
                placeholder="Contribution Amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{ borderWidth: 1, marginVertical: 10, padding: 8 }}
            />
            <Button title="Contribute" onPress={handleContribute} />
        </View>
    );
};

export default ContributeScreen;
