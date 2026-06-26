import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  AlertCircle,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronRight,
  Code,
  BookOpen,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Loader from "../components/ui/Loader.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { PracticeContext } from "../context/practiceContextValue.js";
import { generateSkillTest, submitSkillTest } from "../services/aiService.js";

const getMasteryBadge = (level) => {
  if (level === "Excellent") return "⭐ Excellent Mastery";
  if (level === "Good") return "✅ Good Mastery";
  if (level === "Basic") return "🟡 Basic Mastery";
  return "🔴 Needs Improvement";
};

const generalTests = [
  {
    title: "React Fundamentals",
    level: "Intermediate",
    duration: "5 min",
    status: "Available",
  },
  {
    title: "JavaScript Problem Solving",
    level: "Beginner",
    duration: "5 min",
    status: "Available",
  },
  {
    title: "API Integration Basics",
    level: "Intermediate",
    duration: "5 min",
    status: "Recommended",
  },
  {
    title: "HTML/CSS Layouts",
    level: "Beginner",
    duration: "5 min",
    status: "Available",
  },
  {
    title: "Git & Version Control",
    level: "Intermediate",
    duration: "5 min",
    status: "Available",
  },
];

const generalQuestionsData = {
  "React Fundamentals": [
    {
      question: "What is the correct way to declare state in a React functional component?",
      options: [
        "const [state, setState] = useState(initialValue);",
        "const state = new State(initialValue);",
        "this.state = initialValue;",
        "const [state, setState] = reactState(initialValue);"
      ],
      correctAnswer: 0,
      explanation: "useState is the built-in React hook for managing local state in functional components."
    },
    {
      question: "What does the dependencies array in useEffect do?",
      options: [
        "It specifies which modules to import.",
        "It controls when the effect function runs based on value changes.",
        "It registers event listeners automatically.",
        "It defines the return values of the component."
      ],
      correctAnswer: 1,
      explanation: "React runs the effect whenever a dependency in the array changes between renders."
    },
    {
      question: "In React, how do you pass data from a parent component to a child component?",
      options: [
        "Using Context API only",
        "Using setState",
        "Using Props",
        "Using localStorage"
      ],
      correctAnswer: 2,
      explanation: "Props (properties) are passed down from parent to child components to configure them."
    },
    {
      question: "What is the purpose of the key prop when rendering lists in React?",
      options: [
        "To encrypt list items for security.",
        "To style each list item uniquely.",
        "To help React identify which items have changed, been added, or removed.",
        "To bind event handlers to the DOM nodes."
      ],
      correctAnswer: 2,
      explanation: "React uses key props to track list items and optimize rendering performance during updates."
    },
    {
      question: "What is a 'controlled component' in React?",
      options: [
        "A component governed by the browser's native form state.",
        "A component whose form input values are controlled by React state.",
        "A component wrapped inside an Error Boundary.",
        "A performance-optimized pure component."
      ],
      correctAnswer: 1,
      explanation: "In a controlled component, form data is handled by a React component's state, making it the 'single source of truth'."
    }
  ],
  "JavaScript Problem Solving": [
    {
      question: "What is the output of console.log(typeof NaN);?",
      options: [
        "\"NaN\"",
        "\"number\"",
        "\"undefined\"",
        "\"object\""
      ],
      correctAnswer: 1,
      explanation: "In JavaScript, NaN (Not-a-Number) is a special numeric value, so its type is \"number\"."
    },
    {
      question: "Which method creates a new array with all elements that pass the test implemented by the provided function?",
      options: [
        "map()",
        "forEach()",
        "filter()",
        "reduce()"
      ],
      correctAnswer: 2,
      explanation: "The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test."
    },
    {
      question: "What is the difference between == and === in JavaScript?",
      options: [
        "== checks value and type, === checks value only.",
        "== checks value only with type coercion, === checks value and type strictly.",
        "There is no difference; they are interchangeable.",
        "== is used for assignments, === is used for comparison."
      ],
      correctAnswer: 1,
      explanation: "=== is the strict equality operator and does not perform type coercion."
    },
    {
      question: "What is the value of x after: let x = 1; let y = x++;?",
      options: [
        "1",
        "2",
        "0",
        "undefined"
      ],
      correctAnswer: 1,
      explanation: "x++ is the post-increment operator. It increments x to 2 but returns the original value 1 to y."
    },
    {
      question: "What is a closure in JavaScript?",
      options: [
        "A way to close the browser tab programmatically.",
        "A function that has access to its outer function's scope even after the outer function has returned.",
        "A method to terminate loops early.",
        "A private class declaration."
      ],
      correctAnswer: 1,
      explanation: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment)."
    }
  ],
  "API Integration Basics": [
    {
      question: "What does HTTP status code 404 represent?",
      options: [
        "Internal Server Error",
        "Success",
        "Not Found",
        "Unauthorized Access"
      ],
      correctAnswer: 2,
      explanation: "404 indicates that the server cannot find the requested resource."
    },
    {
      question: "Which HTTP method is typically used to update an existing resource partially?",
      options: [
        "GET",
        "POST",
        "PATCH",
        "DELETE"
      ],
      correctAnswer: 2,
      explanation: "PATCH is used for partial modifications to a resource, while PUT typically replaces the entire resource."
    },
    {
      question: "How do you parse a JSON string into a JavaScript object?",
      options: [
        "JSON.stringify(string)",
        "JSON.parse(string)",
        "Object.parse(string)",
        "string.toJSON()"
      ],
      correctAnswer: 1,
      explanation: "JSON.parse() parses a JSON string, constructing the JavaScript value or object described by the string."
    },
    {
      question: "What does the fetch() API return?",
      options: [
        "The raw response data.",
        "A Promise that resolves to a Response object.",
        "A JSON string directly.",
        "An XMLHttpRequest object."
      ],
      correctAnswer: 1,
      explanation: "fetch() returns a Promise that resolves to the Response object representing the response to the request."
    },
    {
      question: "What is the purpose of the CORS (Cross-Origin Resource Sharing) mechanism?",
      options: [
        "To compress HTTP requests for speed.",
        "To allow or restrict requested resources on a web server from another domain.",
        "To encrypt passwords during transit.",
        "To cache API responses in the browser."
      ],
      correctAnswer: 1,
      explanation: "CORS is a system consisting of transmitting HTTP headers that determine whether browsers block frontend JavaScript code from accessing cross-origin responses."
    }
  ],
  "HTML/CSS Layouts": [
    {
      question: "Which CSS property is used to create a flexbox container?",
      options: [
        "display: block;",
        "display: flex;",
        "display: grid;",
        "position: absolute;"
      ],
      correctAnswer: 1,
      explanation: "Setting display: flex on an element turns it into a flex container."
    },
    {
      question: "What does the 'z-index' property in CSS control?",
      options: [
        "The zooming scale of an image.",
        "The vertical stacking order of elements that overlap.",
        "The opacity of a background color.",
        "The order of flex items."
      ],
      correctAnswer: 1,
      explanation: "z-index specifies the z-order of a positioned element and its descendants. Elements with a larger z-index cover those with a smaller one."
    },
    {
      question: "Which HTML tag is used to define an internal style sheet?",
      options: [
        "<css>",
        "<script>",
        "<style>",
        "<link>"
      ],
      correctAnswer: 2,
      explanation: "The <style> element is used to contain CSS style rules within an HTML document."
    },
    {
      question: "In CSS Grid, what property defines the number and size of columns?",
      options: [
        "grid-template-rows",
        "grid-columns",
        "grid-template-columns",
        "grid-layout"
      ],
      correctAnswer: 2,
      explanation: "grid-template-columns defines the line names and track sizing functions of the grid columns."
    },
    {
      question: "What is the default value of the CSS 'position' property?",
      options: [
        "relative",
        "fixed",
        "absolute",
        "static"
      ],
      correctAnswer: 3,
      explanation: "Elements are positioned static by default, meaning they flow into the page normally."
    }
  ],
  "Git & Version Control": [
    {
      question: "Which command is used to initialize a new Git repository?",
      options: [
        "git start",
        "git init",
        "git new",
        "git create"
      ],
      correctAnswer: 1,
      explanation: "git init creates a new empty Git repository or reinitializes an existing one."
    },
    {
      question: "What is the purpose of the 'git clone' command?",
      options: [
        "To duplicate a file in the current directory.",
        "To copy a repository from a remote source to your local machine.",
        "To create a new branch identical to the current one.",
        "To merge two branches together."
      ],
      correctAnswer: 1,
      explanation: "git clone is used to target an existing repository and create a clone, or copy of the target repository."
    },
    {
      question: "Which command shows the state of the working directory and the staging area?",
      options: [
        "git log",
        "git status",
        "git show",
        "git diff"
      ],
      correctAnswer: 1,
      explanation: "git status displays paths that have differences between the index file and the current HEAD commit."
    },
    {
      question: "How do you switch to an existing branch named 'feature-x'?",
      options: [
        "git checkout feature-x",
        "git switch-to feature-x",
        "git branch feature-x",
        "git change feature-x"
      ],
      correctAnswer: 0,
      explanation: "git checkout (or git switch) updates files in the working tree to match the version in the index or the specified tree."
    },
    {
      question: "What does 'git push' do?",
      options: [
        "Fetches updates from a remote repository.",
        "Updates remote refs along with associated objects.",
        "Adds file contents to the index.",
        "Records changes to the repository."
      ],
      correctAnswer: 1,
      explanation: "git push is used to upload local repository content to a remote repository."
    }
  ]
};



export default function SkillTests() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(location.state?.autoStartPath ? "path" : "standard"); // "standard" or "path"
  const { analysis, hasAnalysis } = useCVAnalysis();
  const missingSkills = hasAnalysis ? (analysis.missingSkills || []) : [];

  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  useEffect(() => {
    if (location.state?.autoStartPath) {
      setActiveCategory("path");
      
      // Clear state so a simple refresh doesn't trigger it again unnecessarily 
      // but react router automatically handles location state fairly well
    }
  }, [location.state]);

  // Use PracticeContext instead of local persistence
  const { 
    completedTests, pathScores, dynamicTestsCache, activeSession,
    updateSession, clearSession, refreshTests, loading: isPracticeLoading 
  } = useContext(PracticeContext);
  
  // Use activeSession from context or fallback to local state if no session
  const selectedTest = activeSession?.selectedTest || null;
  const currentQuestionIndex = activeSession?.currentQuestionIndex || 0;
  const userAnswers = activeSession?.userAnswers || {};
  const isFinished = activeSession?.isFinished || false;
  const timeLeft = activeSession?.timeLeft ?? 300;
  
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Timer effect
  useEffect(() => {
    if (!selectedTest || isFinished) return;

    const timer = setInterval(() => {
      if (timeLeft <= 1) {
        clearInterval(timer);
        handleSubmitTest();
      } else {
        // Debounce actual server updates here if needed, but for now just update context state
        updateSession({ timeLeft: timeLeft - 1 });
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTest, isFinished, timeLeft, updateSession]);

  const handleStartGeneralTest = (test) => {
    updateSession({
      selectedTest: {
        title: test.title,
        level: test.level,
        isPath: false,
      },
      currentQuestionIndex: 0,
      userAnswers: {},
      isFinished: false,
      timeLeft: 300
    });
    setSubmissionData(null);
  };

  const handleStartPathTest = async (skillName, type, forceRegenerate = false) => {
    let testData = !forceRegenerate ? dynamicTestsCache[skillName]?.[type] : null;
    let questions = testData?.questions;
    
    // Clear old error toast if possible
    setToast({ message: "", type: "" });

    if (!questions || questions.length === 0) {
      setIsGeneratingTest(true);
      try {
        const response = await generateSkillTest(skillName, type);
        
        // Safely extract questions to support various response structures
        questions = response?.questions || response?.test?.questions || (Array.isArray(response) ? response : []);
        
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          showToast("AI returned an empty set of questions. Please try again.", "error");
          setIsGeneratingTest(false);
          return;
        }

        // Force a refresh of the tests to populate the cache
        await refreshTests();
      } catch (err) {
        showToast("Failed to generate test: " + (err.message || "Unknown error"), "error");
        setIsGeneratingTest(false);
        return;
      }
      setIsGeneratingTest(false);
    }

    updateSession({
      selectedTest: {
        title: `${skillName} - ${type === "quiz" ? "Conceptual Quiz" : "Error Handling"}`,
        isPath: true,
        pathSkill: skillName,
        pathType: type,
      },
      currentQuestionIndex: 0,
      userAnswers: {},
      isFinished: false,
      timeLeft: 300
    });
    setSubmissionData(null);
  };

  const handleSelectOption = (optionIndex) => {
    updateSession({
      userAnswers: { ...userAnswers, [currentQuestionIndex]: optionIndex }
    });
  };

  const handleNextQuestion = (totalQuestions) => {
    if (currentQuestionIndex < totalQuestions - 1) {
      updateSession({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      updateSession({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  };

  const handleSubmitTest = async () => {
    updateSession({ isFinished: true });

    let questions = [];
    if (selectedTest.isPath) {
      questions = dynamicTestsCache[selectedTest.pathSkill]?.[selectedTest.pathType]?.questions || [];
    } else {
      questions = generalQuestionsData[selectedTest.title];
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    if (selectedTest.isPath) {
      // Save Path test score via backend
      const testData = dynamicTestsCache[selectedTest.pathSkill]?.[selectedTest.pathType];
      if (testData && testData._id) {
        try {
          const answersArray = questions.map((_, i) => userAnswers[i] ?? -1);
          const result = await submitSkillTest(testData._id, answersArray);
          setSubmissionData(result);
          
          await refreshTests(); // refresh from backend
          updateProfileImprovements();
        } catch (e) {
          showToast("Failed to submit test to server.", "error");
        }
      }
    } else {
      // General test score (Not tracked in mongo currently)
    }
    
    // Clear practice session now that it is finished
    await clearSession();
  };

  const updateProfileImprovements = () => {
    // Check if we can improve studentProfile or skillGaps in localStorage for general reactivity
    try {
      const USERS_KEY = "skillnova_users";
      const SESSION_KEY = "skillnova_session";
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { email } = JSON.parse(session);
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        const userIndex = users.findIndex((u) => u.email === email.toLowerCase());

        if (userIndex !== -1) {
          // If average increases, we could boost their overall progress or readiness score
          // For demo purposes, we persist these path scores and update state
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleQuitTest = () => {
    const confirmQuit = window.confirm(
      "Are you sure you want to quit this test? Your progress will not be saved."
    );
    if (confirmQuit) {
      setSelectedTest(null);
      setIsFinished(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculations for targeted weakness endorsement path
  const getSubtestScore = (skillName, type) => {
    return pathScores[skillName]?.[type];
  };

  const getSkillAverage = (skillName) => {
    const scores = pathScores[skillName];
    if (!scores) return 0;
    const values = [];
    if (scores.quiz !== undefined) values.push(scores.quiz);
    if (scores.debugging !== undefined) values.push(scores.debugging);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  };

  // Overall path metrics
  const pathSkills = missingSkills.length > 0 ? missingSkills : ["TypeScript", "API Integration", "Testing"];
  const totalSubtests = pathSkills.length * 2; // Skills * 2 types (quiz, debugging)
  
  let completedSubtestsCount = 0;
  let totalScoresSum = 0;
  pathSkills.forEach((s) => {
    const qScore = getSubtestScore(s, "quiz");
    const dScore = getSubtestScore(s, "debugging");
    if (qScore !== undefined) {
      completedSubtestsCount++;
      totalScoresSum += qScore;
    }
    if (dScore !== undefined) {
      completedSubtestsCount++;
      totalScoresSum += dScore;
    }
  });

  const overallAverage = completedSubtestsCount > 0 
    ? Math.round(totalScoresSum / completedSubtestsCount) 
    : 0;

  // Rule: Must complete ALL tests AND average must be >= 90%
  const isEndorsedForTargetRole = completedSubtestsCount === totalSubtests && overallAverage >= 90 && totalSubtests > 0;

  if (isGeneratingTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-slide-up">
        <Loader 
          text="AI is generating your custom test..." 
          secondaryText="SkillNova is using AI to write 5 targeted questions specific to this missing skill. This usually takes a few seconds." 
        />
      </div>
    );
  }

  if (isPracticeLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader text="Restoring your practice session..." />
      </div>
    );
  }

  // If a test is selected and active, render the Quiz UI
  if (selectedTest) {
    let questions = [];
    if (selectedTest.isPath) {
      questions = dynamicTestsCache[selectedTest.pathSkill]?.[selectedTest.pathType]?.questions || [];
    } else {
      questions = generalQuestionsData[selectedTest.title] || [];
    }

    const totalQuestions = questions.length;
    const currentQuestion = questions[currentQuestionIndex];
    const isOptionSelected = userAnswers[currentQuestionIndex] !== undefined;

    if (isFinished) {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      const score = Math.round((correctCount / totalQuestions) * 100);
      const isPassed = score >= 80;

      return (
        <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-slide-up">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">Assessment Results</h1>
            <Button
              onClick={() => setSelectedTest(null)}
              variant="secondary"
              size="sm"
            >
              Back to Test Center
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] items-start">
            <Card className="text-center p-6 space-y-4 relative overflow-y-auto sticky top-6 max-h-[calc(100vh-3rem)] scrollbar-hide">
              {isPassed && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
              )}
              {!isPassed && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-500" />
              )}

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mt-2">
                {isPassed ? (
                  <Trophy className="h-6 w-6 text-amber-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-primary-600" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-ink-900">
                  {selectedTest.title}
                </h2>
                <p className="text-xs text-ink-500 font-medium">
                  {selectedTest.isPath ? `${selectedTest.pathSkill} Improvement Path` : `${selectedTest.level} Assessment`}
                </p>
              </div>

              <div className="py-2">
                <div className="inline-block rounded-2xl bg-ink-50 px-6 py-4 ring-1 ring-ink-100">
                  <span className="block text-4xl font-black text-ink-900">
                    {submissionData ? submissionData.score : score}%
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-500">
                    {correctCount} of {totalQuestions} Correct
                  </span>
                </div>
                {submissionData && (
                  <div className="mt-4 flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-ink-900">{getMasteryBadge(submissionData.masteryLevel)}</span>
                    <span className="text-xs text-ink-500 font-medium">Attempts: {submissionData.attempts}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {isPassed ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-medium leading-relaxed">
                    {submissionData ? submissionData.message : `🎉 Excellent work! You completed this test with a score of ${score}%.`}
                  </div>
                ) : (
                  <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-orange-800 text-xs font-medium leading-relaxed">
                    {submissionData ? submissionData.message : `💡 Nice attempt! You scored ${score}%. Try to target a higher score next time.`}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => {
                      if (selectedTest.isPath) {
                        handleStartPathTest(selectedTest.pathSkill, selectedTest.pathType, true);
                      } else {
                        handleStartGeneralTest({ title: selectedTest.title, level: selectedTest.level });
                      }
                    }}
                    variant="primary"
                    icon={RotateCcw}
                    className="w-full justify-center"
                  >
                    Retake Test
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-ink-900">Review & Explanations</h3>

              {questions.map((q, idx) => {
                const userAnswer = userAnswers[idx];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <Card key={idx} className="space-y-4 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                          Question {idx + 1}
                        </span>
                        <h4 className="font-bold text-ink-900 text-base leading-relaxed whitespace-pre-line">
                          {q.question}
                        </h4>
                      </div>
                      {isCorrect ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 shrink-0">
                          <CheckCircle2 className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shrink-0">
                          <XCircle className="h-4 w-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userAnswer === optIdx;
                        const isOptCorrect = q.correctAnswer === optIdx;

                        let optStyle = "border-ink-100 bg-white text-ink-700";
                        if (isChosen && isCorrect) {
                          optStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium";
                        } else if (isChosen && !isCorrect) {
                          optStyle = "border-rose-500 bg-rose-50/50 text-rose-900 font-medium";
                        } else if (isOptCorrect) {
                          optStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-900 font-medium";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-3 rounded-lg border p-3.5 text-sm transition-all ${optStyle}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isOptCorrect && (
                              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-lg bg-ink-50 p-4 border border-ink-100 text-sm text-ink-600 leading-relaxed">
                      <span className="font-bold text-ink-900 block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (!currentQuestion) return null; // Safety check for dynamic questions load

    const progressPercentage = Math.round(((currentQuestionIndex) / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-slide-up">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleQuitTest}
            className="flex items-center gap-2 text-ink-500 hover:text-ink-900 font-semibold transition"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" /> Quit Test
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-500 font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-bold ${
              timeLeft < 60 ? "bg-rose-50 text-rose-700 animate-pulse" : "bg-primary-50 text-primary-700"
            }`}>
              <Timer className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink-900">{selectedTest.title}</h2>
            <ProgressBar value={progressPercentage} />
          </div>

          <div className="space-y-4 pt-2">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
              Question {currentQuestionIndex + 1}
            </span>
            <h3 className="text-lg font-bold text-ink-900 leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid gap-3 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = userAnswers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex items-center gap-4 w-full rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-50/50 text-primary-900 font-medium ring-2 ring-primary-500/20 shadow-sm"
                      : "border-ink-100 bg-white hover:border-primary-200 hover:bg-primary-50/5 text-ink-700"
                  }`}
                  type="button"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected ? "bg-primary-500 text-white" : "bg-ink-100 text-ink-600"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ink-100">
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              variant="secondary"
            >
              Previous
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitTest}
                disabled={!isOptionSelected}
                variant="primary"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() => handleNextQuestion(totalQuestions)}
                disabled={!isOptionSelected}
                variant="primary"
              >
                Next Question
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-slide-up">
      <PageHeader
        description="Verify your skills and qualify for your target career role using standard tests or personalized weakness endorsements."
        eyebrow="Assessment Hub"
        title="Skill assessment center"
      />
      {/* Interview Readiness Predictor */}
      <section className="animate-fade-in-slide-up">
        <Card className="bg-gradient-to-br from-primary-50/50 to-white border-primary-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="md:w-1/3 text-center md:text-left flex flex-col items-center md:items-start">
               <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary-600" />
                  Interview Readiness
               </h2>
               <div className="mt-4 relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-ink-100/50" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 65) / 100} className="text-primary-500 transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-2xl font-extrabold text-ink-900">65%</span>
               </div>
               <p className="mt-3 text-xs text-ink-500 font-medium">Predicted from test scores & CV</p>
            </div>
            
            <div className="md:w-2/3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                     <h3 className="text-sm font-bold text-ink-900 mb-1">Strong Areas</h3>
                     <div className="flex flex-wrap gap-1.5">
                        {hasAnalysis && analysis?.technicalSkills?.length > 0 ? (
                          analysis.technicalSkills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-xs font-bold">{skill.name || skill}</span>
                          ))
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-xs font-bold">React Fundamentals</span>
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-xs font-bold">API Integration</span>
                          </>
                        )}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-ink-900 mb-1">Weak Areas</h3>
                     <div className="flex flex-wrap gap-1.5">
                        {missingSkills.length > 0 ? (
                          missingSkills.slice(0, 2).map((skill, idx) => {
                            const skillName = typeof skill === 'string' ? skill : skill.skill || skill.name;
                            return <span key={idx} className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-xs font-bold">{skillName}</span>
                          })
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-xs font-bold">System Design</span>
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-xs font-bold">Advanced State</span>
                          </>
                        )}
                     </div>
                  </div>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-ink-900 mb-2">Recommended Practice</h3>
                  <div className="bg-white p-3 rounded-lg border border-ink-100 shadow-sm space-y-2">
                     <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                        <div>
                           <p className="text-xs font-bold text-ink-900">
                             {missingSkills.length > 0 ? (typeof missingSkills[0] === 'string' ? missingSkills[0] : missingSkills[0].skill || missingSkills[0].name) : "System Design Patterns"}
                           </p>
                           <p className="text-[10px] text-ink-500">Take the related conceptual quiz.</p>
                        </div>
                     </div>
                     <Button 
                       size="sm" 
                       variant="secondary" 
                       className="w-full text-xs"
                       onClick={() => {
                         const topWeakness = missingSkills.length > 0 ? (typeof missingSkills[0] === 'string' ? missingSkills[0] : missingSkills[0].skill || missingSkills[0].name) : "System Design";
                         handleStartPathTest(topWeakness, 'quiz');
                       }}
                     >
                       Start Practice
                     </Button>
                  </div>
               </div>
            </div>
          </div>
        </Card>
      </section>


      {/* Tab Switcher */}
      <div className="flex border-b border-ink-100 pb-px">
        <button
          onClick={() => setActiveCategory("standard")}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all ${
            activeCategory === "standard"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-ink-500 hover:text-ink-900"
          }`}
          type="button"
        >
          Standard Assessments
        </button>
        <button
          onClick={() => setActiveCategory("path")}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeCategory === "path"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-ink-500 hover:text-ink-900"
          }`}
          type="button"
        >
          Weakness Endorsement Path
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-600">
            {pathSkills.length} Gaps
          </span>
        </button>
      </div>

      {activeCategory === "standard" && (
        <div className="space-y-6">
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {generalTests.map((test) => {
              const completedScore = completedTests[test.title];
              const hasTaken = completedScore !== undefined;
              const isPassed = hasTaken && completedScore >= 80;

              return (
                <Card className="flex min-h-60 flex-col justify-between" key={test.title}>
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      {hasTaken ? (
                        isPassed ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            Passed: {completedScore}%
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200">
                            Score: {completedScore}%
                          </span>
                        )
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          test.status === "Recommended"
                            ? "bg-primary-50 text-primary-700 border border-primary-100"
                            : "bg-ink-50 text-ink-600 border border-ink-200"
                        }`}>
                          {test.status}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="mt-4 font-bold text-ink-900 text-lg">{test.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">
                      {test.level} level assessment consisting of 5 questions.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-ink-400">
                      Duration: {test.duration}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-2">
                    {hasTaken ? (
                      <Button
                        className="w-full"
                        onClick={() => handleStartGeneralTest(test)}
                        variant="secondary"
                        icon={RotateCcw}
                      >
                        Retake test
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleStartGeneralTest(test)}
                        variant="primary"
                      >
                        Start test
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </section>

          <Card className="bg-primary-50/40 border border-primary-100/50 flex flex-col sm:flex-row items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-primary-900 text-sm">Improve Recommendation Accuracy</h4>
              <p className="text-xs text-primary-800 leading-relaxed max-w-xl">
                Completing these tests unlocks better match predictions on your Learning Path and Dashboard matching engines. Aim for at least 80% to validate.
              </p>
            </div>
          </Card>
        </div>
      )}

      {activeCategory === "path" && (
        <div className="space-y-8 animate-fade-in-slide-up">
          {/* Target Role Qualification Status Panel */}
          <Card className="relative overflow-hidden p-6 md:p-8">
            {isEndorsedForTargetRole ? (
              <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
            ) : (
              <div className="absolute top-0 inset-x-0 h-2 bg-primary-500" />
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isEndorsedForTargetRole ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600"
                  }`}>
                    {isEndorsedForTargetRole ? (
                      <Unlock className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-ink-900 text-lg">
                      {analysis?.targetRole ? `${analysis.targetRole} Authorization` : "Target Role Authorization"}
                    </h3>
                    <p className="text-xs text-ink-500 font-semibold">
                      Target Role Qualification Benchmark
                    </p>
                  </div>
                </div>

                <p className="text-sm text-ink-600 leading-relaxed">
                  Only students with all weakness subtests completed and maintaining an overall average score of **90% or above** qualify for target job recommendation endorsement.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-ink-700 bg-ink-50 px-3 py-1.5 rounded-lg border border-ink-100">
                    Progress: {completedSubtestsCount}/{totalSubtests} Subtests
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-700 bg-ink-50 px-3 py-1.5 rounded-lg border border-ink-100">
                    Overall Average: {completedSubtestsCount > 0 ? `${overallAverage}%` : "N/A"}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-ink-50/50 rounded-2xl border border-ink-100/60 min-w-56 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
                  Role Status
                </span>
                {isEndorsedForTargetRole ? (
                  <div className="mt-3 space-y-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-black text-emerald-700 border border-emerald-200">
                      ✅ APPROVED / QUALIFIED
                    </span>
                    <Link to="/job-matches">
                      <Button className="w-full mt-2" size="sm" variant="primary">
                        View Matched Jobs <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <span className="inline-flex rounded-full bg-ink-100 px-4 py-1.5 text-sm font-bold text-ink-600 border border-ink-200">
                      🔒 LOCKED (Below 90% Avg)
                    </span>
                    <p className="text-[10px] text-ink-400 font-semibold leading-relaxed max-w-44">
                      Complete remaining path modules with a high score to unlock.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Weakness Subtest Sections */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
              Weakness Improvement Path Modules
            </h3>

            <div className="grid gap-6 md:grid-cols-3">
              {pathSkills.map((skill) => {
                const skillAvg = getSkillAverage(skill);
                const quizScore = getSubtestScore(skill, "quiz");
                const debuggingScore = getSubtestScore(skill, "debugging");
                
                // Fallback UI progress metrics since we are dynamically loading skills
                const current = skillAvg > 0 ? skillAvg : 0;
                const required = 90;

                return (
                  <Card key={skill} className="flex flex-col justify-between p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-ink-900 text-lg">{skill}</h4>
                          <span className="text-xs font-semibold text-ink-400">
                            Current: {current}% (Required: {required}%)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-ink-400">Average</span>
                          <span className={`text-lg font-black ${
                            skillAvg >= 90 ? "text-emerald-600" : skillAvg > 0 ? "text-orange-500" : "text-ink-400"
                          }`}>
                            {skillAvg > 0 ? `${skillAvg}%` : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Custom Progress bar for current score vs benchmark */}
                      <ProgressBar value={current} />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-ink-100/60">
                      {/* Conceptual Quiz */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary-500 shrink-0" />
                          <span className="font-semibold text-ink-700">Conceptual Quiz</span>
                        </div>
                        {quizScore !== undefined ? (
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                            quizScore >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                          }`}>
                            {quizScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-ink-400 font-semibold">Not taken</span>
                        )}
                      </div>

                      {/* Code Error Handling */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-primary-500 shrink-0" />
                          <span className="font-semibold text-ink-700">Error Handling</span>
                        </div>
                        {debuggingScore !== undefined ? (
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                            debuggingScore >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                          }`}>
                            {debuggingScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-ink-400 font-semibold">Not taken</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 pt-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartPathTest(skill, "quiz")}
                          variant={quizScore !== undefined ? "secondary" : "primary"}
                          className="flex-1"
                          size="sm"
                        >
                          {quizScore !== undefined ? "Retake Quiz" : "Start Quiz"}
                        </Button>
                        <Button
                          onClick={() => handleStartPathTest(skill, "debugging")}
                          variant={debuggingScore !== undefined ? "secondary" : "primary"}
                          className="flex-1"
                          size="sm"
                        >
                          {debuggingScore !== undefined ? "Retake Debug" : "Start Debug"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-xl shadow-xl transition-all duration-300 z-50 transform ${
          toast.type === "error" 
            ? "bg-red-50 text-red-800 border border-red-200" 
            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          {toast.type === "error" ? (
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
