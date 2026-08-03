"use client";

import { createNote, updateNote, deleteNote } from "@/app/actions/notes";
import { Input } from "@/components/ui/input";
import {
  EntitySheet,
  type EntityFormRenderProps,
} from "@/components/entity-sheet";
import { AddTrigger, Row } from "@/components/ui/data-list";
import { Field, FormSection } from "@/components/ui/form-field";

export interface NoteRecord {
  id: string;
  date: string;
  text: string;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    date: String(fd.get("date") ?? ""),
    text: String(fd.get("text") ?? ""),
  };
}

function NoteFields({
  readOnly,
  idPrefix,
  record,
  today,
}: EntityFormRenderProps & { record?: NoteRecord; today: string }) {
  return (
    <FormSection title="Note">
      <Field id={`${idPrefix}-date`} label="Date" required span>
        <Input
          id={`${idPrefix}-date`}
          name="date"
          type="date"
          required
          disabled={readOnly}
          defaultValue={record?.date ?? today}
        />
      </Field>
      <Field id={`${idPrefix}-text`} label="Note" required span>
        {/* ponytail: no ui/textarea component exists; native textarea with Input's look */}
        <textarea
          id={`${idPrefix}-text`}
          name="text"
          required
          rows={4}
          disabled={readOnly}
          defaultValue={record?.text ?? ""}
          placeholder="Anything worth remembering about this aircraft"
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
        />
      </Field>
    </FormSection>
  );
}

/** "+ Add note" — create sheet. */
export function AddNoteSheet({
  readOnly,
  today,
}: {
  readOnly: boolean;
  today: string;
}) {
  return (
    <EntitySheet
      kicker="Note"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Save note"
      trigger={<AddTrigger label="Add note" />}
      onSubmit={async (form) => {
        await createNote(collect(form));
      }}
    >
      {(rp) => <NoteFields {...rp} today={today} />}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function NoteRow({
  record,
  readOnly,
  children,
}: {
  record: NoteRecord;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Note"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={<Row readOnly={readOnly}>{children}</Row>}
      onSubmit={async (form) => {
        await updateNote(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteNote(record.id);
      }}
    >
      {(rp) => <NoteFields {...rp} record={record} today={record.date} />}
    </EntitySheet>
  );
}
