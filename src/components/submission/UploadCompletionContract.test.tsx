import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import VideoUploader from "./VideoUploader";
import ImageUploader from "@/components/ui/ImageUploader";

vi.mock("@/lib/api", () => ({
  default: { post: vi.fn() },
}));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/featureFlags", () => ({ FEATURE_UPLOADS_ENABLED: true }));

class SuccessfulUploadRequest {
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  status = 204;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn(() => {
    this.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 1 } as ProgressEvent);
    this.onload?.();
  });
}

const NativeURL = globalThis.URL;

class TestURL extends NativeURL {
  static createObjectURL = vi.fn(() => "blob:preview");
  static revokeObjectURL = vi.fn();
}

describe("direct object-storage upload completion contract", () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
    vi.stubGlobal("XMLHttpRequest", SuccessfulUploadRequest);
    vi.stubGlobal("URL", TestURL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifies an uploaded video before submitting the campaign work", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { fileKey: "submissions/video.mp4", uploadUrl: "https://storage/upload" } })
      .mockResolvedValueOnce({ data: { status: "UPLOADED" } })
      .mockResolvedValueOnce({ data: { trackingMode: "MANUAL" } });
    const uploaded = vi.fn();
    const { container } = render(
      <VideoUploader applicationId={31} onUploaded={uploaded} onCancel={vi.fn()} />,
    );
    const file = new File(["video"], "clip.mp4", { type: "video/mp4" });
    expect(screen.getByRole("button", { name: "업로드할 영상 파일 선택" })).toBeTruthy();
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });

    await userEvent.click(screen.getByRole("button", { name: "업로드 후 제출" }));

    await waitFor(() => expect(uploaded).toHaveBeenCalled());
    expect(api.post).toHaveBeenNthCalledWith(1, "/files/presign-upload", {
      contentType: "video/mp4",
      sizeBytes: file.size,
    });
    expect(api.post).toHaveBeenNthCalledWith(2, "/files/complete-upload", {
      fileKey: "submissions/video.mp4",
    });
    expect(api.post).toHaveBeenNthCalledWith(3, "/me/applications/31/submit", {
      videoFileKey: "submissions/video.mp4",
      videoContentType: "video/mp4",
      videoSizeBytes: file.size,
    });
  });

  it("announces invalid video files without requiring pointer input", async () => {
    const { container } = render(
      <VideoUploader applicationId={31} onUploaded={vi.fn()} onCancel={vi.fn()} />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });

    expect((await screen.findByRole("alert")).textContent).toContain("지원하지 않는 영상 형식");
  });

  it("verifies an uploaded image before exposing its key to the form", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { fileKey: "thumbnails/image.png", uploadUrl: "https://storage/upload" } })
      .mockResolvedValueOnce({ data: { status: "UPLOADED" } });
    const changed = vi.fn();
    const { container } = render(<ImageUploader previewUrl={null} onChange={changed} />);
    const file = new File(["image"], "thumb.png", { type: "image/png" });

    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });

    await waitFor(() => expect(changed).toHaveBeenCalledWith("thumbnails/image.png"));
    expect(api.post).toHaveBeenNthCalledWith(2, "/files/complete-upload", {
      fileKey: "thumbnails/image.png",
    });
  });
});
