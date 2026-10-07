"use client";
import { useState } from "react";
import { useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import type { ProjectFormValues } from "./types";

const MAX_LENGTH = 100;

function parseLines(raw: string, existing: string[]): string[] {
  const seen = new Set(existing.map((v) => v.trim().toLowerCase()));
  const result: string[] = [];
  for (const line of raw.split("\n")) {
    const value = line.trim().slice(0, MAX_LENGTH);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

export function StepFeatures({
  control,
  register,
}: {
  control: Control<ProjectFormValues>;
  register: UseFormRegister<ProjectFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "features" });
  const [bulkText, setBulkText] = useState("");
  const [bulkGroupName, setBulkGroupName] = useState("");

  const current = useWatch({ control, name: "features" }) ?? [];
  const pending = parseLines(
    bulkText,
    current.map((f) => f?.title ?? "")
  );

  const addBulk = () => {
    if (pending.length === 0) return;
    const group = bulkGroupName.trim() || undefined;
    append(pending.map((title) => ({ title, groupName: group, description: "" })));
    setBulkText("");
    setBulkGroupName("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold">Features & Capabilities</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Highlight what the project does. Features can optionally be grouped (e.g. &ldquo;Access and users&rdquo;, &ldquo;Payments &amp; Billing&rdquo;), or left without a group.
        </p>
      </div>

      {/* Bulk add with optional group */}
      <div className="flex flex-col gap-3.5 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <FormField label="Group name (optional)" htmlFor="feat-bulk-group" optional>
              <Input
                id="feat-bulk-group"
                value={bulkGroupName}
                onChange={(e) => setBulkGroupName(e.target.value)}
                placeholder="e.g. Access and users, Core Features (leave blank for ungrouped)"
              />
            </FormField>
          </div>
        </div>

        <FormField label="Feature titles (one per line)" htmlFor="feat-bulk">
          <textarea
            id="feat-bulk"
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addBulk();
              }
            }}
            placeholder={"Role-based permissions\nSingle sign-on via Google\nAudit activity trail"}
            className="w-full resize-y rounded-[var(--radius-md)] border border-border bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </FormField>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted-foreground">Ctrl/Cmd + Enter to quickly add all lines.</span>
          <Button type="button" variant="secondary" disabled={pending.length === 0} onClick={addBulk}>
            <Plus className="size-4" />
            {pending.length > 0 ? `Add ${pending.length} features` : "Add features"}
          </Button>
        </div>
      </div>

      {/* Configured features list */}
      {fields.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="w-1/3 px-4 py-2.5 font-medium">Group (optional)</th>
                <th className="px-4 py-2.5 font-medium">Feature Title</th>
                <th className="w-12 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fields.map((field, i) => (
                <tr key={field.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">
                    <Input
                      aria-label={`Feature ${i + 1} group`}
                      placeholder="No group"
                      className="border-transparent bg-transparent px-0 py-1 text-muted-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-surface focus:px-3 focus:text-foreground"
                      {...register(`features.${i}.groupName`)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      aria-label={`Feature ${i + 1} title`}
                      placeholder="Feature title..."
                      className="border-transparent bg-transparent px-0 py-1 font-medium focus:border-primary focus:bg-surface focus:px-3"
                      {...register(`features.${i}.title`)}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove feature"
                      onClick={() => remove(i)}
                      className="text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ title: "", groupName: "", description: "" })}
        >
          <Plus className="size-4" />
          Add single feature
        </Button>
      </div>
    </div>
  );
}
