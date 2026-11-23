import { z } from "zod";

export const CHILD_AVATAR_IDS = ["mango", "lotus", "elephant", "tuktuk", "star", "owl"] as const;

export type ChildAvatarId = (typeof CHILD_AVATAR_IDS)[number];

export const CONSENT_VERSION = "v1-under-16-pdpl";

export const ParentSignupSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    consentAccepted: z.literal(true, {
      error: "Explicit parental consent is required for under-16 learners",
    }),
  })
  .strict();

export const ParentLoginSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1).max(128),
  })
  .strict();

export const CreateChildSchema = z
  .object({
    nickname: z.string().trim().min(1, "Nickname is required").max(40),
    avatarId: z.enum(CHILD_AVATAR_IDS).default("mango"),
    grade: z.number().int().min(1).max(2).default(1),
    numeralPref: z.enum(["khmer", "arabic"]).default("khmer"),
  })
  .strict();

export const UpdateChildSchema = z
  .object({
    nickname: z.string().trim().min(1).max(40).optional(),
    avatarId: z.enum(CHILD_AVATAR_IDS).optional(),
    grade: z.number().int().min(1).max(2).optional(),
    numeralPref: z.enum(["khmer", "arabic"]).optional(),
  })
  .strict();

export type ParentSignupInput = z.infer<typeof ParentSignupSchema>;
export type ParentLoginInput = z.infer<typeof ParentLoginSchema>;
export type CreateChildInput = z.infer<typeof CreateChildSchema>;
export type UpdateChildInput = z.infer<typeof UpdateChildSchema>;
