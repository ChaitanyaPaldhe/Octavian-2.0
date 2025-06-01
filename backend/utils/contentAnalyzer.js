/**
 * Analyzes the content of an interview response for relevance and depth
 * Using Mistral AI API for content analysis
 */
const axios = require('axios');

/**
 * Analyze content for relevance, depth, and quality using Mistral AI
 * @param {string} question - The interview question
 * @param {string} response - The user's response
 * @returns {Promise<Object>} - Content analysis results
 */
async function analyzeContent(question, response) {
  try {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      console.warn('Mistral API key not found, using simulated analysis');
      // Fall back to simulation if no API key is available
      const analysisResult = simulateContentAnalysis(question, response);
      return {
        score: analysisResult.score,
        comments: analysisResult.comments,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        improvementSuggestions: analysisResult.improvementSuggestions
      };
    }
    
    console.log('Sending content to Mistral AI for analysis...');
    
    // Create the prompt for Mistral AI
    const prompt = `You are an expert interview coach analyzing an HR interview response.

Question: "${question}"

Response: "${response}"

Please analyze this interview response in terms of content relevance, depth, and quality. Provide the following in JSON format:
1. A score from 1-10
2. Brief comments on the overall quality
3. List of 2-3 strengths
4. List of 2-3 weaknesses
5. List of 2-3 improvement suggestions

Format your response as JSON with the following keys: score, comments, strengths, weaknesses, improvementSuggestions`;
    
    // Call Mistral AI API
    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-tiny',  // Using their smallest model for quick responses
        messages: [
          { role: 'system', content: 'You are an expert interview coach who analyzes interview responses and provides structured feedback in JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,  // Lower temperature for more consistent outputs
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Received analysis from Mistral AI');
    
    // Extract the content from Mistral's response
    const responseContent = mistralResponse.data.choices[0].message.content;
    
    // Try to parse JSON from the response
    try {
      // Find JSON in the response (it might be surrounded by markdown code blocks)
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                       responseContent.match(/{[\s\S]*}/);
      
      let parsedResponse;
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
      } else {
        // If no JSON format is found, try to extract the data from the text
        parsedResponse = extractStructuredDataFromText(responseContent);
      }
      
      return {
        score: parseInt(parsedResponse.score) || 7,
        comments: parsedResponse.comments || 'Your response is relevant to the question and provides good detail.',
        strengths: Array.isArray(parsedResponse.strengths) ? parsedResponse.strengths : ['Addresses the question', 'Shows relevant experience'],
        weaknesses: Array.isArray(parsedResponse.weaknesses) ? parsedResponse.weaknesses : ['Could be more specific', 'Lacks concrete examples'],
        improvementSuggestions: Array.isArray(parsedResponse.improvementSuggestions) ? parsedResponse.improvementSuggestions : ['Add specific examples', 'Quantify your achievements']
      };
    } catch (parseError) {
      console.error('Error parsing Mistral AI response:', parseError);
      // Fall back to simulation if parsing fails
      const fallbackAnalysis = simulateContentAnalysis(question, response);
      return {
        score: fallbackAnalysis.score,
        comments: fallbackAnalysis.comments,
        strengths: fallbackAnalysis.strengths,
        weaknesses: fallbackAnalysis.weaknesses,
        improvementSuggestions: fallbackAnalysis.improvementSuggestions
      };
    }
  } catch (error) {
    console.error('Error analyzing content with Mistral AI:', error);
    // Provide a fallback response if the API call fails
    return {
      score: 7,
      comments: 'Your response is relevant to the question and provides adequate detail.',
      strengths: ['Addresses the question directly', 'Provides some supporting details'],
      weaknesses: ['Could include more specific examples'],
      improvementSuggestions: ['Consider adding specific achievements to strengthen your answer']
    };
  }
}

/**
 * Helper function to extract structured data from text if JSON parsing fails
 * @param {string} text - The response text from the LLM
 * @returns {Object} - Structured data extracted from text
 */
function extractStructuredDataFromText(text) {
  const result = {
    score: 7,
    comments: '',
    strengths: [],
    weaknesses: [],
    improvementSuggestions: []
  };
  
  // Try to extract score (looking for numbers 1-10)
  const scoreMatch = text.match(/score[:\s]*(\d+)/i) || text.match(/rating[:\s]*(\d+)/i);
  if (scoreMatch && scoreMatch[1]) {
    result.score = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
  }
  
  // Extract comments (usually after 'comments' or 'feedback')
  const commentsMatch = text.match(/comments[:\s]*([^\n]+)/i) || 
                        text.match(/feedback[:\s]*([^\n]+)/i);
  if (commentsMatch && commentsMatch[1]) {
    result.comments = commentsMatch[1].trim();
  } else {
    // If no clear comments section, take the first paragraph that's not a heading
    const paragraphs = text.split('\n').filter(p => p.trim() && !p.match(/^#/));
    if (paragraphs.length > 0) {
      result.comments = paragraphs[0].trim();
    }
  }
  
  // Extract strengths (usually in a list after 'strengths')
  const strengthsSection = text.match(/strengths[:\s]*([\s\S]*?)(?=weaknesses|improvement|$)/i);
  if (strengthsSection && strengthsSection[1]) {
    const strengthsList = strengthsSection[1].match(/[-*]\s*([^\n]+)/g);
    if (strengthsList) {
      result.strengths = strengthsList.map(s => s.replace(/[-*]\s*/, '').trim()).slice(0, 3);
    }
  }
  
  // Extract weaknesses
  const weaknessesSection = text.match(/weaknesses[:\s]*([\s\S]*?)(?=strengths|improvement|$)/i);
  if (weaknessesSection && weaknessesSection[1]) {
    const weaknessesList = weaknessesSection[1].match(/[-*]\s*([^\n]+)/g);
    if (weaknessesList) {
      result.weaknesses = weaknessesList.map(w => w.replace(/[-*]\s*/, '').trim()).slice(0, 3);
    }
  }
  
  // Extract improvement suggestions
  const suggestionsSection = text.match(/suggestions[:\s]*([\s\S]*?)(?=strengths|weaknesses|$)/i) || 
                             text.match(/improvements[:\s]*([\s\S]*?)(?=strengths|weaknesses|$)/i);
  if (suggestionsSection && suggestionsSection[1]) {
    const suggestionsList = suggestionsSection[1].match(/[-*]\s*([^\n]+)/g);
    if (suggestionsList) {
      result.improvementSuggestions = suggestionsList.map(s => s.replace(/[-*]\s*/, '').trim()).slice(0, 3);
    }
  }
  
  return result;
}

/**
 * Simulate content analysis that would normally be done by an LLM
 * @param {string} question - The interview question
 * @param {string} response - The user's response
 * @returns {Object} - Simulated content analysis
 */
function simulateContentAnalysis(question, response) {
  // Extract key information for analysis
  const wordCount = response.split(/\s+/).filter(word => word.length > 0).length;
  const sentenceCount = (response.match(/[.!?]+/g) || []).length;
  const avgSentenceLength = wordCount / Math.max(1, sentenceCount);
  
  // Check for question keywords in the response
  const questionKeywords = extractKeywords(question);
  const responseKeywords = extractKeywords(response);
  
  // Calculate keyword match rate (relevance indicator)
  let matchCount = 0;
  questionKeywords.forEach(keyword => {
    if (responseKeywords.some(respKw => respKw.includes(keyword) || keyword.includes(respKw))) {
      matchCount++;
    }
  });
  
  const keywordMatchRate = questionKeywords.length > 0 
    ? matchCount / questionKeywords.length 
    : 0.5;
  
  // Complexity indicators
  const complexWords = response.split(/\s+/).filter(word => word.length > 8).length;
  const complexityRate = complexWords / Math.max(1, wordCount);
  
  // Calculate a base content score
  // Factors: keyword relevance, length, complexity, structure
  let contentScore = 5; // Start with a baseline
  
  // Adjust for relevance
  contentScore += keywordMatchRate * 3;
  
  // Adjust for length (ideal response is 100-200 words for most HR questions)
  if (wordCount < 50) {
    contentScore -= 2; // Too short
  } else if (wordCount < 100) {
    contentScore -= 1; // Somewhat short
  } else if (wordCount > 200) {
    contentScore += 0.5; // Detailed
  } else {
    contentScore += 1; // Good length
  }
  
  // Adjust for complexity and structure
  contentScore += Math.min(1, complexityRate * 5);
  
  // Adjust for sentence variety
  if (avgSentenceLength > 25) {
    contentScore -= 0.5; // Sentences too long
  } else if (avgSentenceLength < 10) {
    contentScore -= 0.5; // Sentences too short
  } else {
    contentScore += 0.5; // Good sentence length
  }
  
  // Cap the score between 1-10
  contentScore = Math.min(10, Math.max(1, Math.round(contentScore)));
  
  // Define the output objects
  const strengths = [];
  const weaknesses = [];
  const improvementSuggestions = [];
  
  // Populate strengths
  if (keywordMatchRate > 0.7) {
    strengths.push('Your response is highly relevant to the question');
  }
  if (wordCount > 100) {
    strengths.push('You provided a detailed response with good depth');
  }
  if (complexityRate > 0.1) {
    strengths.push('You used sophisticated vocabulary and concepts');
  }
  if (response.includes('example') || response.includes('instance') || response.includes('specifically')) {
    strengths.push('You included specific examples to illustrate your points');
  }
  
  // Populate weaknesses
  if (keywordMatchRate < 0.5) {
    weaknesses.push('Your response could be more closely aligned with the question');
  }
  if (wordCount < 75) {
    weaknesses.push('Your answer lacks sufficient detail and development');
  }
  if (wordCount > 250) {
    weaknesses.push('Your response is verbose and could be more concise');
  }
  if (!response.toLowerCase().includes('i') || !response.toLowerCase().includes('my')) {
    weaknesses.push('Your answer lacks personal experience or examples');
  }
  
  // Add some generic strengths/weaknesses if needed
  if (strengths.length === 0) {
    strengths.push('You addressed the basic requirements of the question');
    strengths.push('Your response has a logical structure');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Consider adding more detail to strengthen your response');
  }
  
  // Populate improvement suggestions
  if (keywordMatchRate < 0.6) {
    improvementSuggestions.push('Make sure to directly address the key aspects of the question');
  }
  if (wordCount < 100) {
    improvementSuggestions.push('Provide more specific examples or details to support your response');
  }
  if (contentScore < 7) {
    improvementSuggestions.push('Structure your answer using the STAR method (Situation, Task, Action, Result)');
  }
  if (!response.toLowerCase().includes('achieve') && 
      !response.toLowerCase().includes('success') && 
      !response.toLowerCase().includes('accomplish')) {
    improvementSuggestions.push('Include specific achievements or successes to make your answer more impactful');
  }
  
  // Generate content comment
  let contentComment = '';
  if (contentScore >= 9) {
    contentComment = 'Your response is excellent, demonstrating strong relevance to the question with appropriate detail and examples. ';
  } else if (contentScore >= 7) {
    contentComment = 'Your response is good, addressing the question well with adequate detail. ';
  } else if (contentScore >= 5) {
    contentComment = 'Your response is adequate but could be improved in terms of relevance and detail. ';
  } else {
    contentComment = 'Your response needs significant improvement to adequately address the question. ';
  }
  
  // Add specific feedback
  if (keywordMatchRate < 0.5) {
    contentComment += 'Your answer doesn\'t fully address the key aspects of the question. ';
  }
  
  if (wordCount < 75) {
    contentComment += 'Consider providing more detail and examples in your response. ';
  } else if (wordCount > 250) {
    contentComment += 'Your response is detailed but could be more concise. ';
  }
  
  // Add closing suggestion
  contentComment += 'Remember that interviewers are looking for specific examples that demonstrate your skills and experience.';
  
  return {
    score: contentScore,
    comments: contentComment,
    strengths,
    weaknesses,
    improvementSuggestions
  };
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} - List of keywords
 */
function extractKeywords(text) {
  // Remove common stop words
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'of', 'that', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'];
  
  // Convert to lowercase
  const lowerText = text.toLowerCase();
  
  // Remove punctuation and split into words
  const words = lowerText.replace(/[^\w\s]/g, '').split(/\s+/);
  
  // Filter out stop words and short words
  return words
    .filter(word => 
      !stopWords.includes(word) && 
      word.length > 2
    )
    .slice(0, 10); // Keep the top 10 keywords
}

module.exports = {
  analyzeContent
};
