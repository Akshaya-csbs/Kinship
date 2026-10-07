import { toast } from "sonner";

/** Uses the native share sheet when available, otherwise copies the link to the clipboard. */
export async function shareLink(title: string, url: string): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return true;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return false; // user closed the share sheet
    }
    toast.info(`Share this link: ${url}`);
    return true;
  }
}
