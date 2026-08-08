"use client";

import { useState } from "react";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { attachDocument } from "@/app/actions/documents";
import { CATEGORIES } from "@/lib/categories";
import type { Extraction } from "@/lib/extraction";
// Import from the DB-free core, NOT "@/lib/suggestions" — that module runs
// neon(process.env.DATABASE_URL!) at load, which crashes in the browser bundle.
import {
  matchExpenseTitle,
  type ExpenseSuggestions,
} from "@/lib/suggestions-core";
import { DocumentScan } from "@/components/document-scan";
import { Input } from "@/components/ui/input";
import {
  EntitySheet,
  type EntityFormRenderProps,
} from "@/components/entity-sheet";
import { AddTrigger, Row } from "@/components/ui/data-list";
import {
  DatalistInput,
  Field,
  FormGrid,
  FormSection,
  FormSelect,
} from "@/components/ui/form-field";

export interface ServiceOption {
  id: string;
  date: string;
  description: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  title: string | null;
  payee: string | null;
  amount: string;
  category: string | null;
  notes: string | null;
  serviceId: string | null;
}

/**
 * Title/payee/category/amount are controlled in BOTH modes so that:
 *  - the document scan can prefill them (create mode), and
 *  - typing a known Title can prefill payee/category/amount (fast re-entry).
 * Date/notes stay controlled in create mode (scan) and uncontrolled in edit.
 */
function ExpenseFields({
  readOnly,
  idPrefix,
  record,
  services,
  suggestions,
  fast,
  controlledExtras,
}: EntityFormRenderProps & {
  record?: ExpenseRecord;
  services: ServiceOption[];
  suggestions: ExpenseSuggestions;
  /** Controlled fast-re-entry fields + title-match prefill (always present). */
  fast: {
    title: string;
    setTitle: (v: string) => void;
    payee: string;
    setPayee: (v: string) => void;
    amount: string;
    setAmount: (v: string) => void;
    category: string;
    setCategory: (v: string) => void;
  };
  /** Date/notes: controlled in create mode (scan), uncontrolled in edit. */
  controlledExtras?: {
    date: string;
    setDate: (v: string) => void;
    notes: string;
    setNotes: (v: string) => void;
  };
}) {
  const dateProps = controlledExtras
    ? {
        value: controlledExtras.date,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          controlledExtras.setDate(e.target.value),
      }
    : { defaultValue: record?.date ?? "" };
  const notesProps = controlledExtras
    ? {
        value: controlledExtras.notes,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          controlledExtras.setNotes(e.target.value),
      }
    : { defaultValue: record?.notes ?? "" };

  function onTitleChange(value: string) {
    fast.setTitle(value);
    // Prefill only assists on a match; unknown titles change nothing — the user
    // is never trapped and a brand-new title flows through untouched.
    const match = matchExpenseTitle(value, suggestions.expenseTitles);
    if (match) {
      fast.setPayee(match.payee ?? "");
      fast.setCategory(match.category ?? "");
      fast.setAmount(match.amount ?? "");
    }
  }

  return (
    <>
      <FormSection title="Charge">
        <Field id={`${idPrefix}-title`} label="Title" span>
          <DatalistInput
            id={`${idPrefix}-title`}
            name="title"
            options={suggestions.expenseTitles.map((t) => t.title)}
            placeholder="e.g. Hangar rent, Insurance premium"
            disabled={readOnly}
            value={fast.title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </Field>
        <FormGrid>
          <Field id={`${idPrefix}-date`} label="Date" required>
            <Input
              id={`${idPrefix}-date`}
              name="date"
              type="date"
              required
              disabled={readOnly}
              {...dateProps}
            />
          </Field>
          <Field id={`${idPrefix}-amount`} label="Amount (USD)" required>
            <Input
              id={`${idPrefix}-amount`}
              name="amount"
              inputMode="decimal"
              pattern="\d+(\.\d{1,2})?"
              placeholder="1234.56"
              required
              disabled={readOnly}
              className="font-mono"
              value={fast.amount}
              onChange={(e) => fast.setAmount(e.target.value)}
            />
          </Field>
        </FormGrid>
        <FormGrid>
          <Field id={`${idPrefix}-payee`} label="Payee">
            <DatalistInput
              id={`${idPrefix}-payee`}
              name="payee"
              options={suggestions.payees}
              placeholder="optional"
              disabled={readOnly}
              value={fast.payee}
              onChange={(e) => fast.setPayee(e.target.value)}
            />
          </Field>
          <Field id={`${idPrefix}-cat`} label="Category">
            <FormSelect
              id={`${idPrefix}-cat`}
              name="category"
              disabled={readOnly}
              value={fast.category}
              onChange={(e) => fast.setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FormSelect>
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Detail">
        <Field id={`${idPrefix}-notes`} label="Notes" span>
          <Input
            id={`${idPrefix}-notes`}
            name="notes"
            placeholder="optional"
            disabled={readOnly}
            {...notesProps}
          />
        </Field>
        <Field
          id={`${idPrefix}-svc`}
          label="Link to service"
          help="Attribute this charge to a logged maintenance event."
          span
        >
          <FormSelect
            id={`${idPrefix}-svc`}
            name="serviceId"
            disabled={readOnly}
            defaultValue={record?.serviceId ?? ""}
          >
            <option value="">None</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} · {s.description}
              </option>
            ))}
          </FormSelect>
        </Field>
      </FormSection>
    </>
  );
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    date: String(fd.get("date") ?? ""),
    title: String(fd.get("title") ?? ""),
    payee: String(fd.get("payee") ?? ""),
    amount: String(fd.get("amount") ?? ""),
    category: String(fd.get("category") ?? ""),
    notes: String(fd.get("notes") ?? ""),
    serviceId: String(fd.get("serviceId") ?? ""),
  };
}

/** "+ Add expense" — create sheet, with scan-to-prefill and doc attach. */
export function AddExpenseSheet({
  services,
  suggestions,
  aiEnabled,
  blobEnabled,
  readOnly,
}: {
  services: ServiceOption[];
  suggestions: ExpenseSuggestions;
  aiEnabled: boolean;
  blobEnabled: boolean;
  readOnly: boolean;
}) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [scannedBlobUrl, setScannedBlobUrl] = useState<string | null>(null);
  const [scannedDocType, setScannedDocType] =
    useState<Extraction["docType"]>(undefined);
  const [scannedJson, setScannedJson] = useState<string | null>(null);

  function onExtracted(fields: Extraction, blobUrl: string) {
    if (fields.date) setDate(fields.date);
    if (fields.vendor) setPayee(fields.vendor);
    if (fields.amount) setAmount(fields.amount);
    if (fields.description) setNotes(fields.description);
    setScannedBlobUrl(blobUrl);
    setScannedDocType(fields.docType ?? "invoice");
    setScannedJson(JSON.stringify(fields));
  }

  function resetScan() {
    setDate("");
    setTitle("");
    setPayee("");
    setAmount("");
    setCategory("");
    setNotes("");
    setScannedBlobUrl(null);
    setScannedDocType(undefined);
    setScannedJson(null);
  }

  return (
    <EntitySheet
      kicker="Expense"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Add expense"
      trigger={<AddTrigger label="Add expense" />}
      onSubmit={async (form) => {
        const row = await createExpense(collect(form));
        if (scannedBlobUrl && row?.id) {
          await attachDocument({
            blobUrl: scannedBlobUrl,
            docType: scannedDocType,
            extractedJson: scannedJson ?? undefined,
            entityType: "expense",
            entityId: row.id,
          });
        }
        resetScan();
      }}
    >
      {(rp) => (
        <>
          <div className="mb-6">
            <DocumentScan
              aiEnabled={aiEnabled}
              blobEnabled={blobEnabled}
              onExtracted={onExtracted}
            />
            {scannedBlobUrl && (
              <p className="mt-2 text-xs text-muted-foreground">
                Scanned document will be attached on save.
              </p>
            )}
          </div>
          <ExpenseFields
            {...rp}
            services={services}
            suggestions={suggestions}
            fast={{
              title,
              setTitle,
              payee,
              setPayee,
              amount,
              setAmount,
              category,
              setCategory,
            }}
            controlledExtras={{ date, setDate, notes, setNotes }}
          />
        </>
      )}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function ExpenseRow({
  record,
  services,
  suggestions,
  readOnly,
  meta,
  children,
}: {
  record: ExpenseRecord;
  services: ServiceOption[];
  suggestions: ExpenseSuggestions;
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Expense"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateExpense(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteExpense(record.id);
      }}
    >
      {(rp) => (
        <EditExpenseFields
          rp={rp}
          record={record}
          services={services}
          suggestions={suggestions}
        />
      )}
    </EntitySheet>
  );
}

/**
 * Edit-mode wrapper: holds the controlled fast-re-entry state seeded from the
 * row, so the datalist + title-match prefill remain available while editing.
 */
function EditExpenseFields({
  rp,
  record,
  services,
  suggestions,
}: {
  rp: EntityFormRenderProps;
  record: ExpenseRecord;
  services: ServiceOption[];
  suggestions: ExpenseSuggestions;
}) {
  const [title, setTitle] = useState(record.title ?? "");
  const [payee, setPayee] = useState(record.payee ?? "");
  const [amount, setAmount] = useState(record.amount ?? "");
  const [category, setCategory] = useState(record.category ?? "");

  return (
    <ExpenseFields
      {...rp}
      record={record}
      services={services}
      suggestions={suggestions}
      fast={{
        title,
        setTitle,
        payee,
        setPayee,
        amount,
        setAmount,
        category,
        setCategory,
      }}
    />
  );
}
