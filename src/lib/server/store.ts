import type { NumeralSystem } from "@/lib/khmer/numerals";
import type { ChildAvatarId } from "./validation";

export interface ParentRecord {
  id: string;
  email: string;
  passwordHash: string;
  consentAcceptedAt: Date;
  consentVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicParent {
  id: string;
  email: string;
  consentAcceptedAt: string;
  consentVersion: string;
}

export interface ParentSessionRecord {
  id: string;
  tokenHash: string;
  parentId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ChildProfileRecord {
  id: string;
  parentId: string;
  nickname: string;
  avatarId: ChildAvatarId;
  grade: number;
  numeralPref: NumeralSystem;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicChildProfile {
  id: string;
  nickname: string;
  avatarId: ChildAvatarId;
  grade: number;
  numeralPref: NumeralSystem;
}

export interface AttemptRecord {
  id: string;
  clientEventId: string;
  childProfileId: string;
  lessonId: string;
  lessonVersion: number;
  stepId: string;
  correct: boolean;
  hintsUsed: number;
  misconceptionId: string | null;
  durationMs: number;
  attemptedAt: Date;
  createdAt: Date;
}

export interface CreateAttemptInput {
  clientEventId: string;
  childProfileId: string;
  lessonId: string;
  lessonVersion: number;
  stepId: string;
  correct: boolean;
  hintsUsed: number;
  misconceptionId?: string | null;
  durationMs: number;
  attemptedAt: Date;
}

export interface SkillStateRecord {
  id: string;
  childProfileId: string;
  skillId: string;
  independentSessions: number;
  lastMasteredDate: string | null;
  masteredAt: Date | null;
  reviewStage: number;
  nextReviewAt: Date | null;
  updatedAt: Date;
}

export interface UpsertSkillStateInput {
  childProfileId: string;
  skillId: string;
  independentSessions: number;
  lastMasteredDate: string | null;
  masteredAt: Date | null;
  reviewStage: number;
  nextReviewAt: Date | null;
}

export interface AchievementAwardRecord {
  id: string;
  childProfileId: string;
  achievementId: string;
  awardedAt: Date;
}

export interface DataStore {
  createParent(input: {
    email: string;
    passwordHash: string;
    consentAcceptedAt: Date;
    consentVersion: string;
  }): Promise<ParentRecord>;
  findParentByEmail(email: string): Promise<ParentRecord | null>;
  findParentById(parentId: string): Promise<ParentRecord | null>;

  createSession(input: {
    tokenHash: string;
    parentId: string;
    expiresAt: Date;
  }): Promise<ParentSessionRecord>;
  findSessionByTokenHash(tokenHash: string): Promise<ParentSessionRecord | null>;
  deleteSessionByTokenHash(tokenHash: string): Promise<void>;

  listChildrenByParent(parentId: string): Promise<ChildProfileRecord[]>;
  findChildByIdForParent(parentId: string, childId: string): Promise<ChildProfileRecord | null>;
  createChildProfile(input: {
    parentId: string;
    nickname: string;
    avatarId: ChildAvatarId;
    grade: number;
    numeralPref: NumeralSystem;
  }): Promise<ChildProfileRecord>;
  updateChildProfile(
    parentId: string,
    childId: string,
    patch: Partial<{
      nickname: string;
      avatarId: ChildAvatarId;
      grade: number;
      numeralPref: NumeralSystem;
    }>,
  ): Promise<ChildProfileRecord | null>;
  deleteChildProfile(parentId: string, childId: string): Promise<boolean>;

  insertAttemptsIdempotent(inputs: CreateAttemptInput[]): Promise<{
    inserted: AttemptRecord[];
    duplicateCount: number;
  }>;
  listAttemptsForChild(childProfileId: string): Promise<AttemptRecord[]>;

  listSkillStatesForChild(childProfileId: string): Promise<SkillStateRecord[]>;
  upsertSkillState(input: UpsertSkillStateInput): Promise<SkillStateRecord>;

  listAchievementsForChild(childProfileId: string): Promise<AchievementAwardRecord[]>;
  awardAchievement(childProfileId: string, achievementId: string): Promise<AchievementAwardRecord>;
}

export function toPublicParent(parent: ParentRecord): PublicParent {
  return {
    id: parent.id,
    email: parent.email,
    consentAcceptedAt: parent.consentAcceptedAt.toISOString(),
    consentVersion: parent.consentVersion,
  };
}

export function toPublicChildProfile(child: ChildProfileRecord): PublicChildProfile {
  return {
    id: child.id,
    nickname: child.nickname,
    avatarId: child.avatarId,
    grade: child.grade,
    numeralPref: child.numeralPref,
  };
}
