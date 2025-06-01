const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { processAudio } = require('./utils/audioProcessor');
const { checkGrammar } = require('./utils/grammarChecker');
const { analyzeContent } = require('./utils/contentAnalyzer');
const { analyzeConfidence } = require('./utils/confidenceAnalyzer');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

// API Routes
app.post('/api/analyze-response', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    const question = req.body.question;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`Processing audio file: ${audioFile.filename}`);
    
    // Step 1: Convert audio to text
    const transcriptionResult = await processAudio(audioFile.path);
    const transcription = transcriptionResult.text;
    
    console.log(`Transcription: "${transcription}"`);

    // Step 2: Check grammar
    const grammarResult = await checkGrammar(transcription);
    
    // Step 3: Analyze confidence from audio features
    const confidenceResult = await analyzeConfidence(audioFile.path, transcription);
    
    // Step 4: Analyze content relevance and quality
    const contentResult = await analyzeContent(question, transcription);
    
    // Delete the temporary audio file
    fs.unlink(audioFile.path, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });

    // Return the combined analysis
    res.status(200).json({
      question,
      transcription,
      grammarScore: grammarResult.score,
      grammarComments: grammarResult.comments,
      confidenceScore: confidenceResult.score,
      confidenceComments: confidenceResult.comments,
      confidenceMetrics: confidenceResult.metrics,
      contentScore: contentResult.score,
      contentComments: contentResult.comments,
      strengths: contentResult.strengths || [],
      weaknesses: contentResult.weaknesses || [],
      improvementSuggestions: contentResult.improvementSuggestions || []
    });

  } catch (error) {
    console.error('Error processing interview response:', error);
    res.status(500).json({ error: 'Error processing interview response', details: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
