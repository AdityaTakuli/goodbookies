import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertPhoneAvailable } from "@/lib/phone.server";

export const checkPhoneAvailable = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ phone: z.string().min(10).max(20) }).parse(input))
  .handler(async ({ data }) => {
    const normalized = await assertPhoneAvailable(data.phone);
    return { ok: true, phone: normalized };
  });
