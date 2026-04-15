import type { RecordDraftPreview } from "../../../entities/care-record/mapper";

interface RecordDraftPreviewCardProps {
  preview: RecordDraftPreview | null;
}

export function RecordDraftPreviewCard({ preview }: RecordDraftPreviewCardProps) {
  if (!preview) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{preview.title}</p>
      <p className="text-primary font-medium">{preview.value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{preview.helperText}</p>
    </div>
  );
}
