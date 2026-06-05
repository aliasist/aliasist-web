import { describe, expect, it } from "vitest";
import { requireAliasistAdmin } from "../../functions/_lib/clerk-auth";
import {
  onRequestOptions,
  onRequestPatch,
} from "../../functions/api/clearasist-reports/[id]";

describe("Aliasist admin dashboard routing", () => {
  it("rejects access when the owner allowlist is missing", () => {
    expect(requireAliasistAdmin("user_owner", {})).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it("allows only Clerk user IDs in the owner allowlist", () => {
    const env = { ALIASIST_ADMIN_USER_IDS: "user_owner,user_backup" };

    expect(requireAliasistAdmin("user_owner", env)).toEqual({ ok: true });
    expect(requireAliasistAdmin("user_unknown", env)).toMatchObject({
      ok: false,
      status: 403,
    });
  });

  it("exports handlers for the dynamic Clearasist report route", () => {
    expect(onRequestOptions).toBeTypeOf("function");
    expect(onRequestPatch).toBeTypeOf("function");
  });
});
