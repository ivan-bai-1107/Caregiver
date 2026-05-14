export type ShareResult = "shared" | "copied";

interface SharePayload {
  title: string;
  text?: string;
  url?: string;
}

function copyWithTextarea(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function shareCurrentPage(payload: SharePayload): Promise<ShareResult> {
  const url = payload.url ?? window.location.href;
  const text = payload.text ?? payload.title;

  if (navigator.share) {
    await navigator.share({
      title: payload.title,
      text,
      url,
    });
    return "shared";
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  copyWithTextarea(url);
  return "copied";
}

export function isShareCancelled(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
