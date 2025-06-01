import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InterviewSession from './components/InterviewSession';
import FeedbackDisplay from './components/FeedbackDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import SimpleAuroraBackground from './components/ui/SimpleAuroraBackground';

const AppContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  z-index: 10;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.2rem;
`;

// Theme toggle button component
const ThemeButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.2);
  color: ${props => props.isDark ? 'white' : 'black'};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

function App() {
  const [interviewState, setInterviewState] = useState('welcome'); // welcome, interview, feedback
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isDark, setIsDark] = useState(false);

  const startInterview = () => {
    setInterviewState('interview');
  };

  const handleFeedback = (feedback) => {
    setCurrentFeedback(feedback);
    setInterviewHistory([...interviewHistory, {
      question: feedback.question,
      response: feedback.transcription,
      feedback: feedback
    }]);
    setInterviewState('feedback');
  };

  const continueInterview = () => {
    setInterviewState('interview');
  };

  const restartInterview = () => {
    setInterviewState('welcome');
    setInterviewHistory([]);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <SimpleAuroraBackground isDark={isDark}>
      <ThemeButton isDark={isDark} onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </ThemeButton>
      <AppContent>
        <Header>
          <Title style={{ color: isDark ? 'white' : '#2c3e50' }}>HR Interview Practice</Title>
          <Subtitle style={{ color: isDark ? '#a0aec0' : '#7f8c8d' }}>Improve your interview skills with AI-powered feedback</Subtitle>
        </Header>

        {interviewState === 'welcome' && (
          <WelcomeScreen onStart={startInterview} />
        )}

        {interviewState === 'interview' && (
          <InterviewSession 
            onFeedbackReceived={handleFeedback}
            questionsAnswered={interviewHistory.length} 
          />
        )}

        {interviewState === 'feedback' && (
          <FeedbackDisplay 
            feedback={currentFeedback}
            questionsAnswered={interviewHistory.length}
            onContinue={continueInterview}
            onRestart={restartInterview}
          />
        )}
      </AppContent>
    </SimpleAuroraBackground>
  );
}

export default App;
