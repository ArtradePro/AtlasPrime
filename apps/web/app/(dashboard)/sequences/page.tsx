"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Play,
  Pause,
  Mail,
  Clock,
  Users,
  ArrowRight,
  MoreVertical,
  Sparkles,
  CheckCircle2,
  XCircle,
  BarChart3,
  Loader2,
  Trash2,
  Copy,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export default function SequencesPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(
    null,
  );
  const [newSequence, setNewSequence] = useState({
    name: "",
    description: "",
  });
  const [enrollFilters, setEnrollFilters] = useState({
    status: "new",
    minAiScore: 50,
    limit: 25,
  });

  // Get organization
  const organizations = useQuery(api.analytics.getOrganizations);
  const orgId = organizations?.[0]?._id;

  // Get sequences from Convex
  const sequences = useQuery(
    api.emailSequences.getSequences,
    orgId ? { organizationId: orgId } : "skip",
  );

  // Get templates
  const templates = useQuery(api.emailSequences.getTemplates);

  // Mutations
  const createSequence = useMutation(api.emailSequences.createSequence);
  const updateStatus = useMutation(api.emailSequences.updateSequenceStatus);
  const deleteSequence = useMutation(api.emailSequences.deleteSequence);
  const bulkEnroll = useMutation(api.emailSequences.bulkEnrollLeads);

  // Handle create sequence
  const handleCreateSequence = async () => {
    if (!orgId || !newSequence.name) return;

    try {
      await createSequence({
        organizationId: orgId,
        name: newSequence.name,
        description: newSequence.description,
        steps: [
          {
            order: 1,
            type: "email",
            subject: "Introduction",
            delayDays: 0,
            useAiPersonalization: true,
          },
          { order: 2, type: "wait", delayDays: 3, useAiPersonalization: false },
          {
            order: 3,
            type: "email",
            subject: "Follow-up",
            delayDays: 0,
            useAiPersonalization: true,
          },
        ],
      });
      toast.success("Sequence created!");
      setShowBuilder(false);
      setNewSequence({ name: "", description: "" });
    } catch (error) {
      toast.error("Failed to create sequence");
    }
  };

  // Handle create from template
  const handleCreateFromTemplate = async (template: any) => {
    if (!orgId) return;

    try {
      await createSequence({
        organizationId: orgId,
        name: template.name,
        description: template.description,
        steps: template.steps,
      });
      toast.success("Sequence created from template!");
      setShowTemplates(false);
    } catch (error) {
      toast.error("Failed to create sequence");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (
    id: Id<"emailSequences">,
    currentStatus: string,
  ) => {
    try {
      await updateStatus({
        id,
        status: currentStatus === "active" ? "paused" : "active",
      });
      toast.success(
        `Sequence ${currentStatus === "active" ? "paused" : "activated"}!`,
      );
    } catch (error) {
      toast.error("Failed to update sequence");
    }
  };

  // Handle delete
  const handleDelete = async (id: Id<"emailSequences">) => {
    if (!confirm("Are you sure you want to delete this sequence?")) return;

    try {
      await deleteSequence({ id });
      toast.success("Sequence deleted!");
    } catch (error) {
      toast.error("Failed to delete sequence");
    }
  };

  // Handle bulk enroll
  const handleBulkEnroll = async () => {
    if (!selectedSequenceId || !orgId) return;

    try {
      const result = await bulkEnroll({
        sequenceId: selectedSequenceId as Id<"emailSequences">,
        organizationId: orgId,
        filters: {
          status: enrollFilters.status,
          minAiScore: enrollFilters.minAiScore,
        },
        limit: enrollFilters.limit,
      });
      toast.success(`Enrolled ${result.enrolled} leads!`);
      setShowBulkEnroll(false);
      setSelectedSequenceId(null);
    } catch (error) {
      toast.error("Failed to enroll leads");
    }
  };

  // Loading state
  if (!organizations || !sequences) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalEnrolled = sequences.reduce(
    (sum, s) => sum + s.metrics.enrolled,
    0,
  );
  const totalReplied = sequences.reduce((sum, s) => sum + s.metrics.replied, 0);
  const totalBounced = sequences.reduce((sum, s) => sum + s.metrics.bounced, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Sequences</h1>
          <p className="text-muted-foreground">
            Automate your outreach with multi-step email campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <Copy className="mr-2 h-4 w-4" />
            From Template
          </Button>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sequence
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sequences
            </CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequences.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrolled
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrolled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnrolled > 0
                ? Math.round((totalReplied / totalEnrolled) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnrolled > 0
                ? Math.round((totalBounced / totalEnrolled) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequences List */}
      <div className="grid gap-4">
        {sequences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sequences yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email sequence to start automating outreach
              </p>
              <Button onClick={() => setShowTemplates(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create from Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          sequences.map((sequence) => (
            <Card key={sequence._id} className="overflow-hidden">
              <div className="flex">
                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {sequence.name}
                        </h3>
                        <Badge
                          variant={
                            sequence.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {sequence.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sequence.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSequenceId(sequence._id);
                          setShowBulkEnroll(true);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Enroll Leads
                      </Button>
                      {sequence.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(sequence._id, sequence.status)
                          }
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(sequence._id, sequence.status)
                          }
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sequence._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Steps visualization */}
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                    {sequence.steps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        {step.type === "email" ? (
                          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-max">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              {step.subject || "Email"}
                            </span>
                            {step.useAiPersonalization && (
                              <Sparkles className="h-3 w-3 text-purple-500" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/50 px-3 py-2 min-w-max">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Wait {step.delayDays} days
                            </span>
                          </div>
                        )}
                        {index < sequence.steps.length - 1 && (
                          <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{sequence.metrics.enrolled} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{sequence.metrics.completed} completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span>{sequence.metrics.replied} replied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{sequence.metrics.bounced} bounced</span>
                    </div>
                  </div>
                </div>

                {/* AI indicator */}
                <div className="flex items-center justify-center border-l bg-muted/30 px-4">
                  <div className="text-center">
                    <Sparkles className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">
                      AI
                      <br />
                      Personalized
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Sequence Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sequence</DialogTitle>
            <DialogDescription>
              Build an automated email sequence with AI personalization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sequence Name</Label>
              <Input
                placeholder="e.g., New Lead Welcome"
                value={newSequence.name}
                onChange={(e) =>
                  setNewSequence({ ...newSequence, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this sequence for?"
                value={newSequence.description}
                onChange={(e) =>
                  setNewSequence({
                    ...newSequence,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSequence} disabled={!newSequence.name}>
              Create Sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Start with a pre-built sequence template
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {templates?.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>
                      {
                        template.steps.filter((s: any) => s.type === "email")
                          .length
                      }{" "}
                      emails
                    </span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>
                      {template.steps
                        .filter((s: any) => s.type === "wait")
                        .reduce(
                          (sum: number, s: any) => sum + (s.delayDays || 0),
                          0,
                        )}{" "}
                      days total
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Enroll Dialog */}
      <Dialog open={showBulkEnroll} onOpenChange={setShowBulkEnroll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Leads in Sequence</DialogTitle>
            <DialogDescription>
              Select criteria to bulk enroll leads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lead Status</Label>
              <Select
                value={enrollFilters.status}
                onValueChange={(v) =>
                  setEnrollFilters({ ...enrollFilters, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum AI Score</Label>
              <Select
                value={enrollFilters.minAiScore.toString()}
                onValueChange={(v) =>
                  setEnrollFilters({
                    ...enrollFilters,
                    minAiScore: parseInt(v),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Score</SelectItem>
                  <SelectItem value="50">50+</SelectItem>
                  <SelectItem value="60">60+</SelectItem>
                  <SelectItem value="70">70+</SelectItem>
                  <SelectItem value="80">80+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maximum Leads to Enroll</Label>
              <Select
                value={enrollFilters.limit.toString()}
                onValueChange={(v) =>
                  setEnrollFilters({ ...enrollFilters, limit: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEnroll(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEnroll}>Enroll Leads</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
