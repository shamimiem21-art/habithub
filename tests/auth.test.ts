import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/auth";

describe("HabitHub Authentication Security", () => {
  it("hashes password securely and verifies correctly", async () => {
    const rawPassword = "SecurePassword123!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });
});
