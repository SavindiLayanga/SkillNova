import { useEffect, useState } from "react";
import { Clock, Eye, Trash2, AlertCircle } from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import { getAllAnalyses, deleteCVAnalysis, deleteManualAnalysis } from "../services/cvAnalysisService.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Loader from "../components/ui/Loader.jsx";
import CVAnalysisViewModal from "../components/ui/CVAnalysisViewModal.jsx";

export default function CVAnalysisHistory() {
  const { getToken } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await getAllAnalyses(token);
      // Ensure it's sorted newest first if not already sorted by backend
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnalyses(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (analysis) => {
    if (!window.confirm(`Are you sure you want to delete this ${analysis.analysisType === 'manual' ? 'manual' : 'CV'} analysis?`)) return;
    try {
      setDeletingId(analysis._id);
      const token = await getToken();
      if (analysis.analysisType === 'manual') {
        await deleteManualAnalysis(analysis._id, token);
      } else {
        await deleteCVAnalysis(analysis._id, token);
      }
      setAnalyses(prev => prev.filter(a => a._id !== analysis._id));
    } catch (err) {
      alert("Failed to delete analysis: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (analysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loader text="Loading your analysis history..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description="Review all your past CV and profile analyses."
        eyebrow="History"
      />

      {error ? (
        <Card className="p-8 text-center border-dashed border-2">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <p className="text-rose-600 font-medium">Failed to load history</p>
          <p className="text-sm text-ink-500 mt-1">{error}</p>
        </Card>
      ) : analyses.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
          <Clock className="h-12 w-12 text-ink-300 mb-4" />
          <h3 className="text-lg font-bold text-ink-900">No past analyses found</h3>
          <p className="text-ink-500 mt-2 max-w-sm">
            Upload your CV and run your first analysis to see your history here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5">
          {analyses.map(analysis => {
             const dateObj = analysis.createdAt ? new Date(analysis.createdAt) : new Date();
             const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(dateObj);
             
             return (
               <Card key={analysis._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-1 transition-transform duration-300">
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-ink-900 flex items-center flex-wrap gap-2">
                     {analysis.targetRole || "Unknown Role"}
                     <span className="text-xs font-semibold bg-ink-100 text-ink-600 px-2 py-1 rounded-full uppercase tracking-wider">
                       {analysis.analysisType === 'manual' ? 'Manual' : 'CV'}
                     </span>
                     {analysis.isActive && (
                       <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wider">
                         Active
                       </span>
                     )}
                   </h3>
                   <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-ink-600">
                     <span className="flex items-center gap-1 font-medium"><Clock className="h-4 w-4" /> {date}</span>
                     <span>CV Score: <strong className="text-ink-900">{analysis.cvScore || 0}%</strong></span>
                     <span>Skill Match: <strong className="text-ink-900">{analysis.skillMatchScore || 0}%</strong></span>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <Button variant="secondary" onClick={() => openModal(analysis)} icon={Eye}>View</Button>
                   <Button 
                     variant="secondary" 
                     className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white" 
                     icon={Trash2}
                     onClick={() => handleDelete(analysis)}
                     disabled={deletingId === analysis._id}
                   >
                     {deletingId === analysis._id ? "Deleting..." : "Delete"}
                   </Button>
                 </div>
               </Card>
             );
          })}
        </div>
      )}

      {isModalOpen && selectedAnalysis && (
        <CVAnalysisViewModal 
          analysis={selectedAnalysis} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
