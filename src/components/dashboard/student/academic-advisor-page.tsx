"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { universityApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  AcademicAssistantReply,
  AcademicRecommendation,
} from "@/api/university.api";

type ConversationMessage = {
  role: "assistant" | "student";
  text: string;
  actions?: AcademicAssistantReply["actions"];
  suggestions?: string[];
};

const initialQuestions = [
  "How do I enroll in the next semester?",
  "How do I pay my semester fee?",
  "Where can I see my results?",
];

export default function AcademicAdvisorPage() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      text: "I can help you with semester enrollment, fees, curriculum, attendance, exams, and results. What would you like to know?",
      suggestions: initialQuestions,
    },
  ]);
  const recommendationsQuery = useQuery({
    queryKey: ["university", "academic-recommendations"],
    queryFn: universityApi.academicRecommendations,
    retry: false,
  });
  const chatMutation = useMutation({
    mutationFn: universityApi.askAcademicAssistant,
    onSuccess: (response) => {
      const reply = response.data;
      setConversation((current) => [
        ...current,
        {
          role: "assistant",
          text: reply.answer,
          actions: reply.actions,
          suggestions: reply.suggestedQuestions,
        },
      ]);
    },
    onError: (error) => {
      setConversation((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? `I couldn't answer that just now: ${error.message}`
              : "I couldn't answer that just now. Please try again.",
        },
      ]);
    },
  });

  const recommendations =
    recommendationsQuery.data?.data.recommendations ?? [];

  const submitQuestion = (question = message) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || chatMutation.isPending) return;
    setConversation((current) => [
      ...current,
      { role: "student", text: trimmedQuestion },
    ]);
    setMessage("");
    chatMutation.mutate(trimmedQuestion);
  };

  const recommendationIcon = (category: AcademicRecommendation["category"]) =>
    category === "COURSEWORK" ? (
      <BookOpen className="size-4" aria-hidden="true" />
    ) : (
      <GraduationCap className="size-4" aria-hidden="true" />
    );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
          <span className="text-sm font-medium">Student support</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Academic advisor
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Get quick answers about university workflows and practical next steps
          based on your academic progress.
        </p>
        <p className="text-xs text-muted-foreground">
          Guidance is generated locally by the university system. Your messages
          are not sent to an external AI provider or saved as chat history.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <Card className="min-h-[34rem]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Ask the academic assistant
            </CardTitle>
            <CardDescription>
              Ask about enrollment, payments, curriculum, attendance, exams, or
              results.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[28rem] flex-col gap-4 py-4">
            <div
              aria-live="polite"
              className="flex flex-1 flex-col gap-4 overflow-y-auto"
            >
              {conversation.map((entry, index) => (
                <div
                  className={`max-w-[90%] space-y-3 rounded-xl p-3 ${
                    entry.role === "student"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  }`}
                  key={`${entry.role}-${index}`}
                >
                  <p className="whitespace-pre-wrap text-sm">{entry.text}</p>
                  {entry.actions?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.actions.map((action) => (
                        <Button
                          key={action.href}
                          render={<Link href={action.href} />}
                          size="sm"
                          variant={
                            entry.role === "student" ? "secondary" : "outline"
                          }
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  {entry.suggestions?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          disabled={chatMutation.isPending}
                          onClick={() => submitQuestion(suggestion)}
                          size="sm"
                          variant="outline"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {chatMutation.isPending ? (
                <div className="mr-auto flex items-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Checking university guidance…
                </div>
              ) : null}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitQuestion();
              }}
            >
              <Input
                aria-label="Ask an academic question"
                maxLength={500}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask an academic question…"
                value={message}
              />
              <Button
                aria-label="Send question"
                disabled={!message.trim() || chatMutation.isPending}
                size="icon"
                type="submit"
              >
                {chatMutation.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send aria-hidden="true" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" aria-hidden="true" />
              Recommended next steps
            </CardTitle>
            <CardDescription>
              Suggestions are based on your selected program and semester
              enrollment status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendationsQuery.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Reviewing your progress…
              </div>
            ) : recommendationsQuery.isError ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>We couldn&apos;t load your recommendations.</p>
                <Button
                  onClick={() => recommendationsQuery.refetch()}
                  size="sm"
                  variant="outline"
                >
                  Try again
                </Button>
              </div>
            ) : recommendations.length ? (
              recommendations.map((recommendation) => (
                <div
                  className="space-y-3 rounded-lg border p-4"
                  key={`${recommendation.category}-${recommendation.title}`}
                >
                  <div className="flex items-center gap-2 text-primary">
                    {recommendationIcon(recommendation.category)}
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {recommendation.category.toLowerCase()}
                    </span>
                  </div>
                  <h2 className="font-medium">{recommendation.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                  <Button
                    className="w-full"
                    render={<Link href={recommendation.href} />}
                    size="sm"
                    variant="outline"
                  >
                    View suggested step
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recommendations are available yet. Complete your student
                profile and select a program to get personalized guidance.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
