/**
 * Utility functions for generating dynamic titles and descriptions for fallback tests.
 */

const defaultTopics = ['Core Concepts', 'Containers & Images', 'Practical Application', 'Best Practices', 'Real-world Scenarios', 'Fundamentals', 'Architecture & Design', 'Advanced Patterns'];
const testTypes = ['Practice', 'Assessment', 'Challenge', 'Test', 'Quiz'];

/**
 * Generates a dynamic title for a skill test.
 * @param {string} skill - The skill name (e.g., "Docker", "React").
 * @param {string} difficulty - The difficulty level (e.g., "Beginner", "Intermediate", "Advanced").
 * @param {number} testNumber - The test number (optional) to ensure uniqueness.
 * @param {string} type - The type of test (Practice, Assessment, Challenge).
 * @returns {string} - The dynamically generated title.
 */
export function generateDynamicTitle(skill, difficulty = 'Intermediate', testNumber = 1, type = '') {
  // Use the test number to deterministically select a topic and type to ensure uniqueness
  const topicIndex = (testNumber - 1) % defaultTopics.length;
  const typeIndex = (testNumber - 1) % testTypes.length;
  
  const selectedTopic = defaultTopics[topicIndex];
  const selectedType = type || testTypes[typeIndex];

  return `${skill}: ${selectedTopic} - ${difficulty} ${selectedType}`;
}

/**
 * Generates a dynamic description for a skill test based on the topic.
 * @param {string} skill - The skill name.
 * @param {number} testNumber - The test number to ensure uniqueness.
 * @returns {string} - The dynamically generated description.
 */
export function generateDynamicDescription(skill, testNumber = 1) {
  const topicIndex = (testNumber - 1) % defaultTopics.length;
  const selectedTopic = defaultTopics[topicIndex];

  const templates = [
    `Practice ${skill} fundamentals including ${selectedTopic.toLowerCase()}, best practices, and common workflows.`,
    `Strengthen your ${skill} knowledge through scenario-based questions and practical development tasks.`,
    `Assess your understanding of ${skill} best practices, image management, and deployment techniques.`,
    `Improve your ability to solve real-world ${skill} problems using industry-standard approaches.`,
    `Test your proficiency with ${skill}, diving deep into ${selectedTopic.toLowerCase()} and practical implementations.`
  ];
  
  const templateIndex = (testNumber - 1) % templates.length;
  return templates[templateIndex];
}
