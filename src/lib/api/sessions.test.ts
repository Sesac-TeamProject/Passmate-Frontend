import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 음성 힌트 업로드가 서버 시그니처(`VoiceHintController.publish`)와 맞는지 고정한다.
 *
 * 여기는 **타입 검사가 못 잡는 자리**다 — 파트 이름이 틀리거나 `@RequestParam`을 폼에 담아도
 * 컴파일은 통과하고 실서버에서만 조용히 틀린다. 실제로 파트를 `audio`로 보내고
 * `durationMs`를 폼에 담고 있었다.
 */
const BASE_URL = "http://api.test";

describe("음성 힌트 업로드 계약", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", BASE_URL);
    fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ hintId: 1 }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    // client.ts는 토큰을 읽을 때만 window를 본다 — location은 RequireAuth의 일이라 두지 않는다
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function upload() {
    const { uploadVoiceHint } = await import("./sessions");
    await uploadVoiceHint(7, new Blob(["clip"]), 4200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return { url, init, form: init.body as FormData };
  }

  it("파트 이름은 audio가 아니라 file이다 — 틀리면 400이다", async () => {
    const { form } = await upload();

    expect(form.get("file")).toBeInstanceOf(Blob);
    expect(form.get("audio")).toBeNull();
  });

  it("durationMs는 폼이 아니라 쿼리로 간다 — @RequestParam이라 폼에 담으면 못 받는다", async () => {
    const { url, form } = await upload();

    expect(new URL(url).searchParams.get("durationMs")).toBe("4200");
    expect(form.get("durationMs")).toBeNull();
  });

  it("주소는 방의 힌트 경로다", async () => {
    const { url } = await upload();

    expect(new URL(url).pathname).toBe("/rooms/7/session/hints");
  });

  it("POST로 보낸다", async () => {
    const { init } = await upload();

    expect(init.method).toBe("POST");
  });

  /**
   * multipart는 boundary가 붙어야 서버가 파트를 가른다. 직접 `multipart/form-data`를 넣으면
   * boundary가 빠져 서버가 본문을 못 읽고 400이 난다 — 브라우저가 붙이도록 비워 둬야 한다.
   */
  it("Content-Type을 직접 넣지 않는다 — boundary가 빠지면 서버가 못 읽는다", async () => {
    const { init } = await upload();
    const headers = new Headers(init.headers);

    expect(headers.get("Content-Type")).toBeNull();
  });
});
