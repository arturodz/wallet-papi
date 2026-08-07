"use client";

import { createService, updateService, deleteService } from "@/app/actions/services";
import { CATEGORIES } from "@/lib/categories";
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

export interface ServiceRecord {
  id: string;
  date: string;
  description: string;
  vendor: string | null;
  category: string | null;
  tachAtService: number | null;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    date: String(fd.get("date") ?? ""),
    description: String(fd.get("description") ?? ""),
    vendor: String(fd.get("vendor") ?? ""),
    category: String(fd.get("category") ?? ""),
    tachAtService: String(fd.get("tachAtService") ?? ""),
    satisfiesIntervalId: String(fd.get("satisfiesIntervalId") ?? ""),
  };
}

function Fields({
  readOnly,
  idPrefix,
  record,
  intervals,
  vendors,
}: EntityFormRenderProps & {
  record?: ServiceRecord;
  intervals: { id: string; name: string }[];
  vendors: string[];
}) {
  return (
    <>
      <FormSection title="Service">
        <Field
          id={`${idPrefix}-desc`}
          label="Description"
          required
          span
        >
          <Input
            id={`${idPrefix}-desc`}
            name="description"
            required
            disabled={readOnly}
            defaultValue={record?.description ?? ""}
            placeholder="e.g. oil change, annual inspection"
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
              defaultValue={record?.date ?? ""}
            />
          </Field>
          <Field
            id={`${idPrefix}-tach`}
            label="Tach at service"
            help="Engine hours on the meter."
          >
            <Input
              id={`${idPrefix}-tach`}
              name="tachAtService"
              inputMode="decimal"
              type="number"
              step="0.1"
              disabled={readOnly}
              defaultValue={record?.tachAtService ?? ""}
              placeholder="optional"
              className="font-mono"
            />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Attribution">
        <FormGrid>
          <Field id={`${idPrefix}-vendor`} label="Vendor">
            <DatalistInput
              id={`${idPrefix}-vendor`}
              name="vendor"
              options={vendors}
              disabled={readOnly}
              defaultValue={record?.vendor ?? ""}
              placeholder="optional"
            />
          </Field>
          <Field id={`${idPrefix}-cat`} label="Category">
            <FormSelect
              id={`${idPrefix}-cat`}
              name="category"
              disabled={readOnly}
              defaultValue={record?.category ?? ""}
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
        {intervals.length > 0 && (
          <Field
            id={`${idPrefix}-interval`}
            label="Marks interval complete"
            help="Resets the chosen recurring interval to this service."
            span
          >
            <FormSelect
              id={`${idPrefix}-interval`}
              name="satisfiesIntervalId"
              disabled={readOnly}
              defaultValue=""
            >
              <option value="">None</option>
              {intervals.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </FormSelect>
          </Field>
        )}
      </FormSection>
    </>
  );
}

/** "+ Add service" trigger + create sheet. */
export function AddServiceSheet({
  intervals,
  vendors,
  readOnly,
}: {
  intervals: { id: string; name: string }[];
  vendors: string[];
  readOnly: boolean;
}) {
  return (
    <EntitySheet
      kicker="Service"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Log service"
      trigger={<AddTrigger label="Add service" />}
      onSubmit={async (form) => {
        await createService(collect(form));
      }}
    >
      {(rp) => <Fields {...rp} intervals={intervals} vendors={vendors} />}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function ServiceRow({
  record,
  intervals,
  vendors,
  readOnly,
  meta,
  children,
}: {
  record: ServiceRecord;
  intervals: { id: string; name: string }[];
  vendors: string[];
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Service"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateService(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteService(record.id);
      }}
    >
      {(rp) => (
        <Fields {...rp} record={record} intervals={intervals} vendors={vendors} />
      )}
    </EntitySheet>
  );
}
