import { FileUp } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function AnalysisEmptyState() {
  return (
    <Card className="flex min-h-[360px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <FileUp className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-ink-900">
        Upload your CV to begin skill analysis.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">
        SkillNova will generate your CV score, skill gaps, course
        recommendations, job matches, and progress dashboard after the analysis
        is complete.
      </p>
      <Button as={Link} className="mt-6" icon={FileUp} to="/cv-upload">
        Upload CV
      </Button>
    </Card>
  );
}
