"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { markSubmissionRead, deleteSubmission } from "@/actions/submissions";
import { formatDate, truncate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";

interface Submission {
  id: string;
  data: unknown;
  isRead: boolean;
  isSpam: boolean;
  createdAt: Date;
  files: { id: string; fileName: string; fileSize: number }[];
}

interface SubmissionsTableProps {
  submissions: Submission[];
  formId: string;
  page: number;
  totalPages: number;
  search?: string;
}

export function SubmissionsTable({
  submissions,
  formId,
  page,
  totalPages,
  search,
}: SubmissionsTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No submissions yet. Share your form to start collecting responses.
      </div>
    );
  }

  // Get all unique keys from submissions
  const allKeys = new Set<string>();
  submissions.forEach((sub) => {
    const data = sub.data as Record<string, unknown>;
    Object.keys(data).forEach((key) => allKeys.add(key));
  });
  const displayKeys = Array.from(allKeys).slice(0, 4);

  const handleMarkRead = async (id: string) => {
    setLoading(id);
    await markSubmissionRead(id);
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setLoading(id);
    await deleteSubmission(id);
    setLoading(null);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            {displayKeys.map((key) => (
              <TableHead key={key}>{key}</TableHead>
            ))}
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => {
            const data = sub.data as Record<string, unknown>;
            return (
              <TableRow key={sub.id}>
                <TableCell>
                  {sub.isRead ? (
                    <Badge variant="secondary">Read</Badge>
                  ) : (
                    <Badge>New</Badge>
                  )}
                </TableCell>
                {displayKeys.map((key) => (
                  <TableCell key={key}>
                    {truncate(String(data[key] ?? ""), 50)}
                  </TableCell>
                ))}
                <TableCell className="text-muted-foreground">
                  {formatDate(sub.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!sub.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(sub.id)}
                        disabled={loading === sub.id}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sub.id)}
                      disabled={loading === sub.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/forms/${formId}?page=${page - 1}${search ? `&search=${search}` : ""}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/forms/${formId}?page=${page + 1}${search ? `&search=${search}` : ""}`}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
