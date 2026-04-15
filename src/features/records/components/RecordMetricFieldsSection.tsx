import type { CareMetricDraft } from "../../../entities/care-record/model";
import type { RecordMetricFieldDefinition } from "../model";

interface RecordMetricFieldsSectionProps {
  fields: RecordMetricFieldDefinition[];
  metrics: CareMetricDraft;
  getError: (key: keyof CareMetricDraft) => string | undefined;
  onChange: <Key extends keyof CareMetricDraft>(key: Key, value: CareMetricDraft[Key]) => void;
}

export function RecordMetricFieldsSection({
  fields,
  metrics,
  getError,
  onChange,
}: RecordMetricFieldsSectionProps) {
  if (fields.length === 0) {
    return null;
  }

  const useTwoColumns = fields.every((field) => field.columns === 2);

  return (
    <div className={useTwoColumns ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {fields.map((field) => {
        const value = metrics[field.key];
        const error = getError(field.key);

        return (
          <div key={field.key} className={field.columns === 2 ? "" : "col-span-2"}>
            <label className="block text-sm mb-2">
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </label>

            {field.kind === "textarea" ? (
              <textarea
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
                rows={field.rows ?? 3}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
              />
            ) : (
              <div className="relative">
                <input
                  type={field.kind === "number" ? "number" : "text"}
                  step={field.step}
                  value={value}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors ${
                    field.unit ? "pr-16" : ""
                  }`}
                />
                {field.unit ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {field.unit}
                  </span>
                ) : null}
              </div>
            )}

            {error ? (
              <p className="text-xs text-destructive mt-2">{error}</p>
            ) : field.helperText ? (
              <p className="text-xs text-muted-foreground mt-2">{field.helperText}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
