"use client";

import { useState } from "react";
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
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  Clock,
  User,
  Building2,
  Play,
  Mic,
  MicOff,
  Volume2,
  BarChart3,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";

// Mock call logs
const mockCallLogs = [
  {
    id: "1",
    companyName: "Smith Dental Care",
    contactName: "Dr. John Smith",
    phoneNumber: "+1 (555) 123-4567",
    direction: "outbound",
    status: "completed",
    duration: 342,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    aiSummary:
      "Discussed practice needs. Interested in scheduling a demo next week.",
    sentiment: "positive",
    nextSteps: ["Send proposal", "Schedule demo for Tuesday"],
  },
  {
    id: "2",
    companyName: "Metro Medical Group",
    contactName: "Sarah Johnson",
    phoneNumber: "+1 (555) 234-5678",
    direction: "outbound",
    status: "voicemail",
    duration: 45,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    aiSummary: "Left voicemail about new compliance features.",
    sentiment: "neutral",
    nextSteps: ["Follow up call tomorrow"],
  },
  {
    id: "3",
    companyName: "Downtown Chiropractic",
    contactName: "Mike Chen",
    phoneNumber: "+1 (555) 345-6789",
    direction: "outbound",
    status: "no_answer",
    duration: 0,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    aiSummary: null,
    sentiment: null,
    nextSteps: ["Try calling again this afternoon"],
  },
  {
    id: "4",
    companyName: "Premier Law Firm",
    contactName: "Lisa Davis",
    phoneNumber: "+1 (555) 456-7890",
    direction: "inbound",
    status: "completed",
    duration: 512,
    startedAt: new Date(Date.now() - 14400000).toISOString(),
    aiSummary:
      "Inbound inquiry about case management features. Very interested, requested pricing.",
    sentiment: "positive",
    nextSteps: ["Send pricing sheet", "Schedule follow-up"],
  },
  {
    id: "5",
    companyName: "Valley Accounting",
    contactName: "Robert Wilson",
    phoneNumber: "+1 (555) 567-8901",
    direction: "outbound",
    status: "completed",
    duration: 187,
    startedAt: new Date(Date.now() - 18000000).toISOString(),
    aiSummary:
      "Not interested at this time. Just renewed contract with competitor.",
    sentiment: "negative",
    nextSteps: ["Add to re-engagement in 6 months"],
  },
];

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  // Use consistent 24-hour format to avoid hydration mismatch
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function CallsPage() {
  const [calls] = useState(mockCallLogs);
  const [showDialer, setShowDialer] = useState(false);
  const [dialNumber, setDialNumber] = useState("");

  const completedCalls = calls.filter((c) => c.status === "completed").length;
  const totalDuration = calls.reduce((sum, c) => sum + c.duration, 0);
  const avgDuration = totalDuration / completedCalls || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <PhoneCall className="h-4 w-4 text-green-500" />;
      case "voicemail":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "no_answer":
        return <PhoneMissed className="h-4 w-4 text-yellow-500" />;
      case "busy":
        return <PhoneOff className="h-4 w-4 text-red-500" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Center</h1>
          <p className="text-muted-foreground">
            Click-to-call with AI-powered transcription and analysis
          </p>
        </div>
        <Button onClick={() => setShowDialer(true)}>
          <Phone className="mr-2 h-4 w-4" />
          New Call
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <PhoneCall className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCalls}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedCalls / calls.length) * 100)}% connect rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Talk Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDuration(Math.round(avgDuration))} avg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Positive Calls
            </CardTitle>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calls.filter((c) => c.sentiment === "positive").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on AI analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Call history with AI summaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                {/* Status Icon */}
                <div className="mt-1">{getStatusIcon(call.status)}</div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{call.companyName}</h4>
                    <Badge variant="outline">
                      {call.direction === "inbound" ? "Inbound" : "Outbound"}
                    </Badge>
                    {call.sentiment && (
                      <Badge className={getSentimentColor(call.sentiment)}>
                        {call.sentiment}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {call.contactName}
                    </span>
                    <span>{call.phoneNumber}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(call.startedAt)}
                    </span>
                    {call.duration > 0 && (
                      <span>{formatDuration(call.duration)}</span>
                    )}
                  </div>

                  {/* AI Summary */}
                  {call.aiSummary && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">AI Summary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {call.aiSummary}
                      </p>
                    </div>
                  )}

                  {/* Next Steps */}
                  {call.nextSteps && call.nextSteps.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">
                        Next:
                      </span>
                      {call.nextSteps.map((step, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {step}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Time to Call */}
      <Card>
        <CardHeader>
          <CardTitle>Best Time to Call</CardTitle>
          <CardDescription>
            AI-analyzed optimal calling windows based on historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
              <div key={day} className="text-center">
                <p className="font-medium mb-2">{day}</p>
                <div className="space-y-1">
                  {[9, 10, 11, 14, 15, 16].map((hour) => {
                    const score = Math.random();
                    return (
                      <div
                        key={hour}
                        className="h-8 rounded flex items-center justify-center text-xs"
                        style={{
                          backgroundColor:
                            score > 0.7
                              ? "rgba(16, 185, 129, 0.3)"
                              : score > 0.4
                                ? "rgba(245, 158, 11, 0.3)"
                                : "rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        {hour > 12 ? `${hour - 12}PM` : `${hour}AM`}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500/30" />
              <span>High connect rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500/30" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-500/20" />
              <span>Low</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialer Modal */}
      {showDialer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>New Call</CardTitle>
              <CardDescription>
                Enter number or search for a contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="Enter phone number"
                className="text-center text-lg"
              />

              {/* Dial pad */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    className="h-12 text-lg"
                    onClick={() => setDialNumber((prev) => prev + digit)}
                  >
                    {digit}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDialer(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
