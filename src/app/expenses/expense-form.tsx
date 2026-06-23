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
import { DocumentScan } from "@/components/document-scan";
import { Input } from "@/components/ui/input";
import {
  EntitySheet,
  type EntityFormRenderProps,
} from "@/components/entity-sheet";
import { AddTrigger, Row } from "@/components/ui/data-list";
import {
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
  payee: string | null;
  amount: string;
  category: string | null;
  notes: string | null;
  serviceId: string | null;
}

function ExpenseFields({
  readOnly,
  idPrefix,
  record,
  services,
  controlled,
}: EntityFormRenderProps & {
  record?: ExpenseRecord;
  services: ServiceOption[];
  /** Controlled values (create mode, so the scan can prefill). */
  controlled?: {
    date: string;
    setDate: (v: string) => void;
    payee: string;
    setPayee: (v: string) => void;
    amount: string;
    setAmount: (v: string) => void;
    notes: string;
    setNotes: (v: string) => void;
  };
}) {
  // Edit/read-only mode uses defaultValue; create mode is controlled for scan.
  const dateProps = controlled
    ? { value: controlled.date, onChange: (e: React.ChangeEvent<HTMLInputElement>) => controlled.setDate(e.target.value) }
    : { defaultValue: record?.date ?? "" };
  const payeeProps = controlled
    ? { value: controlled.payee, onChange: (e: React.ChangeEvent<HTMLInputElement>) => controlled.setPayee(e.target.value) }
    : { defaultValue: record?.payee ?? "" };
  const amountProps = controlled
    ? { value: controlled.amount, onChange: (e: React.ChangeEvent<HTMLInputElement>) => controlled.setAmount(e.target.value) }
    : { defaultValue: record?.amount ?? "" };
  const notesProps = controlled
    ? { value: controlled.notes, onChange: (e: React.ChangeEvent<HTMLInputElement>) => controlled.setNotes(e.target.value) }
    : { defaultValue: record?.notes ?? "" };

  return (
    <>
      <FormSection title="Charge">
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
              {...amountProps}
            />
          </Field>
        </FormGrid>
        <FormGrid>
          <Field id={`${idPrefix}-payee`} label="Payee">
            <Input
              id={`${idPrefix}-payee`}
              name="payee"
              placeholder="optional"
              disabled={readOnly}
              {...payeeProps}
            />
          </Field>
          <Field id={`${idPrefix}-cat`} label="Category">
            <FormSelect
              id={`${idPrefix}-cat`}
              name="category"
              disabled={readOnly}
              defaultValue={record?.category ?? ""}
            >
              <option value="">—</option>
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
            <option value="">— none —</option>
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
  aiEnabled,
  blobEnabled,
  readOnly,
}: {
  services: ServiceOption[];
  aiEnabled: boolean;
  blobEnabled: boolean;
  readOnly: boolean;
}) {
  const [date, setDate] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
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
    setPayee("");
    setAmount("");
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
            controlled={{
              date,
              setDate,
              payee,
              setPayee,
              amount,
              setAmount,
              notes,
              setNotes,
            }}
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
  readOnly,
  meta,
  children,
}: {
  record: ExpenseRecord;
  services: ServiceOption[];
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
      {(rp) => <ExpenseFields {...rp} record={record} services={services} />}
    </EntitySheet>
  );
}
