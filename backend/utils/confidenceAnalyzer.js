const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Analyze speech confidence based on audio features
 * @param {string} audioPath - Path to the audio file
 * @param {string} transcription - Transcription of the audio
 * @returns {Promise<Object>} - Confidence analysis results
 */
async function analyzeConfidence(audioPath, transcription) {
  try {
    // In a production environment, we would:
    // 1. Extract audio features using ffmpeg/librosa/etc.
    // 2. Analyze pitch variation, speaking rate, pauses, etc.
    // 3. Use ML models to detect confidence markers
    
    // For this demo, we'll simulate the analysis with reasonable metrics
    // that would typically be extracted from the audio
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate simulated metrics
    const metrics = simulateSpeechMetrics(transcription);
    
    // Calculate confidence score based on simulated metrics
    let confidenceScore = calculateConfidenceScore(metrics);
    
    // Create feedback comments based on the metrics
    const comments = generateConfidenceFeedback(metrics, confidenceScore);
    
    return {
      score: confidenceScore,
      comments,
      metrics
    };
  } catch (error) {
    console.error('Error analyzing confidence:', error);
    // Provide a fallback if analysis fails
    return {
      score: 7,
      comments: 'Your speaking confidence appears to be good based on your delivery pattern. Consider maintaining a steady pace and varying your tone to enhance audience engagement.',
      metrics: {
        speakingRate: 150,
        pauseRate: 0.15,
        fillerWordRate: 0.02,
        pitchVariation: 0.6,
        volumeVariation: 0.5
      }
    };
  }
}

/**
 * Simulate speech metrics that would normally be extracted from audio analysis
 * @param {string} transcription - The transcribed text
 * @returns {Object} - Simulated speech metrics
 */
function simulateSpeechMetrics(transcription) {
  // Count words
  const words = transcription.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Estimate speaking duration based on word count (average speaking rate ~150 wpm)
  const estimatedDuration = wordCount / 2.5; // in seconds
  
  // Detect potential filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'basically', 'actually'];
  const fillerCount = words.filter(word => 
    fillerWords.includes(word.toLowerCase())
  ).length;
  
  // Calculate filler word rate
  const fillerWordRate = fillerCount / wordCount;
  
  // Estimate speaking rate (words per minute)
  const speakingRate = (wordCount / estimatedDuration) * 60;
  
  // Estimate pause rate (based on punctuation as a proxy)
  const punctuationCount = (transcription.match(/[.!?,;]/g) || []).length;
  const pauseRate = punctuationCount / wordCount;
  
  // Generate simulated pitch and volume variation (0-1 scale)
  // Higher values suggest more dynamic and engaging speech
  const pitchVariation = 0.4 + Math.random() * 0.4; // 0.4-0.8 range
  const volumeVariation = 0.4 + Math.random() * 0.4; // 0.4-0.8 range
  
  return {
    wordCount,
    estimatedDuration,
    speakingRate,
    pauseRate,
    fillerWordRate,
    pitchVariation,
    volumeVariation
  };
}

/**
 * Calculate confidence score based on speech metrics
 * @param {Object} metrics - Speech metrics
 * @returns {number} - Confidence score (1-10)
 */
function calculateConfidenceScore(metrics) {
  let score = 7; // Start with a baseline score
  
  // Adjust score based on speaking rate
  // Ideal rate is ~150 wpm - too fast or too slow reduces score
  if (metrics.speakingRate > 180) {
    score -= 0.5; // Too fast
  } else if (metrics.speakingRate < 120) {
    score -= 0.5; // Too slow
  } else {
    score += 0.5; // Good pace
  }
  
  // Adjust for filler word usage
  if (metrics.fillerWordRate > 0.05) {
    score -= metrics.fillerWordRate * 30; // Heavy penalty for lots of fillers
  } else {
    score += 0.5; // Minimal fillers is good
  }
  
  // Adjust for pitch variation (vocal dynamism)
  score += (metrics.pitchVariation - 0.5) * 2;
  
  // Adjust for volume variation
  score += (metrics.volumeVariation - 0.5) * 1.5;
  
  // Adjust for appropriate pausing
  if (metrics.pauseRate < 0.05) {
    score -= 1; // Too few pauses
  } else if (metrics.pauseRate > 0.2) {
    score += 0.5; // Good pausing
  }
  
  // Cap the score between 1-10
  return Math.min(10, Math.max(1, Math.round(score)));
}

/**
 * Generate feedback comments based on speech metrics and confidence score
 * @param {Object} metrics - Speech metrics
 * @param {number} score - Confidence score
 * @returns {string} - Feedback comments
 */
function generateConfidenceFeedback(metrics, score) {
  let comments = '';
  
  // Base comment on overall score
  if (score >= 9) {
    comments = 'Your delivery demonstrates exceptional confidence. ';
  } else if (score >= 7) {
    comments = 'You speak with good confidence. ';
  } else if (score >= 5) {
    comments = 'Your speaking confidence is adequate but could be improved. ';
  } else {
    comments = 'Your delivery lacks confidence and needs significant improvement. ';
  }
  
  // Add specific feedback on speaking rate
  if (metrics.speakingRate > 180) {
    comments += 'Your speaking pace is quite fast, which might make it difficult for listeners to follow. Try slowing down. ';
  } else if (metrics.speakingRate < 120) {
    comments += 'You speak somewhat slowly, which might reduce perceived confidence. Try increasing your pace slightly. ';
  } else {
    comments += 'Your speaking pace is well-balanced. ';
  }
  
  // Add feedback on filler words
  if (metrics.fillerWordRate > 0.08) {
    comments += 'You use a high number of filler words like "um" or "uh", which significantly reduces perceived confidence. ';
  } else if (metrics.fillerWordRate > 0.03) {
    comments += 'Try to reduce your use of filler words to sound more confident. ';
  } else {
    comments += 'You use minimal filler words, which enhances your perceived confidence. ';
  }
  
  // Add feedback on vocal variety
  if (metrics.pitchVariation < 0.5) {
    comments += 'Your tone lacks variation, which can make your delivery sound monotonous. Try varying your pitch to engage listeners. ';
  } else {
    comments += 'Your voice has good tonal variety, helping to maintain listener engagement. ';
  }
  
  // Add general improvement tip
  if (score < 8) {
    comments += 'Practice speaking with deliberate pauses and emphasis on key points to enhance your confidence.';
  } else {
    comments += 'Maintain this confident speaking style in your interviews.';
  }
  
  return comments;
}

module.exports = {
  analyzeConfidence
};
