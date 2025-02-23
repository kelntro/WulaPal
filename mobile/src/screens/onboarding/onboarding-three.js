import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const OnboardingThree = ({ navigation }) => {
  return (
    <StyledView className="flex-1 bg-white px-6 justify-center items-center">
      
      {/* Onboarding Image */}
      <Image source={require('../../assets/onboarding3.png')} className="w-56 h-56 mb-6" resizeMode="contain" />

      {/* Title & Description */}
      <StyledText className="text-lg font-bold text-center text-gray-900">
        Start saving for a better tomorrow
      </StyledText>
      <StyledText className="text-gray-600 text-center mt-2">
        Use Cloud Cooperative to plan towards your dream home, kids' education, and travel the world.
      </StyledText>

      {/* Pagination Dots */}
      <StyledView className="flex-row mt-6 mb-6">
        <StyledView className="w-3 h-3 bg-gray-300 rounded-full mx-1" />
        <StyledView className="w-3 h-3 bg-gray-300 rounded-full mx-1" />
        <StyledView className="w-3 h-3 bg-green-700 rounded-full mx-1" />
      </StyledView>

      {/* Get Started Button */}
      <StyledTouchableOpacity 
        className="w-4/5 bg-green-700 rounded-full py-3 items-center"
        onPress={() => navigation.replace('Groups')}
      >
        <StyledText className="text-white font-bold">Get Started</StyledText>
      </StyledTouchableOpacity>

    </StyledView>
  );
};

export default OnboardingThree;
