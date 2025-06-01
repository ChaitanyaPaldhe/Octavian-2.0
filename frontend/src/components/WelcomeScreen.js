import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
`;

const FeatureItem = styled.li`
  margin-bottom: 1rem;
  padding-left: 2rem;
  position: relative;
  
  &:before {
    content: "✓";
    color: #27ae60;
    position: absolute;
    left: 0;
  }
`;

const StartButton = styled.button`
  background-color: #3498db;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const WelcomeScreen = ({ onStart }) => {
  return (
    <WelcomeContainer>
      <Title>Welcome to Your HR Interview Practice Session</Title>
      <Description>
        Practice your interview skills with our AI-powered interview coach. Speak your responses and get instant feedback on your performance.
      </Description>
      
      <FeatureList>
        <FeatureItem>Answer common HR interview questions with your voice</FeatureItem>
        <FeatureItem>Get feedback on your grammar quality</FeatureItem>
        <FeatureItem>Analyze your confidence level based on speech patterns</FeatureItem>
        <FeatureItem>Receive content evaluation and improvement suggestions</FeatureItem>
        <FeatureItem>Track your progress across multiple practice sessions</FeatureItem>
      </FeatureList>
      
      <StartButton onClick={onStart}>
        Start Interview Practice
      </StartButton>
    </WelcomeContainer>
  );
};

export default WelcomeScreen;
