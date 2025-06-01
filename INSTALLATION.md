# HR Interview Practice App - Installation Guide

This guide will help you set up and run the HR Interview Practice application on your system.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn package manager
- A modern web browser (Chrome, Firefox, Edge)

## Installation Steps

### Backend Setup

1. Open a terminal window and navigate to the backend directory:
   ```
   cd C:\Users\chait\CascadeProjects\hr-interview-practice\backend
   ```

2. Install the backend dependencies:
   ```
   npm install
   ```
   If you're using yarn:
   ```
   yarn install
   ```

3. Create an `uploads` directory for audio file storage:
   ```
   mkdir uploads
   ```

### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd C:\Users\chait\CascadeProjects\hr-interview-practice\frontend
   ```

2. Install the frontend dependencies:
   ```
   npm install
   ```
   If you're using yarn:
   ```
   yarn install
   ```

## Running the Application

### Start the Backend Server

1. From the backend directory, run:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

2. The server should start running on port 5000.

### Start the Frontend Development Server

1. From the frontend directory, run:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

2. This will start the development server and automatically open the application in your default web browser at http://localhost:3000.

## Troubleshooting

### Script Execution Policy Issues

If you encounter PowerShell script execution policy errors:

1. Open PowerShell as Administrator
2. Run the following command to set the execution policy to allow local scripts:
   ```
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

### CORS Issues

If you experience CORS issues between the frontend and backend:

1. Ensure both servers are running
2. Check that the frontend is using the correct backend URL (http://localhost:5000)
3. Verify the CORS middleware is properly configured in the backend server.js file

## Working with the Application

1. Click "Start Interview Practice" on the welcome screen
2. Allow microphone access when prompted
3. Answer the question by speaking clearly
4. Click "Stop Recording" when you're finished
5. Wait for the system to analyze your response
6. Review the feedback provided on your grammar, confidence, and content

## Notes on Using Free/Open Source APIs

This application is designed to work with:

- Hugging Face's Whisper implementation (speech-to-text)
- LanguageTool API for grammar checking
- Local machine learning models for confidence analysis
- Various free options for text-to-speech

For production use, you'll want to obtain API keys or set up local instances of these services.
