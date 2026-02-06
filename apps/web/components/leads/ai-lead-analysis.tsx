"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Loader2,
  MessageSquare,
  Clock,
  Zap,
} from "lucide-react";

interface LeadData {
  name: string;
  industry: string;
  yearsInBusiness: number;
  city: string;
  state: string;
  website?: string;
  googleRating?: number;
  googleReviewCount?: number;
  isChain?: boolean;
  totalLocations?: number;
}

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendedActions: {
    action: string;
    priority: "high" | "medium" | "low";
    timeline: string;
  }[];
  outreachAngle: {
    openingLine: string;
    painPoint: string;
    valueProposition: string;
  };
}

interface AILeadAnalysisProps {
  lead: LeadData;
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
}

export function AILeadAnalysis({
  lead,
  onAnalysisComplete,
}: AILeadAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeLeadWithAI = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze lead");
      }

      const result = await response.json();
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            setIsOpen(true);
            if (!analysis) {
              analyzeLeadWithAI();
            }
          }}
        >
          <Sparkles className="h-4 w-4" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lead Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered insights for {lead.name}
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing lead with AI...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeLeadWithAI}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-6">
            {/* Score Card */}
            <div
              className={`p-4 rounded-lg border ${getScoreBg(analysis.score)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lead Quality Score
                  </p>
                  <p
                    className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}
                  >
                    {analysis.score}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      analysis.score >= 80
                        ? "bg-green-500/10 text-green-500"
                        : analysis.score >= 60
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                    }
                  >
                    {analysis.score >= 80
                      ? "High Quality"
                      : analysis.score >= 60
                        ? "Medium Quality"
                        : "Low Quality"}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {strength}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.weaknesses.map((weakness, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      {weakness}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Opportunities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.opportunities.map((opp, i) => (
                    <Badge key={i} variant="secondary">
                      {opp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.recommendedActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(action.priority)}
                      >
                        {action.priority}
                      </Badge>
                      <span className="text-sm">{action.action}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {action.timeline}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Outreach Angle */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Suggested Outreach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Opening Line
                  </p>
                  <p className="text-sm italic">
                    "{analysis.outreachAngle.openingLine}"
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Pain Point to Address
                  </p>
                  <p className="text-sm">{analysis.outreachAngle.painPoint}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Value Proposition
                  </p>
                  <p className="text-sm">
                    {analysis.outreachAngle.valueProposition}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={analyzeLeadWithAI}>
                <Sparkles className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Outreach
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Quick score badge for list views
export function AIScoreBadge({ score }: { score: number }) {
  const getScoreStyle = (score: number) => {
    if (score >= 80)
      return "bg-green-500/10 text-green-600 border-green-500/20";
    if (score >= 60)
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  return (
    <Badge variant="outline" className={`font-mono ${getScoreStyle(score)}`}>
      <Sparkles className="h-3 w-3 mr-1" />
      {score}
    </Badge>
  );
}
