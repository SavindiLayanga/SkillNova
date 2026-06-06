export async function analyzeCV(text) {
  try {
    const response = await fetch('/api/analyze-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze CV with API');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function analyzeManualSkills(name, skills, targetRole, experience, education) {
  try {
    const response = await fetch('/api/analyze-manual-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skills, targetRole, experience, education }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze manual skills with API');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (Manual Analysis):', error);
    throw error;
  }
}

export async function generateSkillTest(skillName, type) {
  try {
    const response = await fetch('/api/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate test with API');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (Test Generation):', error);
    throw error;
  }
}

export async function chatWithGemini(messages, apiKey_unused, cvContext) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, cvContext }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to communicate with AI Assistant.');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
}

export async function generateCustomLearningPath(targetRole, missingSkills) {
  try {
    const response = await fetch('/api/custom-learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole, missingSkills }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate custom learning path with API');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (Custom Learning Path):', error);
    throw error;
  }
}

