import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

const GroupsScreen = ({ navigation }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:5050/api/groups');
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error.message);
        } finally {
            setLoading(false);
        }
    };    
    

    const handleJoinGroup = (group) => {
        // Navigate to group details or join process
        navigation.navigate('GroupDetails', { group });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Available Groups</Text>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.contractAddress}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{
                            padding: 15,
                            marginVertical: 5,
                            backgroundColor: '#ddd',
                            borderRadius: 5
                        }}
                        onPress={() => navigation.navigate('GroupDetails', { group: item })}
                    >
                        <Text>Group ID: {item.id}</Text>
                        <Text>Contract: {item.contractAddress}</Text>
                        <Text>Amount: ₱{item.contributionAmount}</Text>
                        <Text>Frequency: {item.frequency}</Text>
                        <Text>Members Required: {item.requiredMembers}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default GroupsScreen;
