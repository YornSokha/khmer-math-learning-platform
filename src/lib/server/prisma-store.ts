import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import type { NumeralSystem } from "@/lib/khmer/numerals";
import { DuplicateEmailError } from "./memory-store";
import type {
  AchievementAwardRecord,
  AttemptRecord,
  ChildProfileRecord,
  CreateAttemptInput,
  DataStore,
  ParentRecord,
  ParentSessionRecord,
  SkillStateRecord,
  UpsertSkillStateInput,
} from "./store";
import { CHILD_AVATAR_IDS, type ChildAvatarId } from "./validation";

function toChildAvatarId(raw: string): ChildAvatarId {
  return (CHILD_AVATAR_IDS as readonly string[]).includes(raw) ? (raw as ChildAvatarId) : "mango";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export class PrismaDataStore implements DataStore {
  private readonly prisma: PrismaClient;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async createParent(input: {
    email: string;
    passwordHash: string;
    consentAcceptedAt: Date;
    consentVersion: string;
  }): Promise<ParentRecord> {
    try {
      return await this.prisma.parent.create({
        data: {
          email: input.email.trim().toLowerCase(),
          passwordHash: input.passwordHash,
          consentAcceptedAt: input.consentAcceptedAt,
          consentVersion: input.consentVersion,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DuplicateEmailError(input.email);
      }
      throw error;
    }
  }

  async findParentByEmail(email: string): Promise<ParentRecord | null> {
    return this.prisma.parent.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findParentById(parentId: string): Promise<ParentRecord | null> {
    return this.prisma.parent.findUnique({
      where: { id: parentId },
    });
  }

  async createSession(input: {
    tokenHash: string;
    parentId: string;
    expiresAt: Date;
  }): Promise<ParentSessionRecord> {
    return this.prisma.parentSession.create({
      data: input,
    });
  }

  async findSessionByTokenHash(tokenHash: string): Promise<ParentSessionRecord | null> {
    return this.prisma.parentSession.findUnique({
      where: { tokenHash },
    });
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.parentSession.deleteMany({
      where: { tokenHash },
    });
  }

  async listChildrenByParent(parentId: string): Promise<ChildProfileRecord[]> {
    const rows = await this.prisma.childProfile.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map((row) => ({
      ...row,
      avatarId: toChildAvatarId(row.avatarId),
      numeralPref: row.numeralPref as NumeralSystem,
    }));
  }

  async findChildByIdForParent(
    parentId: string,
    childId: string,
  ): Promise<ChildProfileRecord | null> {
    const row = await this.prisma.childProfile.findFirst({
      where: { id: childId, parentId },
    });
    if (!row) {
      return null;
    }
    return {
      ...row,
      avatarId: toChildAvatarId(row.avatarId),
      numeralPref: row.numeralPref as NumeralSystem,
    };
  }

  async createChildProfile(input: {
    parentId: string;
    nickname: string;
    avatarId: ChildAvatarId;
    grade: number;
    numeralPref: NumeralSystem;
  }): Promise<ChildProfileRecord> {
    const row = await this.prisma.childProfile.create({
      data: {
        parentId: input.parentId,
        nickname: input.nickname,
        avatarId: input.avatarId,
        grade: input.grade,
        numeralPref: input.numeralPref,
      },
    });
    return {
      ...row,
      avatarId: toChildAvatarId(row.avatarId),
      numeralPref: row.numeralPref as NumeralSystem,
    };
  }

  async updateChildProfile(
    parentId: string,
    childId: string,
    patch: Partial<{
      nickname: string;
      avatarId: ChildAvatarId;
      grade: number;
      numeralPref: NumeralSystem;
    }>,
  ): Promise<ChildProfileRecord | null> {
    const existing = await this.prisma.childProfile.findFirst({
      where: { id: childId, parentId },
    });
    if (!existing) {
      return null;
    }

    const row = await this.prisma.childProfile.update({
      where: { id: childId },
      data: patch,
    });
    return {
      ...row,
      avatarId: toChildAvatarId(row.avatarId),
      numeralPref: row.numeralPref as NumeralSystem,
    };
  }

  async deleteChildProfile(parentId: string, childId: string): Promise<boolean> {
    const result = await this.prisma.childProfile.deleteMany({
      where: { id: childId, parentId },
    });
    return result.count > 0;
  }

  async insertAttemptsIdempotent(inputs: CreateAttemptInput[]): Promise<{
    inserted: AttemptRecord[];
    duplicateCount: number;
  }> {
    if (inputs.length === 0) {
      return { inserted: [], duplicateCount: 0 };
    }

    const eventIds = inputs.map((item) => item.clientEventId);
    const existingRows = await this.prisma.attempt.findMany({
      where: { clientEventId: { in: eventIds } },
      select: { clientEventId: true },
    });
    const existingSet = new Set(existingRows.map((row) => row.clientEventId));

    const freshInputs: CreateAttemptInput[] = [];
    const seenInBatch = new Set<string>();
    let duplicateCount = 0;

    for (const item of inputs) {
      if (existingSet.has(item.clientEventId) || seenInBatch.has(item.clientEventId)) {
        duplicateCount += 1;
        continue;
      }
      seenInBatch.add(item.clientEventId);
      freshInputs.push(item);
    }

    if (freshInputs.length > 0) {
      await this.prisma.attempt.createMany({
        data: freshInputs.map((item) => ({
          clientEventId: item.clientEventId,
          childProfileId: item.childProfileId,
          lessonId: item.lessonId,
          lessonVersion: item.lessonVersion,
          stepId: item.stepId,
          correct: item.correct,
          hintsUsed: item.hintsUsed,
          misconceptionId: item.misconceptionId ?? null,
          durationMs: item.durationMs,
          attemptedAt: item.attemptedAt,
        })),
        skipDuplicates: true,
      });
    }

    const inserted =
      freshInputs.length === 0
        ? []
        : await this.prisma.attempt.findMany({
            where: { clientEventId: { in: freshInputs.map((item) => item.clientEventId) } },
            orderBy: { attemptedAt: "asc" },
          });

    return { inserted, duplicateCount };
  }

  async listAttemptsForChild(childProfileId: string): Promise<AttemptRecord[]> {
    return this.prisma.attempt.findMany({
      where: { childProfileId },
      orderBy: { attemptedAt: "asc" },
    });
  }

  async listSkillStatesForChild(childProfileId: string): Promise<SkillStateRecord[]> {
    return this.prisma.skillState.findMany({
      where: { childProfileId },
    });
  }

  async upsertSkillState(input: UpsertSkillStateInput): Promise<SkillStateRecord> {
    return this.prisma.skillState.upsert({
      where: {
        childProfileId_skillId: {
          childProfileId: input.childProfileId,
          skillId: input.skillId,
        },
      },
      create: input,
      update: {
        independentSessions: input.independentSessions,
        lastMasteredDate: input.lastMasteredDate,
        masteredAt: input.masteredAt,
        reviewStage: input.reviewStage,
        nextReviewAt: input.nextReviewAt,
      },
    });
  }

  async listAchievementsForChild(childProfileId: string): Promise<AchievementAwardRecord[]> {
    return this.prisma.achievementAward.findMany({
      where: { childProfileId },
    });
  }

  async awardAchievement(
    childProfileId: string,
    achievementId: string,
  ): Promise<AchievementAwardRecord> {
    return this.prisma.achievementAward.upsert({
      where: {
        childProfileId_achievementId: {
          childProfileId,
          achievementId,
        },
      },
      create: {
        childProfileId,
        achievementId,
      },
      update: {},
    });
  }
}
