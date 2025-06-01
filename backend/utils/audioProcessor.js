const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// AssemblyAI API key
const API_KEY = '7ce029dd2d0649148c7f22ed5a45cd8d';

/**
 * Get a fallback transcription when the API fails
 * @param {string} errorMessage - Optional error message to include
 * @returns {Object} - Mock transcription response
 */
function getFallbackTranscription(errorMessage = '') {
  console.warn('Using fallback transcription:', errorMessage);
  return {
    text: errorMessage || "I couldn't clearly capture what you said. Please try speaking more clearly and ensure your microphone is working properly.",
    segments: [],
    language: "english",
    is_fallback: true
  };
}

/**
 * Process audio file and get transcription using AssemblyAI
 * @param {string} audioPath - Path to the audio file
 * @returns {Promise<Object>} - Transcription result
 */
async function processAudio(audioPath) {
  try {
    console.log(`Processing audio from: ${audioPath}`);
    
    // Convert audio to correct format (16kHz mono WAV)
    const convertedPath = await convertAudioFormat(audioPath);
    console.log(`Converted audio to: ${convertedPath}`);
    
    // Transcribe using AssemblyAI
    const result = await transcribeAudio(convertedPath);
    
    // Clean up converted file
    fs.unlink(convertedPath, (err) => {
      if (err) console.error('Error deleting converted audio file:', err);
    });
    
    return result;
  } catch (error) {
    console.error('Error in audio processing:', error);
    return getFallbackTranscription('There was an error processing your audio. Please try again.');
  }
}

/**
 * Convert audio to format acceptable by transcription services
 * @param {string} inputPath - Path to the input audio
 * @returns {Promise<string>} - Path to the converted audio
 */
function convertAudioFormat(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(path.dirname(inputPath), `converted-${path.basename(inputPath, path.extname(inputPath))}.wav`);
    
    ffmpeg(inputPath)
      .outputFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .audioBitrate(128)
      .on('error', (err) => {
        console.error('Audio conversion error:', err);
        reject(err);
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .save(outputPath);
  });
}

/**
 * Transcribe audio using AssemblyAI
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<Object>} - Transcription result
 */
async function transcribeAudio(audioFilePath) {
  try {
    console.log('Starting transcription with AssemblyAI...');
    
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      console.error(`Audio file not found: ${audioFilePath}`);
      return getFallbackTranscription('Audio file not found');
    }
    
    // Read file as binary data
    const audioData = fs.readFileSync(audioFilePath);
    console.log(`Read ${audioData.length} bytes of audio data`);
    
    // Step 1: Upload the audio file
    console.log('Uploading audio to AssemblyAI...');
    const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', audioData, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/octet-stream'
      }
    });
    
    if (!uploadResponse.data || !uploadResponse.data.upload_url) {
      console.error('Failed to get upload URL:', uploadResponse.data);
      return getFallbackTranscription('Failed to upload audio');
    }
    
    const uploadUrl = uploadResponse.data.upload_url;
    console.log('Audio uploaded successfully, URL:', uploadUrl);
    
    // Step 2: Submit the transcription request
    console.log('Requesting transcription...');
    const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
      audio_url: uploadUrl,
      language_detection: true
    }, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!transcriptResponse.data || !transcriptResponse.data.id) {
      console.error('Failed to submit transcription job:', transcriptResponse.data);
      return getFallbackTranscription('Failed to submit transcription job');
    }
    
    const transcriptId = transcriptResponse.data.id;
    console.log('Transcription requested, ID:', transcriptId);
    
    // Step 3: Poll for the result
    let result;
    const maxAttempts = 10;
    
    for (let i = 0; i < maxAttempts; i++) {
      console.log(`Checking transcription status (attempt ${i + 1}/${maxAttempts})...`);
      
      const checkResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': API_KEY
        }
      });
      
      const status = checkResponse.data.status;
      console.log(`Transcription status: ${status}`);
      
      if (status === 'completed') {
        result = checkResponse.data;
        break;
      } else if (status === 'error') {
        console.error('Transcription error:', checkResponse.data.error);
        return getFallbackTranscription(`Transcription error: ${checkResponse.data.error}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    if (!result) {
      console.warn('Transcription timed out');
      return getFallbackTranscription('Transcription timed out');
    }
    
    console.log('Transcription completed successfully!');
    return {
      text: result.text || '',
      segments: result.words || [],
      language: result.language_code || 'en'
    };
  } catch (error) {
    console.error('Error in transcription process:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message || error);
    }
    return getFallbackTranscription('Error during transcription');
  }
}

// Export the processAudio function
module.exports = {
  processAudio
};
