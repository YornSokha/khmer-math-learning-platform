import { randomUUID } from "node:crypto";
import type { NumeralSystem } from "@/lib/khmer/numerals";
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
import type { ChildAvatarId } from "./validation";

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`Parent email already exists: ${email}`);
    this.name = "DuplicateEmailError";
  }
}

export class MemoryDataStore implements DataStore {
  private parents = new Map<string, ParentRecord>();
  private parentsByEmail = new Map<string, string>();
  private sessions = new Map<string, ParentSessionRecord>();
  private children = new Map<string, ChildProfileRecord>();
  private attempts = new Map<string, AttemptRecord>();
  private attemptsByClientEventId = new Map<string, string>();
  private skillStates = new Map<string, SkillStateRecord>();
  private achievements = new Map<string, AchievementAwardRecord>();

  async createParent(input: {
    email: string;
    passwordHash: string;
    consentAcceptedAt: Date;
    consentVersion: string;
  }): Promise<ParentRecord> {
    const email = input.email.trim().toLowerCase();
    if (this.parentsByEmail.has(email)) {
      throw new DuplicateEmailError(email);
    }

    const now = new Date();
    const record: ParentRecord = {
      id: `par_${randomUUID()}`,
      email,
      passwordHash: input.passwordHash,
      consentAcceptedAt: input.consentAcceptedAt,
      consentVersion: input.consentVersion,
      createdAt: now,
      updatedAt: now,
    };

    this.parents.set(record.id, record);
    this.parentsByEmail.set(email, record.id);
    return record;
  }

  async findParentByEmail(email: string): Promise<ParentRecord | null> {
    const id = this.parentsByEmail.get(email.trim().toLowerCase());
    return id ? (this.parents.get(id) ?? null) : null;
  }

  async findParentById(parentId: string): Promise<ParentRecord | null> {
    return this.parents.get(parentId) ?? null;
  }

  async createSession(input: {
    tokenHash: string;
    parentId: string;
    expiresAt: Date;
  }): Promise<ParentSessionRecord> {
    const record: ParentSessionRecord = {
      id: `ses_${randomUUID()}`,
      tokenHash: input.tokenHash,
      parentId: input.parentId,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(record.tokenHash, record);
    return record;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<ParentSessionRecord | null> {
    return this.sessions.get(tokenHash) ?? null;
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash);
  }

  async listChildrenByParent(parentId: string): Promise<ChildProfileRecord[]> {
    return [...this.children.values()]
      .filter((child) => child.parentId === parentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findChildByIdForParent(
    parentId: string,
    childId: string,
  ): Promise<ChildProfileRecord | null> {
    const child = this.children.get(childId);
    if (!child || child.parentId !== parentId) {
      return null;
    }
    return child;
  }

  async createChildProfile(input: {
    parentId: string;
    nickname: string;
    avatarId: ChildAvatarId;
    grade: number;
    numeralPref: NumeralSystem;
  }): Promise<ChildProfileRecord> {
    const now = new Date();
    const record: ChildProfileRecord = {
      id: `chd_${randomUUID()}`,
      parentId: input.parentId,
      nickname: input.nickname,
      avatarId: input.avatarId,
      grade: input.grade,
      numeralPref: input.numeralPref,
      createdAt: now,
      updatedAt: now,
    };
    this.children.set(record.id, record);
    return record;
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
    const existing = this.children.get(childId);
    if (!existing || existing.parentId !== parentId) {
      return null;
    }

    const updated: ChildProfileRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date(),
    };
    this.children.set(childId, updated);
    return updated;
  }

  async deleteChildProfile(parentId: string, childId: string): Promise<boolean> {
    const existing = this.children.get(childId);
    if (!existing || existing.parentId !== parentId) {
      return false;
    }

    this.children.delete(childId);

    // Cascade delete all attempts, skill states, and achievement awards for this child
    for (const [attemptId, attempt] of this.attempts.entries()) {
      if (attempt.childProfileId === childId) {
        this.attempts.delete(attemptId);
        this.attemptsByClientEventId.delete(attempt.clientEventId);
      }
    }

    for (const [key, state] of this.skillStates.entries()) {
      if (state.childProfileId === childId) {
        this.skillStates.delete(key);
      }
    }

    for (const [key, award] of this.achievements.entries()) {
      if (award.childProfileId === childId) {
        this.achievements.delete(key);
      }
    }

    return true;
  }

  async insertAttemptsIdempotent(inputs: CreateAttemptInput[]): Promise<{
    inserted: AttemptRecord[];
    duplicateCount: number;
  }> {
    const inserted: AttemptRecord[] = [];
    let duplicateCount = 0;

    for (const input of inputs) {
      if (this.attemptsByClientEventId.has(input.clientEventId)) {
        duplicateCount += 1;
        continue;
      }

      const record: AttemptRecord = {
        id: `att_${randomUUID()}`,
        clientEventId: input.clientEventId,
        childProfileId: input.childProfileId,
        lessonId: input.lessonId,
        lessonVersion: input.lessonVersion,
        stepId: input.stepId,
        correct: input.correct,
        hintsUsed: input.hintsUsed,
        misconceptionId: input.misconceptionId ?? null,
        durationMs: input.durationMs,
        attemptedAt: input.attemptedAt,
        createdAt: new Date(),
      };

      this.attempts.set(record.id, record);
      this.attemptsByClientEventId.set(record.clientEventId, record.id);
      inserted.push(record);
    }

    return { inserted, duplicateCount };
  }

  async listAttemptsForChild(childProfileId: string): Promise<AttemptRecord[]> {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.childProfileId === childProfileId)
      .sort((a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime());
  }

  async listSkillStatesForChild(childProfileId: string): Promise<SkillStateRecord[]> {
    return [...this.skillStates.values()].filter(
      (state) => state.childProfileId === childProfileId,
    );
  }

  async upsertSkillState(input: UpsertSkillStateInput): Promise<SkillStateRecord> {
    const key = `${input.childProfileId}::${input.skillId}`;
    const existing = this.skillStates.get(key);
    const record: SkillStateRecord = {
      id: existing?.id ?? `skl_${randomUUID()}`,
      childProfileId: input.childProfileId,
      skillId: input.skillId,
      independentSessions: input.independentSessions,
      lastMasteredDate: input.lastMasteredDate,
      masteredAt: input.masteredAt,
      reviewStage: input.reviewStage,
      nextReviewAt: input.nextReviewAt,
      updatedAt: new Date(),
    };
    this.skillStates.set(key, record);
    return record;
  }

  async listAchievementsForChild(childProfileId: string): Promise<AchievementAwardRecord[]> {
    return [...this.achievements.values()].filter(
      (award) => award.childProfileId === childProfileId,
    );
  }

  async awardAchievement(
    childProfileId: string,
    achievementId: string,
  ): Promise<AchievementAwardRecord> {
    const key = `${childProfileId}::${achievementId}`;
    const existing = this.achievements.get(key);
    if (existing) {
      return existing;
    }

    const record: AchievementAwardRecord = {
      id: `ach_${randomUUID()}`,
      childProfileId,
      achievementId,
      awardedAt: new Date(),
    };
    this.achievements.set(key, record);
    return record;
  }

  clear(): void {
    this.parents.clear();
    this.parentsByEmail.clear();
    this.sessions.clear();
    this.children.clear();
    this.attempts.clear();
    this.attemptsByClientEventId.clear();
    this.skillStates.clear();
    this.achievements.clear();
  }
}
