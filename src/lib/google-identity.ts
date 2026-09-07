/**
 * GIS(Google Identity Services) 스크립트 로더.
 *
 * 로그인은 **idToken 방식**이다 — GIS 버튼이 준 credential(ID 토큰)을
 * `POST /auth/login/google`에 보내면 서버가 aud를 검증하고 JWT를 내준다.
 * 인가 코드 방식은 서버에 client_secret 등록이 더 필요해서 쓰지 않는다(DESIGN_GAPS "남은 질문 3"의 답).
 */

export type GisCredentialResponse = {
  /** Google이 서명한 ID 토큰(JWT). 이걸 그대로 서버에 보낸다 */
  credential: string;
};

export type GisButtonOptions = {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  /** px. GIS 허용 범위 200~400 — 넘기면 GIS가 무시한다 */
  width?: number;
  locale?: string;
};

export type GoogleId = {
  initialize(config: {
    client_id: string;
    callback: (response: GisCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: GisButtonOptions): void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
  }
}

let loading: Promise<GoogleId> | null = null;

/** GIS 스크립트를 한 번만 로드한다. 실패하면 다음 호출이 다시 시도할 수 있게 캐시를 비운다. */
export function loadGoogleId(): Promise<GoogleId> {
  if (loading) return loading;

  loading = new Promise<GoogleId>((resolve, reject) => {
    const existing = window.google?.accounts?.id;
    if (existing) {
      resolve(existing);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else {
        loading = null;
        reject(new Error("GIS 스크립트는 로드됐지만 google.accounts.id가 없다"));
      }
    };
    script.onerror = () => {
      loading = null;
      reject(new Error("GIS 스크립트 로드 실패 — 네트워크 또는 차단 확장 프로그램"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
