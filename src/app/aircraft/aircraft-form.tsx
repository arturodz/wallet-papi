"use client";

import {
  createAircraft,
  updateAircraft,
  setActiveAircraft,
} from "@/app/actions/aircraft";
import { Input } from "@/components/ui/input";
import {
  EntitySheet,
  type EntityFormRenderProps,
} from "@/components/entity-sheet";
import { AddTrigger, Row } from "@/components/ui/data-list";
import { Field, FormGrid, FormSection } from "@/components/ui/form-field";

export interface AircraftRecord {
  id: string;
  tailNumber: string;
  make: string | null;
  model: string | null;
  year: number | null;
  serial: string | null;
  currentTach: number;
  currentHobbs: number;
  acquiredDate: string | null;
  acquisitionTach: number | null;
}

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  return {
    tailNumber: String(fd.get("tailNumber") ?? "").toUpperCase(),
    make: String(fd.get("make") ?? ""),
    model: String(fd.get("model") ?? ""),
    year: String(fd.get("year") ?? ""),
    serial: String(fd.get("serial") ?? ""),
    currentTach: String(fd.get("currentTach") ?? ""),
    currentHobbs: String(fd.get("currentHobbs") ?? ""),
    acquiredDate: String(fd.get("acquiredDate") ?? ""),
    acquisitionTach: String(fd.get("acquisitionTach") ?? ""),
  };
}

function AircraftFields({
  readOnly,
  idPrefix,
  record,
  hoursAndAcquisition,
}: EntityFormRenderProps & {
  record?: AircraftRecord;
  /** Edit mode shows hours + acquisition; create keeps it to the basics. */
  hoursAndAcquisition: boolean;
}) {
  return (
    <>
      <FormSection title="Identification">
        <FormGrid>
          <Field id={`${idPrefix}-tail`} label="Tail number" required>
            <Input
              id={`${idPrefix}-tail`}
              name="tailNumber"
              required
              disabled={readOnly}
              defaultValue={record?.tailNumber ?? ""}
              placeholder="N12345"
              autoCapitalize="characters"
              className="font-mono uppercase [&::placeholder]:normal-case"
            />
          </Field>
          <Field id={`${idPrefix}-serial`} label="Serial number">
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
              placeholder="e.g. Cirrus"
            />
          </Field>
          <Field id={`${idPrefix}-model`} label="Model">
            <Input
              id={`${idPrefix}-model`}
              name="model"
              disabled={readOnly}
              defaultValue={record?.model ?? ""}
              placeholder="e.g. SR22"
            />
          </Field>
          <Field id={`${idPrefix}-year`} label="Year">
            <Input
              id={`${idPrefix}-year`}
              name="year"
              type="number"
              inputMode="numeric"
              disabled={readOnly}
              defaultValue={record?.year ?? ""}
              placeholder="e.g. 2018"
              className="font-mono"
            />
          </Field>
        </FormGrid>
      </FormSection>

      {hoursAndAcquisition && (
        <>
          <FormSection title="Meters">
            <FormGrid>
              <Field id={`${idPrefix}-curtach`} label="Current tach">
                <Input
                  id={`${idPrefix}-curtach`}
                  name="currentTach"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  disabled={readOnly}
                  defaultValue={record?.currentTach ?? 0}
                  className="font-mono"
                />
              </Field>
              <Field id={`${idPrefix}-curhobbs`} label="Current Hobbs">
                <Input
                  id={`${idPrefix}-curhobbs`}
                  name="currentHobbs"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  disabled={readOnly}
                  defaultValue={record?.currentHobbs ?? 0}
                  className="font-mono"
                />
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Acquisition">
            <FormGrid>
              <Field
                id={`${idPrefix}-acqtach`}
                label="Acquisition tach"
                help="Anchors cost-per-hour in the TCO view."
              >
                <Input
                  id={`${idPrefix}-acqtach`}
                  name="acquisitionTach"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  disabled={readOnly}
                  defaultValue={record?.acquisitionTach ?? ""}
                  placeholder="tach at purchase"
                  className="font-mono"
                />
              </Field>
              <Field id={`${idPrefix}-acqdate`} label="Acquired date">
                <Input
                  id={`${idPrefix}-acqdate`}
                  name="acquiredDate"
                  type="date"
                  disabled={readOnly}
                  defaultValue={record?.acquiredDate ?? ""}
                />
              </Field>
            </FormGrid>
          </FormSection>
        </>
      )}
    </>
  );
}

/** "+ Add aircraft" — create sheet; the new plane auto-activates. */
export function AddAircraftSheet({ readOnly }: { readOnly: boolean }) {
  return (
    <EntitySheet
      kicker="Aircraft"
      isEdit={false}
      readOnly={readOnly}
      saveLabel="Add aircraft"
      trigger={<AddTrigger label="Add aircraft" />}
      onSubmit={async (form) => {
        const row = await createAircraft(collect(form));
        if (row?.id) await setActiveAircraft(row.id);
      }}
    >
      {(rp) => <AircraftFields {...rp} hoursAndAcquisition={false} />}
    </EntitySheet>
  );
}

/** Tappable fleet row -> edit (or read-only) sheet with ALL fields. */
export function AircraftRow({
  record,
  readOnly,
  meta,
  children,
}: {
  record: AircraftRecord;
  readOnly: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <EntitySheet
      kicker="Aircraft"
      isEdit
      readOnly={readOnly}
      saveLabel="Save changes"
      trigger={
        <Row readOnly={readOnly} meta={meta}>
          {children}
        </Row>
      }
      onSubmit={async (form) => {
        await updateAircraft(record.id, collect(form));
      }}
    >
      {(rp) => (
        <AircraftFields {...rp} record={record} hoursAndAcquisition />
      )}
    </EntitySheet>
  );
}
