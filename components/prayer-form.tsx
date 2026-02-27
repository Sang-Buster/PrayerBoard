"use client";

import { useState, useRef } from "react";
import { Send, EyeOff, User, MapPin, Clock, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function PrayerForm() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request.trim()) {
      setErrorMessage("Please enter your prayer request.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isAnonymous ? undefined : name.trim(),
          request: request.trim(),
          is_anonymous: isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStatus("error");
    }
  };

  const resetForm = () => {
    setName("");
    setRequest("");
    setIsAnonymous(false);
    setStatus("idle");
    setErrorMessage("");
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4 text-4xl">🙏</div>
            <h2 className="text-xl font-semibold mb-2">
              Thank You
            </h2>
            <p className="text-muted-foreground mb-6">
              Your prayer request has been received. We&apos;re praying with you.
            </p>
            <Button variant="outline" onClick={resetForm}>
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Prayer Wall - The Launch</CardTitle>
          <CardDescription className="text-sm mt-1">
            Your request will be prayed over.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Identity selector — segmented control */}
            <div className="grid grid-cols-2 rounded-lg bg-secondary/50 p-0.5 mt-4">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  !isAnonymous
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                With Name
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  isAnonymous
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <EyeOff className="h-4 w-4" />
                Anonymous
              </button>
            </div>

            {/* Name input - conditionally shown */}
            {!isAnonymous && (
              <div className="space-y-2 animate-fade-in">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            {/* Prayer request textarea */}
            <div className="space-y-2">
              <label
                htmlFor="prayer-request"
                className="text-sm font-medium text-foreground"
              >
                Prayer Request <span className="text-muted-foreground">*</span>
              </label>
              <Textarea
                id="prayer-request"
                placeholder="What would you like prayer for?"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                maxLength={2000}
                required
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                {request.length}/2000
              </p>
            </div>

            {/* Prayer location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Prayer Location
              </label>
              <div className="rounded-lg border border-white/30 px-3.5 py-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Mon-Fri at 6:30 AM</p>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Student Union, 2nd Floor</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Near the bean bags</p>
              </div>
              </div>
            </div>

            {/* Error message */}
            {status === "error" && errorMessage && (
              <p className="text-sm text-destructive animate-fade-in" role="alert">
                {errorMessage}
              </p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Prayer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
