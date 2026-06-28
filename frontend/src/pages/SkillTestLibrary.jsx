import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  PlayCircle,
  Plus
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Loader from "../components/ui/Loader.jsx";
import { getAuth } from "firebase/auth";

export default function SkillTestLibrary() {
  const { skillName } = useParams();
  const skill = decodeURIComponent(skillName);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/skill-tests/library/${encodeURIComponent(skill)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let errMsg = "Failed to fetch tests";
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setTests(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skill) {
      fetchTests();
    }
  }, [skill]);

  const handleGenerateMore = async () => {
    setIsGeneratingMore(true);
    setError(null);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch(`/api/skill-tests/library/generate-more`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          skill,
          existingTests: tests,
          count: 3
        })
      });

      if (!res.ok) {
        let errMsg = "Failed to generate more tests";
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const newTests = await res.json();
      setTests(prev => [...prev, ...newTests]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleStartPractice = (testId) => {
    navigate("/skill-tests", { state: { libraryTestId: testId } });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-slide-up">
        <Loader 
          text={`Loading ${skill} Test Library...`} 
          secondaryText="If this is your first time, we are generating 6 personalized tests for you using AI." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/skill-gap" className="inline-flex items-center text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Skill Gaps
      </Link>

      <PageHeader
        title={`${skill} Test Library`}
        description={`A collection of personalized AI-generated practice tests to master ${skill}.`}
        eyebrow="Skill Library"
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test._id} className="flex flex-col h-full hover:border-primary-200 transition-all">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-ink-900">{test.title}</h3>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${test.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' : 
                      test.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-700' : 
                      'bg-purple-50 text-purple-700'}`}>
                    {test.difficulty}
                  </span>
                </div>
                {test.status === "Completed" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
              </div>

              <p className="text-sm text-ink-600 line-clamp-3">
                {test.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{test.estimatedMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{test.questionCount} questions</span>
                </div>
                {test.status === "Completed" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-ink-900">{test.score}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Attempts: {test.attempts}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-100">
              <Button 
                className="w-full justify-center" 
                variant={test.status === "Completed" ? "secondary" : "primary"}
                onClick={() => handleStartPractice(test._id)}
                icon={PlayCircle}
              >
                {test.status === "Completed" ? "Retake Test" : test.status === "In Progress" ? "Continue Test" : "Start Practice"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          variant="secondary" 
          onClick={handleGenerateMore} 
          disabled={isGeneratingMore}
          icon={isGeneratingMore ? undefined : Plus}
        >
          {isGeneratingMore ? "Generating..." : "Generate More Tests"}
        </Button>
      </div>
    </div>
  );
}
