"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SubmitSuccessCardProps = {
  onSubmitAnother: () => void;
  message?: string;
};

export default function SubmitSuccessCard({
  onSubmitAnother,
  message,
}: SubmitSuccessCardProps) {
  return (
    <Card className="w-full border-cream-border bg-white/85">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <CheckCircle2 className="size-10 text-green-600" />
        <h1 className="mt-4 text-3xl font-serif text-ink">Thanks for submitting</h1>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          {message ??
            "Your receipt was successfully submitted. It helps keep prices accurate for everyone."}
        </p>
        <Button
          size="lg"
          className="mt-6 bg-home-search-button text-home-page hover:opacity-90"
          onClick={onSubmitAnother}
        >
          Submit another
        </Button>
      </CardContent>
    </Card>
  );
}
