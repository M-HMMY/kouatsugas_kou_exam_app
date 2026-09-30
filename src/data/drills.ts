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
 * **★ 24 種類そろっています**（2026 年 9 月 23 日）。下の `DRILLS` の説明を読んでください。
 *
 * **★ 書いたら `npm run drills` で目を通すこと。**
 * `npm run check` は 1 種類につき 200 回生成しますが、見ているのは
 * 「5 択か」「重複しないか」「0 が混じらないか」だけです。
 * **日本語として読めるか、選択肢が紛らわしすぎないかは人が読むしかありません。**
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
 * 計算ドリル。**23 種類**（2026 年 9 月 23 日）。
 *
 * **★ 甲種は学識が記述式なので、ここがいちばん効きます。**
 * 択一なら「何に比例するか」が分かれば選べますが、記述式は**式を立てて値を出す**
 * ところまで書かせます。**手が動かないと 1 行も書けません。**
 *
 * **★ 令和 7 年度の計算問題に合わせて割ってあります**（`docs/public-questions.md` §3）。
 *
 * | 区分 | 計算が出た問 | ドリル |
 * | --- | --- | --- |
 * | 学識（化学） | 問 1・2・3・5 の 4 問 | **10 種類** |
 * | 学識（機械） | 問 1・2・4・5 の 4 問 | **11 種類** |
 * | 法令 | — | 2 種類 |
 *
 * **★ 乙種版の「機械は薄く」を持ち込まないこと。**
 * 乙種の令和 7 年度は機械の計算が 1 問だけでしたが、**甲種機械は 5 問中 4 問が計算**です。
 *
 * **★★ 対数と指数の値は、問題文の中で与えます**（本番がそうしています）。
 * 電卓は四則計算と開平計算だけ（受験案内書 Ⅲ-3-③）なので、
 * 令和 7 年度の問題用紙にも $\ln$ の値が添えてありました。
 * **「打てないから出ない」ではありません。**アレニウス、対数平均温度差、
 * 等温圧縮の仕事、可逆断熱変化を、いずれも値を与える形でドリルにしてあります。
 *
 * **★ 開平計算は使えるので、平方根はそのまま出します**（トリチェリの定理）。
 *
 * **物性値は問題文の中で与えています。**台帳に無い値を決め打ちしないためです。
 * **法令の値だけは `docs/primary-numbers.md` §4・§9 から取っています。**
 *
 * **★ 単位の換算を、わざと 1 段入れてあります。**
 * 摂氏と絶対温度、mm と m、kJ と J、毎時と毎秒。
 * 令和 7 年度の甲種機械 問 1 でも、**基準面積の指定と単位換算がそのまま採点の対象**でした。
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

  // ------------------------------------------------------------ 学識（化学）
  //
  // 令和 7 年度の甲種化学は、問 1（状態方程式）・問 2（ラウールの法則）・
  // 問 3（反応速度式の積分）・問 5（燃焼熱と TNT 換算）が計算だった。
  // **その 4 問に対応する型を、前後の段も含めて並べてある。**
  {
    id: 'gk-molar-mass',
    name: '状態方程式から分子量を出す',
    categoryId: 'gk-state',
    sectionId: 'gk-1',
    summary: 'pV ＝ nRT で物質量を出し、質量を割って分子量にする。摂氏を絶対温度へ直すこと',
    generate: () => {
      const p = pick([100, 120, 150, 200, 250, 300]); // kPa（絶対圧力）
      const vol = pick([10, 20, 25, 40, 50]); // L
      const tc = pick([17, 27, 37, 47, 77, 97]); // ℃
      const tk = tc + 273;
      const r = 8.31;
      // kPa × L は、そのまま Pa × m³ ＝ J になる。ここが単位換算の勘どころ。
      const n = (p * vol) / (r * tk);
      const mass = Number((n * pick([2, 4, 16, 17, 28, 32, 44, 64])).toFixed(1)); // g
      const mm = (mass * r * tk) / (p * vol);
      const fmt = (x: number): string => fx(x, 1);
      const { choices, answer } = buildNumeric(mm, fmt, [n, (mm * tc) / tk, mm * (tk / tc)]);
      return {
        question:
          '内容積 ' + vol + ' L の容器に、ある純粋な気体が ' + fx(mass, 1) + ' g 入っている。' +
          '温度 ' + tc + ' ℃、絶対圧力 ' + p + ' kPa のとき、この気体の分子量はおよそいくらか。' +
          '気体定数を 8.31 J/(mol・K) とし、理想気体として扱う。',
        choices,
        answer,
        explanation:
          '**1. 温度を絶対温度へ直す。**' + tc + ' ＋ 273 ＝ ' + tk + ' K。\n' +
          '**2. 物質量を出す。**n ＝ pV ／ (RT)。kPa と L を掛けると、そのまま Pa と m³ を掛けたのと同じ J になるので、' +
          p + ' × ' + vol + ' ÷ (8.31 × ' + tk + ') ＝ ' + fx(n, 3) + ' mol。\n' +
          '**3. 質量を物質量で割る。**' + fx(mass, 1) + ' ÷ ' + fx(n, 3) + ' ＝ ' + fx(mm, 1) + '。\n' +
          '**分子量は単位のない数**である。途中はモル質量 g/mol で進み、最後に分子量へ言い換えて結ぶ。\n' +
          '**摂氏のまま代入すると、答えが ' + fx((mm * tc) / tk, 1) + ' になる。**絶対温度へ直したかを必ず確かめること。',
      };
    },
  },
  {
    id: 'gk-isochoric',
    name: '容積一定で加熱したときの圧力',
    categoryId: 'gk-state',
    sectionId: 'gk-1',
    summary: '体積と物質量が変わらないので、圧力を絶対温度で割った値が一定になる',
    generate: () => {
      const p1 = pick([100, 150, 200, 250, 300, 400]); // kPa（絶対圧力）
      const t1c = pick([7, 17, 27, 37]);
      const t2c = t1c + pick([50, 80, 100, 150, 200]);
      const t1 = t1c + 273;
      const t2 = t2c + 273;
      const p2 = (p1 * t2) / t1;
      const fmt = (x: number): string => fx(x, 1) + ' kPa';
      const { choices, answer } = buildNumeric(p2, fmt, [(p1 * t2c) / t1c, (p1 * t1) / t2, p1 + (t2c - t1c)]);
      return {
        question:
          '内容積が変わらない密閉容器に理想気体が入っている。温度 ' + t1c + ' ℃ のとき絶対圧力は ' +
          p1 + ' kPa であった。ガスを出し入れせずに ' + t2c + ' ℃ まで加熱したとき、絶対圧力はおよそいくらになるか。',
        choices,
        answer,
        explanation:
          '**体積と物質量が変わらない**ので、状態方程式の両辺を割ると p ／ T が一定になる。\n' +
          '**1. 両方の温度を絶対温度へ直す。**' + t1 + ' K と ' + t2 + ' K。\n' +
          '**2. 比を掛ける。**' + p1 + ' × ' + t2 + ' ÷ ' + t1 + ' ＝ ' + fx(p2, 1) + ' kPa。\n' +
          '**摂氏のまま比を取ると ' + fx((p1 * t2c) / t1c, 1) + ' kPa になり、まったく違う値になる。**\n' +
          '「同じ容器だから」だけでは体積が一定と言えるだけである。**ガスを出し入れしていないこと**も、答案に書いておく。',
      };
    },
  },
  {
    id: 'gk-raoult',
    name: 'ラウールの法則で気相のモル分率を出す',
    categoryId: 'gk-sep',
    sectionId: 'gk-7',
    summary: '全圧から液相のモル分率を出し、分圧を全圧で割って気相のモル分率にする',
    generate: () => {
      const pa = pick([120, 150, 180, 200]); // 純 A の飽和蒸気圧 kPa
      const pb = pick([40, 50, 60, 70]); // 純 B の飽和蒸気圧 kPa
      const xa0 = pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]);
      const total = Number((xa0 * pa + (1 - xa0) * pb).toFixed(1)); // 全圧 kPa
      const xa = (total - pb) / (pa - pb);
      const ya = (xa * pa) / total;
      const fmt = (x: number): string => fx(x, 3);
      const { choices, answer } = buildNumeric(ya, fmt, [xa, 1 - xa, (xa * pb) / total, 1 - ya]);
      return {
        question:
          '成分 A と成分 B から成る二成分系が、ある温度で気液平衡にある。この温度における純 A の飽和蒸気圧は ' +
          pa + ' kPa、純 B の飽和蒸気圧は ' + pb + ' kPa であり、全圧は ' + fx(total, 1) +
          ' kPa である。理想溶液とみなせるとき、気相における A のモル分率はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**1. 液相のモル分率を出す。**ラウールの法則より、全圧は各成分の分圧の和である。' +
          'B のモル分率を 1 から A のモル分率を引いた形に置くと、未知数が 1 つの一次方程式になる。\n' +
          '（全圧 − 純 B の蒸気圧）÷（純 A の蒸気圧 − 純 B の蒸気圧）＝ (' + fx(total, 1) + ' − ' + pb +
          ') ÷ (' + pa + ' − ' + pb + ') ＝ ' + fx(xa, 3) + '。\n' +
          '**2. A の分圧を出す。**' + fx(xa, 3) + ' × ' + pa + ' ＝ ' + fx(xa * pa, 1) + ' kPa。\n' +
          '**3. 全圧で割る。**' + fx(xa * pa, 1) + ' ÷ ' + fx(total, 1) + ' ＝ ' + fx(ya, 3) + '。\n' +
          '**液相の ' + fx(xa, 3) + ' で止めないこと。**訊かれているのは気相である。\n' +
          '**検算。**A は沸点の低い側なので、気相のほうが A に富む。' + fx(ya, 3) + ' ＞ ' + fx(xa, 3) +
          ' になっていれば向きが合っている。',
      };
    },
  },
  {
    id: 'gk-rate-first',
    name: '一次反応の速度定数を積分形から出す',
    categoryId: 'gk-react',
    sectionId: 'gk-12',
    summary: '濃度比の対数を時間で割る。対数の値は問題文が与える',
    generate: () => {
      const ratio = pick([
        { r: 2, ln: 0.693 },
        { r: 4, ln: 1.386 },
        { r: 5, ln: 1.609 },
        { r: 10, ln: 2.303 },
      ]);
      const c0 = pick([0.2, 0.4, 0.5, 0.8, 1.0, 2.0]); // mol/L
      const c1 = c0 / ratio.r;
      const t = pick([100, 200, 300, 400, 500, 600]); // s
      const k = ratio.ln / t;
      const fmt = (x: number): string => fx(x, 5) + ' 1/s';
      const { choices, answer } = buildNumeric(k, fmt, [(c0 - c1) / t, ratio.r / t, k / 2]);
      return {
        question:
          'ある反応は A について一次である。A の濃度が ' + fx(c0, 2) + ' mol/L から ' + fx(c1, 3) +
          ' mol/L まで減るのに ' + t + ' 秒かかった。速度定数はおよそいくらか。' +
          '自然対数の値は ln ' + ratio.r + ' ＝ ' + fx(ratio.ln, 3) + ' を用いてよい。',
        choices,
        answer,
        explanation:
          '**1. 変数分離して積分する。**一次反応の速度式を変数分離し、時刻 0 のときの濃度から時刻 t のときの濃度までを区間として積分すると、' +
          '初めの濃度を後の濃度で割った値の自然対数が、速度定数と時間の積に等しくなる。\n' +
          '**2. 濃度比を出す。**' + fx(c0, 2) + ' ÷ ' + fx(c1, 3) + ' ＝ ' + ratio.r + '。\n' +
          '**3. 対数を時間で割る。**' + fx(ratio.ln, 3) + ' ÷ ' + t + ' ＝ ' + fx(k, 5) + ' 1/s。\n' +
          '**割る向きを逆にすると ' + fx(t / ratio.ln, 1) + ' になる。**単位で確かめられる。' +
          '速度定数は 1 秒あたりなので、**1/s** にならなければどこかで向きが逆である。\n' +
          '**一次反応の速度定数は、濃度の単位を含まない。**次数が変われば単位も変わるので、そこで次数を確かめられる。',
      };
    },
  },
  {
    id: 'gk-half-life',
    name: '一次反応の半減期',
    categoryId: 'gk-react',
    sectionId: 'gk-12',
    summary: '半減期は積分形から導く。初期濃度によらないことを確かめる',
    generate: () => {
      const k = pick([0.002, 0.004, 0.005, 0.01, 0.02, 0.025, 0.05]); // 1/s
      const ln2 = 0.693;
      const half = ln2 / k;
      const fmt = (x: number): string => fx(x, 1) + ' 秒';
      // 「0.693 を掛け忘れて 1 ÷ k で止める」「半分ではなく全部と読み違えて 2 倍する」が実際に多い。
      const { choices, answer } = buildNumeric(half, fmt, [1 / k, half * 2, half / 2]);
      return {
        question:
          'ある反応は一次反応で、速度定数は ' + fx(k, 3) + ' 1/s である。この反応の半減期はおよそ何秒か。' +
          '自然対数の値は ln 2 ＝ 0.693 を用いてよい。',
        choices,
        answer,
        explanation:
          '**半減期は別に覚える式ではなく、積分形から導ける。**\n' +
          '**1. 積分形に、濃度が初期濃度の半分になるという条件を入れる。**' +
          '初期濃度を半分の濃度で割ると 2 になるので、左辺は ln 2 になる。\n' +
          '**2. 速度定数で割る。**0.693 ÷ ' + fx(k, 3) + ' ＝ ' + fx(half, 1) + ' 秒。\n' +
          '**★ 一次反応の半減期には初期濃度が入らない。**これは一次反応だけの性質で、' +
          '**次数を見分ける手掛かり**になる。速度が 1 つの反応物の濃度の 2 乗に比例する形の二次反応（2 種の反応物なら、1 対 1 で反応し初期濃度が等しい場合）では、半減期は初期濃度に反比例するので、濃いほど短い。',
      };
    },
  },
  {
    id: 'gk-arrhenius',
    name: 'アレニウスの式から活性化エネルギーを出す',
    categoryId: 'gk-react',
    sectionId: 'gk-14',
    summary: '2 つの温度での速度定数から傾きを出す。対数の値は問題文が与える',
    generate: () => {
      const ratio = pick([
        { r: 2, ln: 0.693 },
        { r: 3, ln: 1.099 },
        { r: 4, ln: 1.386 },
        { r: 5, ln: 1.609 },
      ]);
      const t1 = pick([300, 310, 320, 330]);
      const t2 = t1 + pick([10, 20, 30, 40]);
      const r = 8.31;
      const ea = (r * ratio.ln) / (1 / t1 - 1 / t2) / 1000; // kJ/mol
      const fmt = (x: number): string => fx(x, 1) + ' kJ/mol';
      // 「J のまま kJ と書く」「対数を取らずに倍率をそのまま使う」が実際に多い。
      const { choices, answer } = buildNumeric(ea, fmt, [ea * 1000, (ea * ratio.r) / ratio.ln, ea / 2]);
      return {
        question:
          'ある反応の速度定数は、' + t1 + ' K から ' + t2 + ' K へ温度を上げると ' + ratio.r +
          ' 倍になった。この反応の活性化エネルギーはおよそいくらか。気体定数を 8.31 J/(mol・K) とし、' +
          '自然対数の値は ln ' + ratio.r + ' ＝ ' + fx(ratio.ln, 3) + ' を用いてよい。',
        choices,
        answer,
        explanation:
          '**1. アレニウスの式の両辺の対数を取る。**速度定数の対数を絶対温度の逆数に対して描くと直線になり、' +
          'その傾きは、活性化エネルギーを気体定数で割ったものに負号を付けた値である。\n' +
          '**2. 2 点の差を取る。**速度定数の比の対数は、活性化エネルギーを気体定数で割ったものに、' +
          '2 つの温度の逆数の差を掛けた値になる。\n' +
          '**3. 逆数の差を出す。**1 ÷ ' + t1 + ' − 1 ÷ ' + t2 + ' ＝ ' + fx(1 / t1 - 1 / t2, 6) + ' 1/K。\n' +
          '**4. 活性化エネルギーを出す。**8.31 × ' + fx(ratio.ln, 3) + ' ÷ ' + fx(1 / t1 - 1 / t2, 6) +
          ' ＝ ' + fx(ea * 1000, 0) + ' J/mol ＝ ' + fx(ea, 1) + ' kJ/mol。\n' +
          '**★ J と kJ を混ぜると 1000 倍ずれる。**気体定数が J で与えられているので、出てくるのは J/mol である。\n' +
          '**温度差をそのまま掛けないこと。**効くのは温度そのものではなく、**温度の逆数の差**である。',
      };
    },
  },
  {
    id: 'gk-theoretical-air',
    name: '理論空気量と空気比',
    categoryId: 'gk-burn',
    sectionId: 'gk-17',
    summary: '反応式の酸素の係数から理論酸素量を出し、酸素のモル分率で割る',
    generate: () => {
      const fuel = pick([
        { name: 'メタン', c: 1, h: 4 },
        { name: 'エタン', c: 2, h: 6 },
        { name: 'プロパン', c: 3, h: 8 },
        { name: 'ブタン', c: 4, h: 10 },
        { name: 'エチレン', c: 2, h: 4 },
        { name: 'アセチレン', c: 2, h: 2 },
      ]);
      const o2 = fuel.c + fuel.h / 4; // 燃料 1 mol あたりの理論酸素量
      const frac = 0.21;
      const mol = pick([2, 4, 5, 10, 20]); // 燃料の物質量
      const mu = pick([1.1, 1.2, 1.3, 1.5]); // 空気比
      const air = (mol * o2 * mu) / frac;
      const fmt = (x: number): string => fx(x, 1) + ' mol';
      const { choices, answer } = buildNumeric(air, fmt, [mol * o2 * mu * frac, (mol * o2) / frac, mol * o2 * mu]);
      return {
        question:
          fuel.name + ' ' + mol + ' mol を、空気比 ' + fx(mu, 1) + ' で完全燃焼させる。' +
          '必要な空気の物質量はおよそいくらか。空気中の酸素のモル分率を 0.21 とする。',
        choices,
        answer,
        explanation:
          '**1. 完全燃焼の反応式を書く。**炭素、水素、酸素の順に合わせると係数が定まる。' +
          fuel.name + ' 1 mol には炭素が ' + fuel.c + '、水素が ' + fuel.h + ' あるので、' +
          '理論酸素量は ' + fuel.c + ' ＋ ' + fuel.h + ' ÷ 4 ＝ ' + fx(o2, 2) + ' mol。\n' +
          '**2. 燃料の量を掛ける。**' + fx(o2, 2) + ' × ' + mol + ' ＝ ' + fx(mol * o2, 2) + ' mol。\n' +
          '**3. 酸素のモル分率で割って理論空気量にする。**' + fx(mol * o2, 2) + ' ÷ 0.21 ＝ ' +
          fx((mol * o2) / frac, 1) + ' mol。\n' +
          '**4. 空気比を掛ける。**' + fx((mol * o2) / frac, 1) + ' × ' + fx(mu, 1) + ' ＝ ' + fx(air, 1) + ' mol。\n' +
          '**★ 3 で掛けると向きが逆になる。**空気のうち酸素は一部なので、**必要な空気は酸素より多い。**' +
          '掛けてしまうと空気のほうが少なくなり、桁の見当で気づける。',
      };
    },
  },
  {
    id: 'gk-hess',
    name: '標準生成エンタルピーから燃焼熱を出す',
    categoryId: 'gk-burn',
    sectionId: 'gk-18',
    summary: '生成物の和から反応物の和を引く。符号の向きを間違えないこと',
    generate: () => {
      const fuel = pick([
        { name: 'メタン', hf: -75, co2: 1, h2o: 2 },
        { name: 'エタン', hf: -84, co2: 2, h2o: 3 },
        { name: 'プロパン', hf: -104, co2: 3, h2o: 4 },
        { name: 'ブタン', hf: -126, co2: 4, h2o: 5 },
        { name: 'エチレン', hf: 52, co2: 2, h2o: 2 },
        { name: 'アセチレン', hf: 227, co2: 2, h2o: 1 },
      ]);
      const hCo2 = pick([-390, -392, -394, -396]);
      const hH2o = pick([-282, -284, -286, -288]);
      const dh = fuel.co2 * hCo2 + fuel.h2o * hH2o - fuel.hf;
      const heat = -dh; // 燃焼熱（放出する熱量の大きさ）
      const fmt = (x: number): string => fx(x, 0) + ' kJ/mol';
      const { choices, answer } = buildNumeric(heat, fmt, [
        -(fuel.co2 * hCo2 + fuel.h2o * hH2o + fuel.hf),
        -(fuel.hf - fuel.co2 * hCo2 - fuel.h2o * hH2o),
        -(fuel.co2 * hCo2 + hH2o - fuel.hf),
      ]);
      return {
        question:
          fuel.name + ' 1 mol が完全燃焼して二酸化炭素と液体の水になるときの燃焼熱はおよそいくらか。' +
          '標準生成エンタルピーは、' + fuel.name + 'が ' + fuel.hf + ' kJ/mol、二酸化炭素が ' + hCo2 +
          ' kJ/mol、液体の水が ' + hH2o + ' kJ/mol とする。各元素の標準状態で最も安定な単体（酸素なら気体の O₂）の標準生成エンタルピーは 0 とする。',
        choices,
        answer,
        explanation:
          '**1. 完全燃焼の反応式を書き、水の状態を明示する。**' + fuel.name +
          ' 1 mol から二酸化炭素が ' + fuel.co2 + ' mol、液体の水が ' + fuel.h2o + ' mol 生じる。\n' +
          '**2. 生成物の和から反応物の和を引く。**酸素（気体の O₂）は標準状態で最も安定な単体なので 0 である。単体でも、オゾンのように最も安定な形でなければ 0 にはならない。\n' +
          '(' + fuel.co2 + ' × ' + hCo2 + ') ＋ (' + fuel.h2o + ' × ' + hH2o + ') − (' + fuel.hf + ') ＝ ' +
          fx(dh, 0) + ' kJ/mol。\n' +
          '**3. 燃焼熱は、放出する熱量の大きさなので正で書く。**' + fx(heat, 0) + ' kJ/mol。\n' +
          '**★ 発熱反応では、系のエンタルピー変化は負である。**系からエネルギーが出ていくからで、' +
          '**符号の取り違えは、そのまま失点になる。**\n' +
          '**★ 水を気体として扱えば答えが変わる。**問題文の「液体の水」という一言が、真発熱量と総発熱量のどちらを訊いているかを決める。',
      };
    },
  },
  {
    id: 'gk-tnt',
    name: 'TNT 換算',
    categoryId: 'gk-burn',
    sectionId: 'gk-26',
    summary: '総エネルギーを出してから、TNT の単位質量当たりの爆発熱で割る',
    generate: () => {
      const gas = pick([
        { name: 'アセチレン', mm: 26, q: pick([226, 227, 228]) },
        { name: 'エチレン', mm: 28, q: pick([50, 52, 54]) },
        { name: '酸化エチレン', mm: 44, q: pick([104, 106, 108]) },
      ]);
      const mass = pick([10, 20, 25, 40, 50, 100]); // kg
      const tnt = pick([4.2, 4.5, 4.6, 4.7]); // MJ/kg
      const mol = (mass * 1000) / gas.mm;
      const total = (mol * gas.q) / 1000; // MJ
      const w = total / tnt;
      const fmt = (x: number): string => fx(x, 1) + ' kg';
      const { choices, answer } = buildNumeric(w, fmt, [total * tnt, (mass * gas.q) / tnt, total]);
      return {
        question:
          gas.name + ' ' + mass + ' kg が分解して、すべてのエネルギーが放出されたとする。' +
          gas.name + ' 1 mol あたりの放出エネルギーを ' + gas.q + ' kJ、モル質量を ' + gas.mm +
          ' g/mol、TNT の単位質量当たりの爆発熱を ' + fx(tnt, 1) + ' MJ/kg とするとき、' +
          'TNT 換算の質量はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**1. 物質量を出す。**質量を g に直してモル質量で割る。' + mass + ' × 1000 ÷ ' + gas.mm +
          ' ＝ ' + fx(mol, 1) + ' mol。\n' +
          '**2. 総エネルギーを出す。**' + fx(mol, 1) + ' × ' + gas.q + ' ＝ ' + fx(mol * gas.q, 0) +
          ' kJ ＝ ' + fx(total, 1) + ' MJ。\n' +
          '**3. TNT の爆発熱で割る。**' + fx(total, 1) + ' ÷ ' + fx(tnt, 1) + ' ＝ ' + fx(w, 1) + ' kg。\n' +
          '**★ 単位の追跡が、そのまま検算になる。**エネルギーを「エネルギー ÷ 質量」で割るので、' +
          'エネルギーどうしが約されて**質量の単位**が出る。掛けてしまうと単位が残らない。\n' +
          '**★ kg と g、kJ と MJ を 2 回換算する。**どちらかを落とすと 1000 倍ずれる。',
      };
    },
  },
  {
    id: 'gk-lel-mix',
    name: 'ル・シャトリエの混合則で爆発下限界を出す',
    categoryId: 'gk-burn',
    sectionId: 'gk-20',
    summary: '可燃性成分だけで正規化し、下限界の逆数をモル分率で重み付けする',
    generate: () => {
      const a = pick([
        { name: 'メタン', lel: 5.0 },
        { name: 'プロパン', lel: 2.1 },
        { name: 'エタン', lel: 3.0 },
      ]);
      const b = pick([
        { name: '水素', lel: 4.0 },
        { name: 'ブタン', lel: 1.8 },
        { name: 'エチレン', lel: 2.7 },
      ]);
      const ca = pick([20, 25, 40, 50, 60, 75, 80]);
      const cb = 100 - ca;
      const lel = 100 / (ca / a.lel + cb / b.lel);
      const fmt = (x: number): string => fx(x, 2) + ' vol%';
      const { choices, answer } = buildNumeric(lel, fmt, [
        (ca * a.lel + cb * b.lel) / 100,
        (a.lel + b.lel) / 2,
        ca / a.lel + cb / b.lel,
      ]);
      return {
        question:
          a.name + ' ' + ca + ' vol% と' + b.name + ' ' + cb +
          ' vol% から成る可燃性混合気の爆発下限界を、ル・シャトリエの混合則で概算するとおよそいくらか。' +
          '各成分の爆発下限界は、' + a.name + 'が ' + fx(a.lel, 1) + ' vol%、' + b.name + 'が ' +
          fx(b.lel, 1) + ' vol% とする。',
        choices,
        answer,
        explanation:
          '**1. 可燃性成分だけで正規化する。**今回は 2 成分とも可燃性で、合計が 100 vol% になっている。' +
          '**不活性ガスが混じっている場合は、それを除いてから割り直す。**答案では、正規化したことを式の前に示す。\n' +
          '**2. 逆数の加重和を作る。**' + ca + ' ÷ ' + fx(a.lel, 1) + ' ＋ ' + cb + ' ÷ ' + fx(b.lel, 1) +
          ' ＝ ' + fx(ca / a.lel + cb / b.lel, 2) + '。\n' +
          '**3. 100 をその値で割る。**100 ÷ ' + fx(ca / a.lel + cb / b.lel, 2) + ' ＝ ' + fx(lel, 2) + ' vol%。\n' +
          '**★ 下限界そのものを重み付けして足すのではない。**足すのは**逆数**である。\n' +
          '**検算。**答えは、2 つの成分の下限界（' + fx(Math.min(a.lel, b.lel), 1) + ' と ' +
          fx(Math.max(a.lel, b.lel), 1) + '）の間に入る。外へ出たら、どこかで計算を誤っている。',
      };
    },
  },

  // ------------------------------------------------------------ 学識（機械）
  //
  // **★ 乙種版と割り方が違う。**令和 7 年度の甲種機械は、問 1（総括伝熱係数と伝熱管長さ）・
  // 問 2（ベルヌーイと管摩擦とレイノルズ数）・問 4（薄肉球形胴の応力）・
  // 問 5（等温圧縮と可逆断熱変化）と、**5 問中 4 問が計算**だった。
  {
    id: 'gm-overall-u',
    name: '総括伝熱係数',
    categoryId: 'gm-heat',
    sectionId: 'gm-17',
    summary: '境膜・管壁・境膜を直列の抵抗として足し、逆数を取る',
    generate: () => {
      const hi = pick([500, 800, 1000, 1500, 2000, 3000]); // W/(m²・K)
      const ho = pick([200, 300, 400, 600, 1000]); // W/(m²・K)
      const thick = pick([2, 3, 4, 5, 6]); // mm
      const lam = pick([15, 20, 45, 50]); // W/(m・K)
      const res = 1 / hi + thick / 1000 / lam + 1 / ho;
      const u = 1 / res;
      const fmt = (x: number): string => fx(x, 1) + ' W/(m²・K)';
      // 「抵抗ではなく係数を足す」「板の厚さを m へ直し忘れる」が実際に多い。
      const { choices, answer } = buildNumeric(u, fmt, [hi + ho, 1 / (1 / hi + thick / lam + 1 / ho), (hi + ho) / 2]);
      return {
        question:
          '平板とみなせる伝熱面がある。内側の熱伝達率が ' + hi + ' W/(m²・K)、外側の熱伝達率が ' + ho +
          ' W/(m²・K)、壁の厚さが ' + thick + ' mm、壁の熱伝導率が ' + lam +
          ' W/(m・K) のとき、総括伝熱係数はおよそいくらか。汚れの影響は考えないものとする。',
        choices,
        answer,
        explanation:
          '**熱は内側の境膜、壁、外側の境膜を順に通る。**直列につながった抵抗として扱う。\n' +
          '**1. 抵抗を 3 つ足す。**1 ÷ ' + hi + ' ＋ ' + fx(thick / 1000, 4) + ' ÷ ' + lam + ' ＋ 1 ÷ ' + ho +
          ' ＝ ' + fx(res, 6) + ' (m²・K)/W。\n' +
          '**2. 逆数を取る。**1 ÷ ' + fx(res, 6) + ' ＝ ' + fx(u, 1) + ' W/(m²・K)。\n' +
          '**★ 壁の厚さは m へ直す。**' + thick + ' mm ＝ ' + fx(thick / 1000, 4) + ' m。' +
          'mm のままにすると壁の抵抗が 1000 倍になり、答えがまるで変わる。\n' +
          '**★ 足すのは抵抗であって、熱伝達率ではない。**\n' +
          '**検算。**直列の抵抗では、**いちばん大きい抵抗が全体を支配する。**今回いちばん通りにくいのは ' +
          (1 / ho >= 1 / hi && 1 / ho >= thick / 1000 / lam ? '外側の境膜' : 1 / hi >= thick / 1000 / lam ? '内側の境膜' : '壁') +
          'で、総括伝熱係数は、いちばん小さい熱伝達率（' + Math.min(hi, ho) + '）より小さくなる。',
      };
    },
  },
  {
    id: 'gm-lmtd',
    name: '対数平均温度差',
    categoryId: 'gm-heat',
    sectionId: 'gm-18',
    summary: '両端の温度差の差を、比の対数で割る。対数の値は問題文が与える',
    generate: () => {
      const ratio = pick([
        { r: 2, ln: 0.693 },
        { r: 3, ln: 1.099 },
        { r: 4, ln: 1.386 },
        { r: 5, ln: 1.609 },
      ]);
      const d2 = pick([10, 15, 20, 25, 30, 40]);
      const d1 = d2 * ratio.r;
      const lmtd = (d1 - d2) / ratio.ln;
      const arith = (d1 + d2) / 2;
      const fmt = (x: number): string => fx(x, 1) + ' K';
      // 「算術平均で済ませる」「差そのものを答える」が実際に多い。
      const { choices, answer } = buildNumeric(lmtd, fmt, [arith, d1 - d2, (d1 - d2) * ratio.ln]);
      return {
        question:
          '向流形の熱交換器で、一方の端の温度差が ' + d1 + ' K、もう一方の端の温度差が ' + d2 +
          ' K であった。対数平均温度差はおよそいくらか。自然対数の値は ln ' + ratio.r + ' ＝ ' +
          fx(ratio.ln, 3) + ' を用いてよい。',
        choices,
        answer,
        explanation:
          '**1. 両端の温度差の差を取る。**' + d1 + ' − ' + d2 + ' ＝ ' + (d1 - d2) + ' K。\n' +
          '**2. 比の対数で割る。**' + d1 + ' ÷ ' + d2 + ' ＝ ' + ratio.r + ' なので、' +
          (d1 - d2) + ' ÷ ' + fx(ratio.ln, 3) + ' ＝ ' + fx(lmtd, 1) + ' K。\n' +
          '**★ 既定は対数平均である。**算術平均（' + fx(arith, 1) +
          ' K）を使ってよいのは、問題文がそう指示している場合だけで、' +
          '**どちらを使ったかとその理由を答案に書く。**\n' +
          '**検算。**対数平均は算術平均より必ず小さい。' + fx(lmtd, 1) + ' ＜ ' + fx(arith, 1) +
          ' になっていれば向きが合っている。**逆になったら、割る相手を間違えている。**\n' +
          '**★ 並流と向流では、どの温度どうしの差を取るかが変わる。**まず流れ方を確かめること。',
      };
    },
  },
  {
    id: 'gm-tube-length',
    name: '伝熱管の所要長さ',
    categoryId: 'gm-heat',
    sectionId: 'gm-19',
    summary: '伝熱面積を出してから、円筒の側面積の式で長さに直す',
    generate: () => {
      const q = pick([20, 30, 40, 50, 80, 100]); // kW
      const u = pick([200, 300, 400, 500, 800]); // W/(m²・K)
      const dm = pick([20, 25, 32, 40, 50]); // mm
      const lmtd = pick([15, 20, 25, 30, 40]); // K
      const pi = 3.14;
      const area = (q * 1000) / (u * lmtd);
      const len = area / (pi * (dm / 1000));
      const fmt = (x: number): string => fx(x, 1) + ' m';
      // 「面積で答えを止める」「円周率を掛け忘れる」「答えを 2 倍にずらす」を誤答にする。
      const { choices, answer } = buildNumeric(len, fmt, [area, area / (dm / 1000), len * 2]);
      return {
        question:
          '二重管式熱交換器で、伝熱量が ' + q + ' kW、総括伝熱係数が ' + u +
          ' W/(m²・K)、対数平均温度差が ' + lmtd + ' K である。伝熱管の平均径を ' + dm +
          ' mm とするとき、所要の伝熱管長さはおよそいくらか。円周率は 3.14 とする。',
        choices,
        answer,
        explanation:
          '**1. 伝熱量の単位をそろえる。**' + q + ' kW ＝ ' + q * 1000 + ' W。\n' +
          '**2. 伝熱面積を出す。**伝熱量を、総括伝熱係数と平均温度差の積で割る。' +
          q * 1000 + ' ÷ (' + u + ' × ' + lmtd + ') ＝ ' + fx(area, 3) + ' m²。\n' +
          '**3. 長さに直す。**円筒の側面積は、円周率と径と長さの積である。' +
          fx(area, 3) + ' ÷ (3.14 × ' + fx(dm / 1000, 3) + ') ＝ ' + fx(len, 1) + ' m。\n' +
          '**★ 面積で答えを終えないこと。**訊かれているのは長さである。' +
          '**訊かれた量と違う量で終えるのは、記述式でいちばん惜しい落とし方**で、計算が合っていても点が入らない。\n' +
          '**★ 総括伝熱係数には基準がある。**内面基準・外面基準・平均径基準のどれかを添えて、' +
          '**面積と基準をそろえてから掛ける。**今回は平均径基準である。\n' +
          '**★ 径は m へ直す。**' + dm + ' mm ＝ ' + fx(dm / 1000, 3) + ' m。' +
          '径を mm のまま入れると、長さは 1000 分の 1 に出る。ここでは径を 1 回割るだけなので 1000 倍のずれだが、' +
          '断面積のように径を 2 回掛ける量なら 10 の 6 乗のずれになる。**どの量かで倍率が変わるので、径のうちに m へ直す。**',
      };
    },
  },
  {
    id: 'gm-continuity',
    name: '連続の式で流速を出す',
    categoryId: 'gm-flow',
    sectionId: 'gm-9',
    summary: '非圧縮なら断面積と平均流速の積が一定。面積は径の 2 乗に対応する',
    generate: () => {
      const d1 = pick([100, 150, 200, 250, 300]); // mm
      const d2 = pick([25, 40, 50, 65, 80]); // mm
      const u1 = pick([0.5, 0.8, 1.0, 1.5, 2.0]); // m/s
      const u2 = u1 * (d1 / d2) * (d1 / d2);
      const fmt = (x: number): string => fx(x, 2) + ' m/s';
      // 「径の比をそのまま掛ける（2 乗を忘れる）」「比を逆に取る」が実際に多い。
      const { choices, answer } = buildNumeric(u2, fmt, [u1 * (d1 / d2), u2 * (d1 / d2), u1]);
      return {
        question:
          '内径 ' + d1 + ' mm の管を平均流速 ' + fx(u1, 1) + ' m/s で流れている水が、内径 ' + d2 +
          ' mm の管へ入る。細い側の平均流速はおよそいくらか。水は非圧縮性流体として扱う。',
        choices,
        answer,
        explanation:
          '**非圧縮性流体では、断面積と平均流速の積がどの断面でも等しい。**\n' +
          '**1. 面積の比を出す。**円の面積は径の 2 乗に対応するので、面積の比は (' + d1 + ' ÷ ' + d2 +
          ')² ＝ ' + fx((d1 / d2) * (d1 / d2), 2) + '。\n' +
          '**2. 流速に掛ける。**' + fx(u1, 1) + ' × ' + fx((d1 / d2) * (d1 / d2), 2) + ' ＝ ' + fx(u2, 2) + ' m/s。\n' +
          '**★ 2 乗を忘れて径の比をそのまま掛けると ' + fx(u1 * (d1 / d2), 2) + ' m/s になる。**' +
          '**面積は径の 2 乗に対応する**ことを、式の中で見せること。\n' +
          '**★ mm のままでよい。**比を取るので単位が約される。ただし**両方を同じ単位にそろえる**こと。\n' +
          '**検算。**細くなれば速くなる。ホースの先をつまむと水が速く出るのと同じ向きである。',
      };
    },
  },
  {
    id: 'gm-reynolds',
    name: 'レイノルズ数と流れの判定',
    categoryId: 'gm-flow',
    sectionId: 'gm-11',
    summary: '値を出すだけでは判定にならない。比べた基準を答案に残す',
    generate: () => {
      const rho = pick([800, 900, 1000, 1200]); // kg/m³
      const u = pick([0.5, 1.0, 1.5, 2.0, 3.0]); // m/s
      const dm = pick([20, 25, 40, 50, 80, 100]); // mm
      const mu = pick([0.0005, 0.0008, 0.001, 0.002, 0.005]); // Pa・s
      const re = (rho * u * (dm / 1000)) / mu;
      const fmt = (x: number): string => fx(x, 0);
      // 「径を mm のまま入れる」「粘性係数を掛けてしまう」が実際に多い。
      const { choices, answer } = buildNumeric(re, fmt, [re * 1000, rho * u * (dm / 1000), re / 2]);
      return {
        question:
          '内径 ' + dm + ' mm の円管を、密度 ' + rho + ' kg/m³、粘性係数 ' + fx(mu, 4) +
          ' Pa・s の流体が平均流速 ' + fx(u, 1) + ' m/s で流れている。レイノルズ数はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**1. 径を m へ直す。**' + dm + ' mm ＝ ' + fx(dm / 1000, 3) + ' m。\n' +
          '**2. 4 つの量を組む。**密度、平均流速、代表長さを掛けて、粘性係数で割る。' +
          rho + ' × ' + fx(u, 1) + ' × ' + fx(dm / 1000, 3) + ' ÷ ' + fx(mu, 4) + ' ＝ ' + fx(re, 0) + '。\n' +
          '**3. 判定する。**一般に用いられる目安（2,300 と 4,000）と比べると、この値は ' +
          (re < 2300 ? '2,300 より小さいので層流と判定される' : re > 4000 ? '4,000 より大きいので乱流と判定される' : '2,300 と 4,000 の間にあり、遷移域にあたる') +
          '。\n' +
          '**★ 値を出しただけでは判定にならない。**令和 7 年度は「判定基準を示して確認せよ」という問い方だった。' +
          '**比べた基準そのものを答案に書き、どちら側にあるかを述べる**ところまでが答えである。\n' +
          '**★ 境界の値は目安であって、絶対的な定数ではない。**入口の乱れや管の状態で動く。' +
          '**問題文が基準を示している場合は、それに従う。**\n' +
          '**★ レイノルズ数は無次元である。**単位が残ったら、どこかで組み方を間違えている。' +
          '動粘性係数を使うなら、密度をもう一度掛けてはならない。',
      };
    },
  },
  {
    id: 'gm-pressure-loss',
    name: '直管の圧力損失',
    categoryId: 'gm-flow',
    sectionId: 'gm-12',
    summary: '管摩擦係数、長さと径の比、速度水頭の積。どちらの摩擦係数かを宣言すること',
    generate: () => {
      const lam = pick([0.02, 0.025, 0.03, 0.04]); // ダルシーの管摩擦係数
      const len = pick([20, 50, 80, 100, 150, 200]); // m
      const dm = pick([25, 40, 50, 80, 100]); // mm
      const rho = pick([800, 900, 1000]); // kg/m³
      const u = pick([1.5, 2.0, 2.5, 3.0]); // m/s（1.0 は入れない。2 乗を忘れた値が正解と重なる）
      const dp = ((lam * len) / (dm / 1000)) * ((rho * u * u) / 2);
      const kpa = dp / 1000;
      const fmt = (x: number): string => fx(x, 1) + ' kPa';
      // 「流速の 2 乗を忘れる」「径を mm のまま使う」が実際に多い。
      const { choices, answer } = buildNumeric(kpa, fmt, [
        ((lam * len) / (dm / 1000)) * ((rho * u) / 2) / 1000,
        kpa * 4,
        kpa / 2,
      ]);
      return {
        question:
          '内径 ' + dm + ' mm、長さ ' + len + ' m の直管を、密度 ' + rho + ' kg/m³ の液体が平均流速 ' +
          fx(u, 1) + ' m/s で流れている。ダルシーの式の管摩擦係数を ' + fx(lam, 3) +
          ' とするとき、この直管の圧力損失はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**1. 径を m へ直す。**' + dm + ' mm ＝ ' + fx(dm / 1000, 3) + ' m。\n' +
          '**2. 長さと径の比を出す。**' + len + ' ÷ ' + fx(dm / 1000, 3) + ' ＝ ' + fx(len / (dm / 1000), 0) + '。\n' +
          '**3. 速度水頭を出す。**密度と流速の 2 乗の積を 2 で割る。' + rho + ' × ' + fx(u, 1) + '² ÷ 2 ＝ ' +
          fx((rho * u * u) / 2, 0) + ' Pa。\n' +
          '**4. 掛け合わせる。**' + fx(lam, 3) + ' × ' + fx(len / (dm / 1000), 0) + ' × ' +
          fx((rho * u * u) / 2, 0) + ' ＝ ' + fx(dp, 0) + ' Pa ＝ ' + fx(kpa, 1) + ' kPa。\n' +
          '**★ どちらの摩擦係数かを、答案の最初に宣言する。**ダルシーの管摩擦係数は、' +
          'ファニングの摩擦係数の 4 倍である。**宣言しないと、答えが 4 倍ずれても採点者に区別がつかない。**' +
          '記号ではなく、**式の形（係数 4 があるかどうか）と係数の定義**で見分けること。\n' +
          '**★ 摩擦係数が一定なら、圧力損失は流速の 2 乗に比例する。**流速を倍にすれば損失は 4 倍になる。' +
          'ポンプの動力が流速に敏感なのは、このためである。ただし層流では摩擦係数がレイノルズ数に反比例するので、損失は流速の 1 乗に比例する。\n' +
          '**★ 流速と摩擦係数が同じなら、管内径には反比例する。**細いほど損失が大きい。向きを取り違えると、配管径を選ぶ判断が逆になる。',
      };
    },
  },
  {
    id: 'gm-torricelli',
    name: 'タンクからの流出速度',
    categoryId: 'gm-flow',
    sectionId: 'gm-10',
    summary: '2gh の平方根。開平計算は電卓で打てる',
    generate: () => {
      const h = pick([2, 3, 4, 5, 8, 10, 12, 20]); // m
      const g = 9.8;
      const u = Math.sqrt(2 * g * h);
      const fmt = (x: number): string => fx(x, 2) + ' m/s';
      // 「平方根を取り忘れる」「2 を落とす」が実際に多い。
      const { choices, answer } = buildNumeric(u, fmt, [2 * g * h, Math.sqrt(g * h), g * h]);
      return {
        question:
          '大きな開放タンクの側面に小さな穴が開いており、液面から穴までの深さは ' + h +
          ' m である。穴から流出する液体の速度はおよそいくらか。重力加速度を 9.8 m/s² とし、' +
          '液面の降下速度は無視できるものとする。',
        choices,
        answer,
        explanation:
          '**1. どの 2 点を取るかを宣言する。**液面と流出部の 2 点でベルヌーイの定理を立てる。\n' +
          '**2. 消える項を示す。**液面と流出部がともに大気に開放されているので、' +
          '**両辺に同じ圧力があり、引き算で消える。**「大気圧を 0 と置くから」ではない。' +
          '理由を取り違えると、片側だけが大気開放という条件のときに誤る。\n' +
          '**3. 条件を使う。**タンクの断面積が穴よりはるかに大きいので、' +
          '**連続の式を通して液面の降下速度をほぼ 0 と置ける。**条件が何のために使われるかを書くのが答案である。\n' +
          '**4. 解く。**2 × 9.8 × ' + h + ' ＝ ' + fx(2 * g * h, 1) + ' の平方根を取って、' + fx(u, 2) + ' m/s。\n' +
          '**★ 開平計算は試験の電卓で打てる**（受験案内書 Ⅲ-3-③）。平方根を取り忘れると ' +
          fx(2 * g * h, 1) + ' になり、単位も m/s にならない。\n' +
          '**検算。**深さを 4 倍にしても、速度は 2 倍にしかならない。',
      };
    },
  },
  {
    id: 'gm-cylinder-stress',
    name: '薄肉円筒胴の応力',
    categoryId: 'gm-strength',
    sectionId: 'gm-23',
    summary: '円周応力は肉厚の 2 倍で割り、軸応力は 4 倍で割る。どちらを訊かれたか確かめること',
    generate: () => {
      const p = pick([0.5, 0.8, 1.0, 1.5, 2.0, 3.0]); // MPa
      const d = pick([300, 400, 500, 600, 800, 1000]); // mm
      const t = pick([4, 5, 6, 8, 10, 12]); // mm
      const hoop = (p * d) / (2 * t);
      const axial = (p * d) / (4 * t);
      const asked = pick(['円周応力', '軸応力']);
      const val = asked === '円周応力' ? hoop : axial;
      const other = asked === '円周応力' ? axial : hoop;
      const fmt = (x: number): string => fx(x, 1) + ' MPa';
      // 「もう一方の応力を答える」がいちばん多い。
      const { choices, answer } = buildNumeric(val, fmt, [other, (p * d) / t, (p * t) / (2 * d) + val / 2]);
      return {
        question:
          '内径 ' + d + ' mm、肉厚 ' + t + ' mm の薄肉円筒胴に、内圧 ' + fx(p, 1) +
          ' MPa が作用している。この胴に生じる' + asked + 'はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**' + asked + 'は、内圧と内径の積を、肉厚の ' + (asked === '円周応力' ? '2' : '4') + ' 倍で割る。**\n' +
          fx(p, 1) + ' × ' + d + ' ÷ (' + (asked === '円周応力' ? '2' : '4') + ' × ' + t + ') ＝ ' +
          fx(val, 1) + ' MPa。\n' +
          '**★ 係数の違いは、切る向きから来る。**円周応力は**軸を含む平面**で切って考え、' +
          '**切口が両側にある**ので、応力が働く面積が肉厚と長さの積の 2 倍になる。' +
          '軸応力は**軸に垂直な面で輪切り**にするので、切口は 1 つである。\n' +
          '**★ 単位はそろっている。**MPa と mm の組で計算すれば、答えは MPa になる。' +
          '内径と肉厚を同じ単位にしておけば、長さの単位は約される。\n' +
          '**★ 円周応力は軸応力の 2 倍。**もう一方は ' + fx(other, 1) +
          ' MPa である。**訊かれたのがどちらかを確かめること。**\n' +
          '**検算。**円周応力のほうが大きいので、内圧を受ける円筒形の容器は**縦に裂ける。**',
      };
    },
  },
  {
    id: 'gm-sphere-stress',
    name: '薄肉球形胴の接線応力',
    categoryId: 'gm-strength',
    sectionId: 'gm-24',
    summary: '投影面積と作用面積から釣合いを立てる。円筒胴の円周応力の半分になる',
    generate: () => {
      const p = pick([0.5, 0.8, 1.0, 1.5, 2.0, 3.0]); // MPa
      const d = pick([1000, 1500, 2000, 2500, 3000]); // mm
      const t = pick([8, 10, 12, 15, 20, 25]); // mm
      const sigma = (p * d) / (4 * t);
      const fmt = (x: number): string => fx(x, 1) + ' MPa';
      // 「円筒胴の円周応力の式を当てる」がいちばん多い。
      const { choices, answer } = buildNumeric(sigma, fmt, [(p * d) / (2 * t), (p * d) / t, sigma / 2]);
      return {
        question:
          '内径 ' + d + ' mm、肉厚 ' + t + ' mm の薄肉球形胴に、内圧 ' + fx(p, 1) +
          ' MPa が作用している。この胴に生じる接線応力はおよそいくらか。',
        choices,
        answer,
        explanation:
          '**令和 7 年度の甲種機械 問 4 が、この導出を段階に分けて書かせた。**答えだけでは点にならない。\n' +
          '**1. どこで切るかを書く。**中心を通る平面で半分に切る。' +
          '**球は中心を通る面ならどこで切っても同じ断面**になるので、胴の面内で直交する 2 つの主応力が等しくなる。\n' +
          '**2. 投影面積を径で表す。**内面の曲面を切断面へ投影すると、直径 ' + d +
          ' mm の円になる。**曲面の実面積ではない。**釣合いに効くのは、切断面に垂直な成分だけだからである。\n' +
          '**3. 作用面積を径と肉厚で表す。**外径の円から内径の円を抜いた輪になる。' +
          '**薄肉なので肉厚の 2 乗の項を捨てる**と、円周率と内径と肉厚の積になる。' +
          '**「2 乗を捨てた」と書くこと。**いきなり最終形を書くと、どこから来たのか伝わらない。\n' +
          '**4. 力の釣合いを立てて解く。**両辺の共通因子を消すと、内圧と内径の積を肉厚の 4 倍で割る形になる。\n' +
          fx(p, 1) + ' × ' + d + ' ÷ (4 × ' + t + ') ＝ ' + fx(sigma, 1) + ' MPa。\n' +
          '**★ 同じ内圧・内径・肉厚の円筒胴の円周応力（' + fx((p * d) / (2 * t), 1) + ' MPa）のちょうど半分**である。' +
          'だから同じ内圧・内径・許容応力なら、**薄肉の式の上では球形胴の肉厚はおよそ半分で済み**、大容量の高圧貯槽に球形が選ばれる。\n' +
          '**★ 令和 7 年度は、このあと 3 つの主応力も書かせた。**面内の 2 つがどちらも ' + fx(sigma, 1) +
          ' MPa、厚さ方向の半径応力は薄肉なので 0 と置く。',
      };
    },
  },
  {
    id: 'gm-isothermal-work',
    name: '等温圧縮の仕事',
    categoryId: 'gm-thermo',
    sectionId: 'gm-4',
    summary: '圧力を体積の関数に直してから積分する。対数の値は問題文が与える',
    generate: () => {
      const ratio = pick([
        { r: 2, ln: 0.693 },
        { r: 3, ln: 1.099 },
        { r: 4, ln: 1.386 },
        { r: 5, ln: 1.609 },
        { r: 10, ln: 2.303 },
      ]);
      const n = pick([2, 4, 5, 10, 20]); // mol
      const tc = pick([17, 27, 37, 47]);
      const tk = tc + 273;
      const r = 8.31;
      const w = (n * r * tk * ratio.ln) / 1000; // kJ
      const fmt = (x: number): string => fx(x, 1) + ' kJ';
      // 「摂氏のまま入れる」「対数を取らず圧力比をそのまま掛ける」が実際に多い。
      const { choices, answer } = buildNumeric(w, fmt, [
        (n * r * tc * ratio.ln) / 1000,
        (n * r * tk * ratio.r) / 1000,
        w * 1000,
      ]);
      return {
        question:
          '理想気体 ' + n + ' mol を、温度 ' + tc + ' ℃ に保ったまま、圧力が ' + ratio.r +
          ' 倍になるまでゆっくり圧縮した。外から加えた仕事はおよそいくらか。' +
          '気体定数を 8.31 J/(mol・K) とし、自然対数の値は ln ' + ratio.r + ' ＝ ' + fx(ratio.ln, 3) +
          ' を用いてよい。',
        choices,
        answer,
        explanation:
          '**1. 温度を絶対温度へ直す。**' + tc + ' ＋ 273 ＝ ' + tk + ' K。\n' +
          '**2. 圧力を体積の関数に直してから積分する。**等温変化では圧力が体積に反比例して動くので、' +
          '**圧力を一定とみなしてはいけない。**状態方程式から圧力を体積で書いてから積分すると、対数が出てくる。\n' +
          '**3. 圧力比へ置き換える。**等温なので、体積比と圧力比は逆数の関係にある。' +
          '**置き換えの根拠を書くこと。**\n' +
          '**4. 代入する。**' + n + ' × 8.31 × ' + tk + ' × ' + fx(ratio.ln, 3) + ' ＝ ' +
          fx(n * r * tk * ratio.ln, 0) + ' J ＝ ' + fx(w, 1) + ' kJ。\n' +
          '**★ 符号の約束を答案の冒頭で宣言する。**気体が外へする仕事を正とすれば、圧縮では負になる。' +
          '**外から加えた仕事を正の大きさで答えるときは、そう書いて区別する。**\n' +
          '**★ 等温では内部エネルギーが変わらない**ので、加えた仕事と同じだけの熱が外へ出ていく。\n' +
          '**★ 摂氏のまま入れると ' + fx((n * r * tc * ratio.ln) / 1000, 1) + ' kJ になる。**',
      };
    },
  },
  {
    id: 'gm-adiabatic-temp',
    name: '可逆断熱圧縮の後の温度',
    categoryId: 'gm-thermo',
    sectionId: 'gm-5',
    summary: '温度比は圧力比のべき乗。べきの値は問題文が与える。摂氏と絶対温度を往復すること',
    generate: () => {
      const tbl = pick([
        { r: 2, k: 1.4, f: 1.219 },
        { r: 3, k: 1.4, f: 1.369 },
        { r: 4, k: 1.4, f: 1.486 },
        { r: 2, k: 1.3, f: 1.175 },
        { r: 3, k: 1.3, f: 1.297 },
        { r: 2, k: 1.67, f: 1.326 },
      ]);
      const t1c = pick([7, 17, 27, 37]);
      const t1 = t1c + 273;
      const t2 = t1 * tbl.f;
      const t2c = t2 - 273;
      const fmt = (x: number): string => fx(x, 1) + ' ℃';
      // 「摂氏のまま掛ける」「273 を戻し忘れる」が実際に多い。
      const { choices, answer } = buildNumeric(t2c, fmt, [t1c * tbl.f, t2, t1c * tbl.r]);
      return {
        question:
          '比熱比 ' + fx(tbl.k, 2) + ' の理想気体を、' + t1c + ' ℃ から可逆断熱圧縮で圧力を ' + tbl.r +
          ' 倍にした。圧縮後の温度はおよそ何 ℃ か。圧力比を、比熱比から 1 を引いて比熱比で割った値だけ' +
          '累乗した値は ' + fx(tbl.f, 3) + ' とする。',
        choices,
        answer,
        explanation:
          '**1. 3 つの形から選ぶ。**可逆断熱変化には、圧力と体積、温度と体積、温度と圧力を結ぶ 3 つの形がある。' +
          '**今回は圧力と温度が与えられている**ので、温度比が圧力比の、' +
          '**比熱比から 1 を引いて比熱比で割った**指数乗になる形を使う。\n' +
          '**2. 温度を絶対温度へ直す。**' + t1c + ' ＋ 273 ＝ ' + t1 + ' K。\n' +
          '**3. 掛ける。**' + t1 + ' × ' + fx(tbl.f, 3) + ' ＝ ' + fx(t2, 1) + ' K。\n' +
          '**4. 摂氏へ戻す。**' + fx(t2, 1) + ' − 273 ＝ ' + fx(t2c, 1) + ' ℃。\n' +
          '**★ 摂氏のまま掛けると ' + fx(t1c * tbl.f, 1) + ' ℃ になる。**比を扱う式では、必ず絶対温度にする。\n' +
          '**★ 4 を忘れて ' + fx(t2, 1) + ' で止めないこと。**訊かれているのは摂氏である。\n' +
          '**★ この式が使えるのは、理想気体の可逆断熱変化に限られる。**' +
          '断熱でも不可逆なら成り立たない。絞りは断熱的に扱えるが、この式は当てはまらない。\n' +
          '**検算。**断熱圧縮では温度が上がる。多段圧縮で中間冷却するのは、このためである。',
      };
    },
  },
  {
    id: 'gm-mayer',
    name: 'マイヤーの関係からモル熱容量を出す',
    categoryId: 'gm-thermo',
    sectionId: 'gm-2',
    summary: '理想気体では差が気体定数、比が比熱比。2 つを連立して両方を出す',
    generate: () => {
      const kappa = pick([1.4, 1.3, 1.67, 1.33]);
      const r = 8.31;
      const cv = r / (kappa - 1);
      const cp = kappa * cv;
      const asked = pick(['定容モル熱容量', '定圧モル熱容量']);
      const val = asked === '定容モル熱容量' ? cv : cp;
      const other = asked === '定容モル熱容量' ? cp : cv;
      const fmt = (x: number): string => fx(x, 2) + ' J/(mol・K)';
      // 「もう一方を答える」「比熱比そのもので割る」が実際に多い。
      const { choices, answer } = buildNumeric(val, fmt, [other, r / kappa, r * kappa]);
      return {
        question:
          'ある理想気体の比熱比は ' + fx(kappa, 2) + ' である。この気体の' + asked +
          'はおよそいくらか。計算には気体定数 8.31 J/(mol・K) を用いる。',
        choices,
        answer,
        explanation:
          '**2 つの関係を連立する。**理想気体では、定圧モル熱容量と定容モル熱容量の**差は気体定数**（マイヤーの関係）、' +
          '**比は比熱比**である。\n' +
          '**1. 定容モル熱容量を出す。**気体定数を、**比熱比から 1 を引いた値**で割る。' +
          '8.31 ÷ (' + fx(kappa, 2) + ' − 1) ＝ ' + fx(cv, 2) + ' J/(mol・K)。\n' +
          '**2. 定圧モル熱容量を出す。**比熱比を掛けるか、気体定数を足す。' +
          fx(cv, 2) + ' × ' + fx(kappa, 2) + ' ＝ ' + fx(cp, 2) + ' J/(mol・K)。\n' +
          '**★ 比熱比そのもので割らないこと。**割る相手は「比熱比から 1 を引いた値」である。\n' +
          '**★ 定圧のほうが大きい理由を言えるようにする。**同じ温度差なら内部エネルギーの変化は同じで、' +
          '**定圧では膨張して外へ仕事をするぶんだけ、余分な熱が要る。**だから差がちょうど気体定数になる。\n' +
          '**検算。**差を取ると ' + fx(cp - cv, 2) + ' で、気体定数 8.31 に戻る。',
      };
    },
  },
];
