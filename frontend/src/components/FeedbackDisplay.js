import React from 'react';
import styled from 'styled-components';

const FeedbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FeedbackHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const TranscriptionBox = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const TranscriptionText = styled.p`
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
`;

const FeedbackSections = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FeedbackCard = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-top: 5px solid ${props => props.color};
`;

const FeedbackTitle = styled.h3`
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Score = styled.span`
  background-color: ${props => {
    if (props.score >= 8) return '#27ae60';
    if (props.score >= 6) return '#f39c12';
    return '#e74c3c';
  }};
  color: white;
  font-size: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
`;

const FeedbackText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const CommentsList = styled.ul`
  margin-top: 1rem;
  padding-left: 1.5rem;
`;

const CommentItem = styled.li`
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#3498db' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#7f8c8d'};
  border: ${props => props.primary ? 'none' : '1px solid #7f8c8d'};
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#e9ecef'};
  }
`;

const FeedbackDisplay = ({ feedback, questionsAnswered, onContinue, onRestart }) => {
  if (!feedback) {
    return <div>No feedback available</div>;
  }

  const { 
    question, 
    transcription, 
    grammarScore, 
    confidenceScore, 
    contentScore,
    grammarComments, 
    confidenceComments, 
    contentComments,
    strengths,
    weaknesses,
    improvementSuggestions
  } = feedback;

  const isLastQuestion = questionsAnswered >= 5;

  return (
    <FeedbackContainer>
      <FeedbackHeader>
        <Title>Feedback for: "{question}"</Title>
      </FeedbackHeader>
      
      <TranscriptionBox>
        <TranscriptionText>{transcription}</TranscriptionText>
      </TranscriptionBox>
      
      <FeedbackSections>
        <FeedbackCard color="#3498db">
          <FeedbackTitle>
            Grammar
            <Score score={grammarScore}>{grammarScore}/10</Score>
          </FeedbackTitle>
          <FeedbackText>{grammarComments}</FeedbackText>
        </FeedbackCard>
        
        <FeedbackCard color="#9b59b6">
          <FeedbackTitle>
            Confidence
            <Score score={confidenceScore}>{confidenceScore}/10</Score>
          </FeedbackTitle>
          <FeedbackText>{confidenceComments}</FeedbackText>
        </FeedbackCard>
        
        <FeedbackCard color="#f1c40f">
          <FeedbackTitle>
            Content
            <Score score={contentScore}>{contentScore}/10</Score>
          </FeedbackTitle>
          <FeedbackText>{contentComments}</FeedbackText>
        </FeedbackCard>
      </FeedbackSections>
      
      <FeedbackCard color="#2c3e50">
        <FeedbackTitle>Summary Analysis</FeedbackTitle>
        
        <FeedbackText><strong>Strengths:</strong></FeedbackText>
        <CommentsList>
          {strengths && strengths.map((strength, index) => (
            <CommentItem key={`strength-${index}`}>{strength}</CommentItem>
          ))}
        </CommentsList>
        
        <FeedbackText><strong>Areas for Improvement:</strong></FeedbackText>
        <CommentsList>
          {weaknesses && weaknesses.map((weakness, index) => (
            <CommentItem key={`weakness-${index}`}>{weakness}</CommentItem>
          ))}
        </CommentsList>
        
        <FeedbackText><strong>Suggestions:</strong></FeedbackText>
        <CommentsList>
          {improvementSuggestions && improvementSuggestions.map((suggestion, index) => (
            <CommentItem key={`suggestion-${index}`}>{suggestion}</CommentItem>
          ))}
        </CommentsList>
      </FeedbackCard>
      
      <ButtonGroup>
        {!isLastQuestion && (
          <Button primary onClick={onContinue}>
            Next Question
          </Button>
        )}
        <Button onClick={onRestart}>
          {isLastQuestion ? 'Start New Practice' : 'Restart Interview'}
        </Button>
      </ButtonGroup>
    </FeedbackContainer>
  );
};

export default FeedbackDisplay;
