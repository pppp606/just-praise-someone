import { Skill } from '@prisma/client';
import { PraiseIncludeSkillCode } from '../services/praiseService';

export type PraisesResponse = {
  items: PraiseIncludeSkillCode[];
  count: number;
  totalPages: number;
};

export type SkillsResponse = {
  items: Skill[];
};
