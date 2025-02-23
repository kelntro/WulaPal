import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const OnboardingTwo = ({ navigation }) => {
  return (
    <StyledView className="flex-1 bg-white px-6 justify-center items-center">
      
      {/* Skip Button */}
      <StyledTouchableOpacity onPress={() => navigation.replace('Home')} className="absolute top-12 right-6">
        <StyledText className="text-gray-700 font-bold">Skip</StyledText>
      </StyledTouchableOpacity>

      {/* Onboarding Image */}
      <Image source={require('../../assets/onboarding2.png')} className="w-56 h-56 mb-6" resizeMode="contain" />

      {/* Title & Description */}
      <StyledText className="text-lg font-bold text-center text-gray-900">
        Unlocking Financial Potential: Double Your Capacity.
      </StyledText>
      <StyledText className="text-gray-600 text-center mt-2">
        We inject saving habits to the current system by creating easy and fair saving plans.
      </StyledText>

      {/* Pagination Dots */}
      <StyledView className="flex-row mt-6 mb-6">
        <StyledView className="w-3 h-3 bg-gray-300 rounded-full mx-1" />
        <StyledView className="w-3 h-3 bg-green-700 rounded-full mx-1" />
        <StyledView className="w-3 h-3 bg-gray-300 rounded-full mx-1" />
      </StyledView>

      {/* Navigation Buttons */}
      <StyledView className="flex-row w-full px-4">
        <StyledTouchableOpacity 
          className="flex-1 bg-gray-200 rounded-full py-3 items-center mr-2"
          onPress={() => navigation.goBack()}
        >
          <StyledText className="text-gray-500 font-bold">Back</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity 
          className="flex-1 bg-green-700 rounded-full py-3 items-center ml-2"
          onPress={() => navigation.navigate('OnboardingThree')}
        >
          <StyledText className="text-white font-bold">Next</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

    </StyledView>
  );
};

export default OnboardingTwo;
