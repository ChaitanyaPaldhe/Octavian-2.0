import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ReactMic } from 'react-mic';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const SessionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const QuestionCard = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 5px solid #3498db;
`;

const QuestionText = styled.h3`
  color: #2c3e50;
  margin: 0;
`;

const RecordingControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const RecordingVisualizer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;

  .sound-wave {
    width: 100% !important;
    height: 100px !important;
    border-radius: 8px;
  }
`;

const RecordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isRecording ? '#e74c3c' : '#27ae60'};
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  width: 180px;
  
  &:hover {
    background-color: ${props => props.isRecording ? '#c0392b' : '#219653'};
  }
  
  svg {
    margin-right: 8px;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusText = styled.p`
  color: #7f8c8d;
  text-align: center;
`;

const Timer = styled.div`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

// Sample HR interview questions
const interviewQuestions = [
  "Tell me about yourself.",
  "What are your greatest strengths?",
  "What do you consider to be your weaknesses?",
  "Why are you interested in working for our company?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
  "Describe a difficult work situation and how you overcame it.",
  "What is your greatest professional achievement?",
  "How do you handle stress and pressure?",
  "What are your salary expectations?",
  "Do you have any questions for me?"
];

const InterviewSession = ({ onFeedbackReceived, questionsAnswered = 0 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  useEffect(() => {
    // Select a question based on the number of questions already answered
    const questionIndex = questionsAnswered % interviewQuestions.length;
    setCurrentQuestion(interviewQuestions[questionIndex]);
  }, [questionsAnswered]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      setTimer(0);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const onStop = async (recordedBlob) => {
    setIsProcessing(true);
    setProcessingStatus("Converting speech to text...");
    
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', recordedBlob.blob);
      formData.append('question', currentQuestion);

      setProcessingStatus("Analyzing your response...");
      
      // Send the audio to the backend for processing
      const response = await axios.post('/api/analyze-response', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Process the feedback response
      if (response.data) {
        onFeedbackReceived({
          ...response.data,
          question: currentQuestion,
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('An error occurred while processing your response. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <SessionContainer>
      <QuestionCard>
        <QuestionText>{currentQuestion}</QuestionText>
      </QuestionCard>

      <RecordingControls>
        {isProcessing ? (
          <LoadingIndicator>
            <Spinner />
            <StatusText>{processingStatus}</StatusText>
          </LoadingIndicator>
        ) : (
          <>
            <RecordingVisualizer>
              <ReactMic
                record={isRecording}
                className="sound-wave"
                onStop={onStop}
                strokeColor="#3498db"
                backgroundColor="#f8f9fa"
              />
            </RecordingVisualizer>
            
            {isRecording && <Timer>{formatTime(timer)}</Timer>}
            
            <RecordButton 
              onClick={toggleRecording} 
              isRecording={isRecording}
            >
              {isRecording ? (
                <>
                  <FaStop /> Stop Recording
                </>
              ) : (
                <>
                  <FaMicrophone /> Start Recording
                </>
              )}
            </RecordButton>
          </>
        )}
      </RecordingControls>

      <StatusText>
        {isRecording 
          ? "Speak clearly into your microphone to answer the question" 
          : "Click the button to start recording your answer"
        }
      </StatusText>
    </SessionContainer>
  );
};

export default InterviewSession;
