import React from 'react';
import { View, Text, Button } from 'react-native';

const GroupDetailsScreen = ({ route }) => {
    const { group } = route.params;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Group ID: {group.id}</Text>
            <Text>Contract Address: {group.contractAddress}</Text>
            <Text>Contribution Amount: ₱{group.contributionAmount}</Text>
            <Text>Frequency: {group.frequency}</Text> {/* Now directly shows "Weekly" or "Monthly" */}
            <Text>Members Required: {group.requiredMembers}</Text>
            <Button title="Join Group" onPress={() => alert("Joining Group...")} />
        </View>
    );
};

export default GroupDetailsScreen;
