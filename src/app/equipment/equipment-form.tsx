"use client";

import Link from "next/link";
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/app/actions/equipment";
import { Input } from "@/components/ui/input";
import {
  EntitySheet,
  type EntityFormRenderProps,
} from "@/components/entity-sheet";
import { AddTrigger, Row } from "@/components/ui/data-list";
import { Field, FormGrid, FormSection } from "@/components/ui/form-field";

export interface EquipmentRecord {
  id: string;
  name: string;
  category: string | null;
  make: string | null;
  model: string | null;
  serial: string | null;
  installDate: string | null;
  warrantyExpiry: string | null;
  notes: string | null;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    name: String(fd.get("name") ?? ""),
    category: String(fd.get("category") ?? ""),
    make: String(fd.get("make") ?? ""),
    model: String(fd.get("model") ?? ""),
    serial: String(fd.get("serial") ?? ""),
    installDate: String(fd.get("installDate") ?? ""),
    warrantyExpiry: String(fd.get("warrantyExpiry") ?? ""),
    notes: String(fd.get("notes") ?? ""),
  };
}

function EquipmentFields({
  readOnly,
  idPrefix,
  record,
}: EntityFormRenderProps & { record?: EquipmentRecord }) {
  return (
    <>
      <FormSection title="Item">
        <Field id={`${idPrefix}-name`} label="Name" required span>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            disabled={readOnly}
            defaultValue={record?.name ?? ""}
            placeholder="e.g. Transponder, Garmin GTX 345"
          />
        </Field>
        <FormGrid>
          <Field id={`${idPrefix}-category`} label="Category">
            <Input
              id={`${idPrefix}-category`}
              name="category"
              disabled={readOnly}
              defaultValue={record?.category ?? ""}
              placeholder="e.g. avionics"
            />
          </Field>
          <Field id={`${idPrefix}-serial`} label="Serial">
            <Input
              id={`${idPrefix}-serial`}
              name="serial"
              disabled={readOnly}
              defaultValue={record?.serial ?? ""}
              placeholder="optional"
              className="font-mono"
            />
          </Field>
          <Field id={`${idPrefix}-make`} label="Make">
            <Input
              id={`${idPrefix}-make`}
              name="make"
              disabled={readOnly}
              defaultValue={record?.make ?? ""}
              placeholder="optional"
            />
          </Field>
          <Field id={`${idPrefix}-model`} label="Model">
            <Input
              id={`${idPrefix}-model`}
              name="model"
              disabled={readOnly}
              defaultValue={record?.model ?? ""}
              placeholder="optional"
            />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Service life">
        <FormGrid>
          <Field id={`${idPrefix}-install`} label="Install date">
            <Input
              id={`${idPrefix}-install`}
              name="installDate"
              type="date"
              disabled={readOnly}
              defaultValue={record?.installDate ?? ""}
            />
          </Field>
          <Field id={`${idPrefix}-warranty`} label="Warranty expiry">
            <Input
              id={`${idPrefix}-warranty`}
              name="warrantyExpiry"
              type="date"
              disabled={readOnly}
              defaultValue={record?.warrantyExpiry ?? ""}
            />
          </Field>
        </FormGrid>
        <Field id={`${idPrefix}-notes`} label="Notes" span>
          <Input
            id={`${idPrefix}-notes`}
            name="notes"
            disabled={readOnly}
            defaultValue={record?.notes ?? ""}
            placeholder="optional"
          />
        </Field>
      </FormSection>

      {record && (
        <Link
          href={`/equipment/${record.id}`}
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          Open full record
          <span aria-hidden>→</span>
        </Link>
      )}
    </>
  );
}

/** "+ Add equipment" — create sheet. */
export function AddEquipmentSheet({ readOnly }: { readOnly: boolean }) {
  return (
    <EntitySheet
      kicker="Equipment"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Add equipment"
      trigger={<AddTrigger label="Add equipment" />}
      onSubmit={async (form) => {
        await createEquipment(collect(form));
      }}
    >
      {(rp) => <EquipmentFields {...rp} />}
    </EntitySheet>
  );
}

/** Tappable row -> edit (or read-only) sheet. */
export function EquipmentRow({
  record,
  readOnly,
  meta,
  children,
}: {
  record: EquipmentRecord;
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Equipment"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateEquipment(record.id, collect(form));
      }}
      onDelete={async () => {
        await deleteEquipment(record.id);
      }}
    >
      {(rp) => <EquipmentFields {...rp} record={record} />}
    </EntitySheet>
  );
}
