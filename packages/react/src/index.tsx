"use client";

import React, { useState, FormEvent, ReactNode } from "react";

export interface InputHavenFormProps {
  accessKey: string;
  endpoint?: string;
  onSuccess?: (data: { submissionId: string }) => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
  honeypotField?: string;
  children: ReactNode;
  className?: string;
}

export function InputHavenForm({
  accessKey,
  endpoint = "https://inputhaven.com/api/v1/submit",
  onSuccess,
  onError,
  redirectUrl,
  honeypotField,
  children,
  className,
}: InputHavenFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("_form_id", accessKey);

    if (redirectUrl) {
      formData.set("_redirect", redirectUrl);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Submission failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } else {
        setSubmitted(true);
        onSuccess?.({ submissionId: result.submissionId });
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="_form_id" value={accessKey} />
      {honeypotField && (
        <input
          type="text"
          name={honeypotField}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />
      )}
      <InputHavenContext.Provider value={{ submitting, submitted, error }}>
        {children}
      </InputHavenContext.Provider>
    </form>
  );
}

interface InputHavenContextValue {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

const InputHavenContext = React.createContext<InputHavenContextValue>({
  submitting: false,
  submitted: false,
  error: null,
});

export function useInputHaven() {
  return React.useContext(InputHavenContext);
}

export { InputHavenContext };
