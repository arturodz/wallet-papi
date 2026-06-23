"use client";

import { useState } from "react";
import {
  createInterval,
  updateInterval,
  deleteInterval,
} from "@/app/actions/intervals";
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

export interface IntervalRecord {
  id: string;
  name: string;
  kind: string;
  intervalMonths: number | null;
  intervalHours: number | null;
  lastDoneDate: string | null;
  lastDoneHours: number | null;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    name: String(fd.get("name") ?? ""),
    kind: String(fd.get("kind") ?? "calendar"),
    intervalMonths: String(fd.get("intervalMonths") ?? ""),
    intervalHours: String(fd.get("intervalHours") ?? ""),
    lastDoneDate: String(fd.get("lastDoneDate") ?? ""),
    lastDoneHours: String(fd.get("lastDoneHours") ?? ""),
  };
}

function IntervalFields({
  readOnly,
  idPrefix,
  record,
}: EntityFormRenderProps & { record?: IntervalRecord }) {
  const [kind, setKind] = useState(record?.kind ?? "calendar");
  const needsMonths = kind === "calendar" || kind === "both";
  const needsHours = kind === "hours" || kind === "both";

  return (
    <>
      <FormSection title="Interval">
        <Field id={`${idPrefix}-name`} label="Name" required span>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            disabled={readOnly}
            defaultValue={record?.name ?? ""}
            placeholder="e.g. Annual inspection, Oil change"
          />
        </Field>
        <Field
          id={`${idPrefix}-kind`}
          label="Tracked by"
          help="Calendar time, engine hours, or whichever comes first."
        >
          <FormSelect
            id={`${idPrefix}-kind`}
            name="kind"
            disabled={readOnly}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="calendar">Calendar (months)</option>
            <option value="hours">Engine hours</option>
            <option value="both">Both</option>
          </FormSelect>
        </Field>
      </FormSection>

      <FormSection title="Cadence">
        <FormGrid>
          {needsMonths && (
            <Field id={`${idPrefix}-months`} label="Every (months)">
              <Input
                id={`${idPrefix}-months`}
                name="intervalMonths"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                disabled={readOnly}
                defaultValue={record?.intervalMonths ?? ""}
                placeholder="e.g. 12"
                className="font-mono"
              />
            </Field>
          )}
          {needsHours && (
            <Field id={`${idPrefix}-hours`} label="Every (hours)">
              <Input
                id={`${idPrefix}-hours`}
                name="intervalHours"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                disabled={readOnly}
                defaultValue={record?.intervalHours ?? ""}
                placeholder="e.g. 50"
                className="font-mono"
              />
            </Field>
          )}
        </FormGrid>
      </FormSection>

      <FormSection title="Last completed">
        <FormGrid>
          {needsMonths && (
            <Field id={`${idPrefix}-lastdate`} label="Date">
              <Input
                id={`${idPrefix}-lastdate`}
                name="lastDoneDate"
                type="date"
                disabled={readOnly}
                defaultValue={record?.lastDoneDate ?? ""}
              />
            </Field>
          )}
          {needsHours && (
            <Field id={`${idPrefix}-lasthours`} label="Tach hours">
              <Input
                id={`${idPrefix}-lasthours`}
                name="lastDoneHours"
                type="number"
                inputMode="decimal"
                step="0.1"
                disabled={readOnly}
                defaultValue={record?.lastDoneHours ?? ""}
                placeholder="optional"
                className="font-mono"
              />
            </Field>
          )}
        </FormGrid>
      </FormSection>
    </>
  );
}

/** "+ Add interval" — create sheet. */
export function AddIntervalSheet({ readOnly }: { readOnly: boolean }) {
  return (
    <EntitySheet
      kicker="Interval"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Add interval"
      trigger={<AddTrigger label="Add interval" />}
      onSubmit={async (form) => {
        await createInterval(collect(form));
      }}
    >
      {(rp) => <IntervalFields {...rp} />}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function IntervalRow({
  record,
  readOnly,
  meta,
  children,
}: {
  record: IntervalRecord;
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Interval"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateInterval(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteInterval(record.id);
      }}
    >
      {(rp) => <IntervalFields {...rp} record={record} />}
    </EntitySheet>
  );
}
