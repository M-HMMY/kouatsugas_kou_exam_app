/**
 * 計算ドリル：出題のたびに数値が変わる自動生成問題。
 *
 * 計算問題は同じ問題文を暗記してしまうと本番で崩れるため、
 * 値を振り直して「手順」だけが身に付くようにしている。
 * 生成した問題は復習カード（SRS）には登録しない（同じ問題が二度と現れないため）。
 *
 * **この試験には計算問題が出る。**とくに**学識は 15 問に 120 分**（1 問 8 分）で、
 * **時間をかけて計算させる作り**になっている。化学なら状態方程式・物質収支・反応熱、
 * 機械なら円筒の応力・圧力損失・熱の移動あたりが計算になる。
 * **どの単元に何問出るかは、公開問題を分析してから決めること**（`docs/public-questions.md`）。
 *
 * **物性値をこちらで決め打ちしない。**問題文の中で与えること。
 * 実在の物質の値を書くと `docs/primary-numbers.md` の裏づけが要るうえ、
 * 出典によって値が違う。**ドリルは手順の練習なので、値は与えてよい。**
 * **ただし法令の値（容器の内容積の区分など）だけは台帳から取ること。**
 *
 * 手順で必ず解けるものに絞ること。有効数字や単位の扱いで割れる問題は、
 * 自動生成すると答えが一意にならない。
 *
 * **★ まだ 1 つも作っていない。**骨組み（`pick` / `fx` / `buildNumeric` / `build`）は
 * 姉妹アプリからそのまま持ってきてあるので、章が決まったら中身を足すこと。
 */

export interface DrillItem {
  question: string;
  choices: string[];
  answer: number;
  /** 計算手順の解説 */
  explanation: string;
}

export interface Drill {
  id: string;
  name: string;
  categoryId: string;
  sectionId: string;
  summary: string;
  generate: () => DrillItem;
}

// ---------------------------------------------------------------- 補助関数

const rnd = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

/** 選択肢や条件をランダムに 1 つ選ぶ。新しいドリルを書くときに使う */
export function pick<T>(items: readonly T[]): T {
  return items[rnd(0, items.length - 1)];
}

/** 小数を読みやすく整える（末尾の 0 を落とす）。新しいドリルを書くときに使う */
export function fx(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toString();
}

/**
 * 正解と誤答候補から 5 択を作る。重複は除き、足りなければ補充関数で埋める。
 *
 * **5 択なのは、この試験が五肢択一式だから。**姉妹アプリは四肢択一で 4 択だった。
 * 本番と選択肢の数が違うと、消去法の手応えが変わってしまう。
 */
function build(
  correct: string,
  wrongs: string[],
  fallback?: (i: number) => string,
): { choices: string[]; answer: number } {
  const pool: string[] = [];
  for (const w of wrongs) {
    if (w !== correct && !pool.includes(w)) pool.push(w);
    if (pool.length === 4) break;
  }
  for (let i = 1; pool.length < 4 && i < 80; i++) {
    const extra = fallback ? fallback(i) : String(i);
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const all = [correct, ...pool];
  for (let j = all.length - 1; j > 0; j--) {
    const k = rnd(0, j);
    [all[j], all[k]] = [all[k], all[j]];
  }
  return { choices: all, answer: all.indexOf(correct) };
}

/**
 * 数値の 5 択。ありがちな誤答を先に使い、足りない分は倍率でずらして作る。
 * 正解が 0 や負になりうる問題では倍率では埋まらないので、build に自前の
 * 補充関数を渡すこと（npm run check が「選択肢が 2 個になる」で捕まえる）。
 */
export function buildNumeric(
  correct: number,
  fmt: (n: number) => string,
  mistakes: number[],
): { choices: string[]; answer: number } {
  const wrongs = mistakes.filter((n) => Number.isFinite(n) && n >= 0).map(fmt);
  const factors = [2, 0.5, 1.5, 0.8, 1.25, 3, 0.25, 1.1, 0.9, 1.4, 0.6];
  let fi = 0;
  return build(fmt(correct), wrongs, () => fmt(correct * factors[fi++ % factors.length]));
}

/**
 * 計算ドリル。**13 種類**（2026 年 9 月 18 日）。
 *
 * **★ 区分で力の入れどころが違う**（`docs/public-questions.md` §3）。
 * 令和 7 年度の計算問題は**学識（化学）が 4 問、学識（機械）は 1 問だけ**だった。
 * だから**化学を厚く（7 種類）、機械を薄く（4 種類）**してある。
 * 機械の「何に比例するか」は、ドリルより教本の一問一答で押さえる作り。
 *
 * **法令にも計算はある**ので 2 種類入れた（容器の充塡量、貯蔵所の要否）。
 * **法令の値だけは `docs/primary-numbers.md` §4・§9 から取っている。**
 * ほかの物性値は問題文の中で与えている（台帳に無いものを決め打ちしないため）。
 *
 * **★ 電卓の制約に合わせてある。**四則計算と開平計算だけで解けるものに限り、
 * 対数・指数を含む式（アレニウス、断熱変化、等温圧縮の仕事）はドリルにしていない。
 */
export const DRILLS: Drill[] = [
  // ------------------------------------------------------------ 法令
  {
    id: 'lw-fill-mass',
    name: '容器に充塡できる液化ガスの質量',
    categoryId: 'law-vessel',
    sectionId: 'lw-25',
    summary: 'G ＝ V ／ C。内容積と定数から、充塡できる質量を出す',
    generate: () => {
      // C の値は容器保安規則 22 条（基準日版）。docs/primary-numbers.md §9 から。
      const gas = pick([
        { name: '液化プロパン', c: 2.35 },
        { name: '液化アンモニア', c: 1.86 },
        { name: '液化塩素', c: 0.8 },
        { name: '液化炭酸ガス', c: 1.34 },
        { name: '液化ブタン', c: 2.05 },
      ]);
      const v = pick([20, 30, 40, 47, 50, 100, 120]);
      const g = v / gas.c;
      const fmt = (n: number): string => fx(n, 1) + ' kg';
      const { choices, answer } = buildNumeric(g, fmt, [v * gas.c, v, gas.c * 10]);
      return {
        question:
          '内容積 ' + v + ' L の容器に ' + gas.name + ' を充塡する。定数 C を ' + fx(gas.c, 2) +
          ' とするとき、充塡することができる最大の質量はおよそいくらか。',
        choices,
        answer,
        explanation:
          'G ＝ V ／ C なので、' + v + ' ÷ ' + fx(gas.c, 2) + ' ＝ ' + fx(g, 1) + ' kg。\n' +
          'C は分母にあるので、C が大きいガスほど充塡できる質量は小さくなる。' +
          'V × C と掛けてしまうと向きが逆になるので、割り算であることを確かめること。',
      };
    },
  },
  {
    id: 'lw-storage-volume',
    name: '貯蔵所が要るかどうか',
    categoryId: 'law-handle',
    sectionId: 'lw-10',
    summary: '液化ガス 10 kg を容積 1 m³ とみなして、300 m³ と比べる',
    generate: () => {
      const kg = pick([2000, 2500, 2800, 3000, 3200, 3500, 4000, 5000]);
      const v = kg / 10;
      const fmt = (n: number): string => fx(n, 0) + ' m³';
      const { choices, answer } = buildNumeric(v, fmt, [kg / 100, kg, kg / 1000]);
      return {
        question:
          '液化ガス ' + kg + ' kg を貯蔵する。高圧ガス保安法第 16 条第 3 項のみなし規定により、' +
          'この液化ガスは容積いくらとみなされるか。',
        choices,
        answer,
        explanation:
          '液化ガス 10 kg をもって容積 1 m³ とみなすので、' + kg + ' ÷ 10 ＝ ' + fx(v, 0) + ' m³。\n' +
          'この値が 300 m³ 以上であれば、貯蔵所において貯蔵しなければならない（' +
          (v >= 300 ? '今回は 300 m³ 以上なので貯蔵所が要る' : '今回は 300 m³ 未満なので貯蔵所は要らない') +
          '）。100 で割ると桁がひとつずれるので、10 で割ることを確かめること。',
      };
    },
  },

  // ------------------------------------------------------------ 学識（化学・機械）
  //
  // **★ これから書きます。**8 つめ（`kouatsugas_otsu_exam_app`）の 11 種類が種になりますが、
  // **そのまま持ってくると甲種には軽すぎます。**乙種の学識は択一 15 問で、
  // 令和 7 年度の計算問題は化学 4 問・機械 1 問でした。
  // **甲種の学識は記述式で、計算は式の立て方と根拠まで書かせます**
  // （令和 7 年度：総括伝熱係数と伝熱管長さ、ベルヌーイと管摩擦、ラウールの法則、
  // 反応速度式の積分、標準生成エンタルピーと TNT 換算、可逆断熱変化）。
  //
  // **★ 電卓の制約は甲種でも同じ**（受験案内書 Ⅲ-3-③）。四則計算と開平計算だけ。
  // 対数・指数・三角関数は打てません。**ただし記述式なので、「式を書いて答えを示せ」
  // という形では出ます。**「打てないから出ない」とは言えないことに注意。
];
