import React from 'react';
import styled, { keyframes } from 'styled-components';

// Create keyframes for the aurora animation
const auroraAnimation = keyframes`
  0% {
    background-position: 0% 0%, 0% 0%;
  }
  50% {
    background-position: 100% 100%, 100% 100%;
  }
  100% {
    background-position: 0% 0%, 0% 0%;
  }
`;

// Styled components for the aurora background
const AuroraContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-color: ${props => props.isDark ? '#1a1a2e' : '#f5f5f5'};
`;

const AuroraEffect = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background-image: ${props => props.isDark ? 
    'repeating-linear-gradient(100deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) 7%, transparent 10%, transparent 12%, rgba(0,0,0,0.7) 16%),' +
    'repeating-linear-gradient(100deg, rgba(32, 80, 196, 0.5) 10%, rgba(60, 60, 195, 0.5) 15%, rgba(40, 140, 255, 0.5) 20%, rgba(180, 60, 210, 0.5) 25%, rgba(60, 120, 255, 0.5) 30%)'
    : 
    'repeating-linear-gradient(100deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 7%, transparent 10%, transparent 12%, rgba(255,255,255,0.7) 16%),' +
    'repeating-linear-gradient(100deg, rgba(64, 120, 245, 0.3) 10%, rgba(120, 120, 250, 0.3) 15%, rgba(100, 180, 255, 0.3) 20%, rgba(200, 120, 250, 0.3) 25%, rgba(120, 160, 255, 0.3) 30%)'
  };
  background-size: 300% 300%, 200% 200%;
  background-position: 50% 50%, 50% 50%;
  filter: blur(10px);
  opacity: 0.7;
  pointer-events: none;
  animation: ${auroraAnimation} 15s linear infinite;
  mask-image: ${props => props.showRadialGradient ? 
    'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)' : 
    'none'
  };
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
`;

export const SimpleAuroraBackground = ({ 
  children, 
  isDark = false, 
  showRadialGradient = true 
}) => {
  return (
    <AuroraContainer isDark={isDark}>
      <AuroraEffect 
        isDark={isDark} 
        showRadialGradient={showRadialGradient} 
      />
      <ContentContainer>
        {children}
      </ContentContainer>
    </AuroraContainer>
  );
};

export default SimpleAuroraBackground;
