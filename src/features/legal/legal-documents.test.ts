import { describe, expect, it } from "vitest";
import { matchRoute } from "@/config/routes";
import { FOOTER_LINKS } from "@/features/landing/content";
import { LEGAL_DOCUMENTS, LEGAL_TABS } from "./legal-documents";

describe("법적 고지 문서", () => {
  it.each(Object.values(LEGAL_DOCUMENTS))("$title — 공개 라우트에 등록돼 있다", (doc) => {
    // Google OAuth 동의 화면에 넣는 링크다. 로그인 없이 열려야 심사가 통과한다
    expect(matchRoute(doc.path)?.area).toBe("public");
  });

  it.each(Object.values(LEGAL_DOCUMENTS))("$title — 조항이 비어 있지 않다", (doc) => {
    expect(doc.sections.length).toBeGreaterThan(0);
    for (const section of doc.sections) {
      expect(section.heading.trim()).not.toBe("");
      expect(section.body.trim()).not.toBe("");
    }
  });

  it.each(Object.values(LEGAL_DOCUMENTS))("$title — 시행일이 YYYY-MM-DD 형식이다", (doc) => {
    expect(doc.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("조항 제목이 문서 안에서 겹치지 않는다 — 렌더 key로 쓴다", () => {
    for (const doc of Object.values(LEGAL_DOCUMENTS)) {
      const headings = doc.sections.map((s) => s.heading);
      expect(new Set(headings).size).toBe(headings.length);
    }
  });

  it("웹 탭은 두 문서를 모두 한 번씩 건다", () => {
    expect(LEGAL_TABS.map((tab) => tab.path).sort()).toEqual(
      Object.values(LEGAL_DOCUMENTS)
        .map((doc) => doc.path)
        .sort(),
    );
  });
});

describe("랜딩 푸터 링크", () => {
  it("주소가 있는 링크는 등록된 라우트로 간다 — 404로 새지 않는다", () => {
    const linked = FOOTER_LINKS.filter((link) => link.href !== undefined);

    expect(linked.map((link) => link.href)).toEqual(
      expect.arrayContaining([LEGAL_DOCUMENTS.terms.path, LEGAL_DOCUMENTS.privacy.path]),
    );
    for (const link of linked) {
      expect(matchRoute(link.href ?? "")).toBeDefined();
    }
  });
});
