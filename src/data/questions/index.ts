import type { Question } from '../../types';
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
 * 確認問題の全体。
 *
 * **★ 法令の 60 問は 8 つめから引き継いでいます**（同じ法令・同じ基準日のため）。
 * **保安管理技術と学識は、これから書きます。**
 *
 * **教本より先に書かないこと。**問題は教本の節にひも付けるものなので、
 * 節が無いと `sectionId` を付けられません。
 *
 * **★ 学識は、本番が記述式です。**このアプリの学識の確認問題は択一ですが、
 * **本番の形式ではありません。**画面にそう書いてあります（`src/pages/Mock.tsx`）。
 * 択一に落とすときは、**記述式で問われている考え方**（式の立て方、条件の付き方、
 * どの項が何を表すか）を選ばせる問にしてください。
 * **語句の暗記だけを問う問にすると、本番との距離がいちばん開きます。**
 *
 * 設問の形は `docs/public-questions.md` §2 を見てください。
 */
export const QUESTIONS: Question[] = [...lawWhat, ...lawPermit, ...lawHandle, ...lawPeople, ...lawVessel, ...lawTech, ...lawOpe, ...hoBurn, ...hoMaterial, ...hoInst, ...hoDevice, ...hoSeal, ...hoSafety, ...hoManage, ...gkState, ...gkSep, ...gkReact, ...gkBurn, ...gkGas, ...gmThermo, ...gmFlow, ...gmHeat, ...gmStrength, ...gmMaterial];

export const questionById = (id: string): Question | undefined => QUESTIONS.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): Question[] =>
  QUESTIONS.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): Question[] =>
  QUESTIONS.filter((q) => q.sectionId === sectionId);
