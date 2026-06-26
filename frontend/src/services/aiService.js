import { auth } from '../config/firebase.js';

async function fetchWithAuth(url, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function analyzeCV(text) {
  try {
    return await fetchWithAuth('/api/analyze-cv', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function analyzeManualSkills(name, skills, targetRole, experience, education) {
  try {
    return await fetchWithAuth('/api/analyze-manual-skills', {
      method: 'POST',
      body: JSON.stringify({ name, skills, targetRole, experience, education }),
    });
  } catch (error) {
    console.error('API Error (Manual Analysis):', error);
    throw error;
  }
}

export async function generateSkillTest(skillName, type) {
  try {
    return await fetchWithAuth('/api/generate-test', {
      method: 'POST',
      body: JSON.stringify({ skillName, type }),
    });
  } catch (error) {
    console.error('API Error (Test Generation):', error);
    throw error;
  }
}

export async function submitSkillTest(id, userAnswers) {
  try {
    return await fetchWithAuth(`/api/user/skill-tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ userAnswers }),
    });
  } catch (error) {
    console.error('API Error (Test Submission):', error);
    throw error;
  }
}

export async function chatWithAI(messages, apiKey_unused, cvContext) {
  try {
    const data = await fetchWithAuth('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, cvContext }),
    });
    return data.text;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
}

export async function generateCustomLearningPath(targetRole, missingSkills) {
  try {
    return await fetchWithAuth('/api/custom-learning-path', {
      method: 'POST',
      body: JSON.stringify({ targetRole, missingSkills }),
    });
  } catch (error) {
    console.error('API Error (Custom Learning Path):', error);
    throw error;
  }
}

// User History Endpoints
export async function fetchCVAnalyses() {
  try {
    return await fetchWithAuth('/api/user/cv-analyses');
  } catch (error) {
    console.error('API Error (Fetch CV Analyses):', error);
    return [];
  }
}

export async function fetchManualAnalyses() {
  try {
    return await fetchWithAuth('/api/user/manual-analyses');
  } catch (error) {
    console.error('API Error (Fetch Manual Analyses):', error);
    return [];
  }
}

export async function fetchSkillTests() {
  try {
    return await fetchWithAuth('/api/user/skill-tests');
  } catch (error) {
    console.error('API Error (Fetch Skill Tests):', error);
    return [];
  }
}

export async function deleteCVAnalysis(id) {
  try {
    return await fetchWithAuth(`/api/user/cv-analyses/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('API Error (Delete CV Analysis):', error);
    throw error;
  }
}

// Practice Session Endpoints
export async function fetchCurrentPractice() {
  try {
    return await fetchWithAuth('/api/user/current-practice');
  } catch (error) {
    console.error('API Error (Fetch Current Practice):', error);
    return null;
  }
}

export async function updateCurrentPractice(data) {
  try {
    return await fetchWithAuth('/api/user/current-practice', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('API Error (Update Current Practice):', error);
    throw error;
  }
}

export async function clearCurrentPractice() {
  try {
    return await fetchWithAuth('/api/user/current-practice', {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('API Error (Clear Current Practice):', error);
    throw error;
  }
}
