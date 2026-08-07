"use client";

import {
  createSquawk,
  updateSquawk,
  deleteSquawk,
} from "@/app/actions/squawks";
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

export interface SquawkFormOption {
  id: string;
  label: string;
}

export interface SquawkRecord {
  id: string;
  title: string;
  description: string | null;
  severity: string | null;
  status: string;
  openedDate: string;
  equipmentId: string | null;
  resolvedByServiceId: string | null;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    title: String(fd.get("title") ?? ""),
    description: String(fd.get("description") ?? ""),
    severity: String(fd.get("severity") ?? ""),
    status: String(fd.get("status") ?? "open"),
    openedDate: String(fd.get("openedDate") ?? ""),
    equipmentId: String(fd.get("equipmentId") ?? ""),
    resolvedByServiceId: String(fd.get("resolvedByServiceId") ?? ""),
  };
}

function SquawkFields({
  readOnly,
  idPrefix,
  record,
  equipment,
  services,
}: EntityFormRenderProps & {
  record?: SquawkRecord;
  equipment: SquawkFormOption[];
  services: SquawkFormOption[];
}) {
  return (
    <>
      <FormSection title="Discrepancy">
        <Field id={`${idPrefix}-title`} label="Title" required span>
          <Input
            id={`${idPrefix}-title`}
            name="title"
            required
            disabled={readOnly}
            defaultValue={record?.title ?? ""}
            placeholder="e.g. Comm 1 intermittent, oil door latch loose"
          />
        </Field>
        <Field id={`${idPrefix}-desc`} label="Description" span>
          <Input
            id={`${idPrefix}-desc`}
            name="description"
            disabled={readOnly}
            defaultValue={record?.description ?? ""}
            placeholder="optional"
          />
        </Field>
      </FormSection>

      <FormSection title="Triage">
        <FormGrid>
          <Field id={`${idPrefix}-opened`} label="Opened date" required>
            <Input
              id={`${idPrefix}-opened`}
              name="openedDate"
              type="date"
              required
              disabled={readOnly}
              defaultValue={record?.openedDate ?? ""}
            />
          </Field>
          <Field id={`${idPrefix}-severity`} label="Severity">
            <FormSelect
              id={`${idPrefix}-severity`}
              name="severity"
              disabled={readOnly}
              defaultValue={record?.severity ?? ""}
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="grounding">Grounding</option>
            </FormSelect>
          </Field>
          <Field id={`${idPrefix}-status`} label="Status">
            <FormSelect
              id={`${idPrefix}-status`}
              name="status"
              disabled={readOnly}
              defaultValue={record?.status ?? "open"}
            >
              <option value="open">Open</option>
              <option value="deferred">Deferred</option>
              <option value="resolved">Resolved</option>
            </FormSelect>
          </Field>
          <Field id={`${idPrefix}-equipment`} label="Equipment">
            <FormSelect
              id={`${idPrefix}-equipment`}
              name="equipmentId"
              disabled={readOnly}
              defaultValue={record?.equipmentId ?? ""}
            >
              <option value="">None</option>
              {equipment.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </FormSelect>
          </Field>
        </FormGrid>
        <Field
          id={`${idPrefix}-service`}
          label="Resolved by service"
          help="Link the maintenance event that cleared this squawk."
          span
        >
          <FormSelect
            id={`${idPrefix}-service`}
            name="resolvedByServiceId"
            disabled={readOnly}
            defaultValue={record?.resolvedByServiceId ?? ""}
          >
            <option value="">None</option>
            {services.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </FormSelect>
        </Field>
      </FormSection>
    </>
  );
}

/** "+ Add squawk" — create sheet. */
export function AddSquawkSheet({
  equipment,
  services,
  readOnly,
}: {
  equipment: SquawkFormOption[];
  services: SquawkFormOption[];
  readOnly: boolean;
}) {
  return (
    <EntitySheet
      kicker="Squawk"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Record squawk"
      trigger={<AddTrigger label="Add squawk" />}
      onSubmit={async (form) => {
        await createSquawk(collect(form));
      }}
    >
      {(rp) => <SquawkFields {...rp} equipment={equipment} services={services} />}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function SquawkRow({
  record,
  equipment,
  services,
  readOnly,
  meta,
  children,
}: {
  record: SquawkRecord;
  equipment: SquawkFormOption[];
  services: SquawkFormOption[];
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Squawk"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateSquawk(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteSquawk(record.id);
      }}
    >
      {(rp) => (
        <SquawkFields {...rp} record={record} equipment={equipment} services={services} />
      )}
    </EntitySheet>
  );
}
