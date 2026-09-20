import type { TextbookSection } from '../../types';
import { intro } from './intro';
import { lawWhat } from './law-what';
import { lawPermit } from './law-permit';
import { lawHandle } from './law-handle';
import { lawPeople } from './law-people';
import { lawVessel } from './law-vessel';
import { lawTech } from './law-tech';
import { lawOpe } from './law-ope';
import { hoBurn } from './ho-burn';
import { hoMaterial } from './ho-material';
import { hoInst } from './ho-inst';
import { hoDevice } from './ho-device';
import { hoSeal } from './ho-seal';
import { hoSafety } from './ho-safety';
import { hoManage } from './ho-manage';
import { gkState } from './gk-state';
import { gkSep } from './gk-sep';
import { gkReact } from './gk-react';
import { gkBurn } from './gk-burn';
import { gkGas } from './gk-gas';
import { gmThermo } from './gm-thermo';
import { gmFlow } from './gm-flow';
import { gmHeat } from './gm-heat';
import { gmStrength } from './gm-strength';
import { gmMaterial } from './gm-material';

/**
 * 教本の全セクション。
 *
 * **★ 法令の 43 節は 8 つめ（`kouatsugas_otsu_exam_app`）から引き継いでいます。**
 * 甲種と乙種は**同じ高圧ガス保安法**で、受験案内書の法令の文言も試験の種類によらず同一、
 * 基準日も同じ令和 8 年 4 月 1 日です。令和 7 年度の公開問題では、
 * **甲種と乙種の法令 60 記述のうち 34 記述が一字一句同じ**でした。
 * **直したときは、8 つめにも同じ直しを入れること。**
 *
 * **保安管理技術と学識は、これから書きます。**保安管理技術は章の枠だけ引き継ぎ、
 * 本文は「通常の」から「高度の」へ書き直します。学識は**本番が記述式**なので、
 * 章も配点から起こし直しました（`docs/section-plan.md`）。
 *
 * 節を書き始めるときは、**1 章 1 ファイル**（`src/data/textbook/<章 ID>.ts`）にして、
 * ここで束ねてください。複数のエージェントを並行で走らせても衝突しません。
 * **並びは `CATEGORIES` と同じ順にすること。**目次の表示順がここで決まります。
 */
export const SECTIONS: TextbookSection[] = [...intro, ...lawWhat, ...lawPermit, ...lawHandle, ...lawPeople, ...lawVessel, ...lawTech, ...lawOpe, ...hoBurn, ...hoMaterial, ...hoInst, ...hoDevice, ...hoSeal, ...hoSafety, ...hoManage, ...gkState, ...gkSep, ...gkReact, ...gkBurn, ...gkGas, ...gmThermo, ...gmFlow, ...gmHeat, ...gmStrength, ...gmMaterial];

export const sectionById = (id: string): TextbookSection | undefined => SECTIONS.find((s) => s.id === id);

export const sectionsOfCategory = (categoryId: string): TextbookSection[] =>
  SECTIONS.filter((s) => s.categoryId === categoryId);

/** 教本全体の目安学習時間（分）。ホームと目次に出す */
export const totalMinutes = SECTIONS.reduce((sum, s) => sum + s.minutes, 0);
