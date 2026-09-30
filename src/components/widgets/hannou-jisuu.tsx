import { useState, type JSX } from 'react';

/**
 * 反応次数ごとに、**何を縦軸に取ると直線になるか**を数字で見せる。
 * ★ 対象は、反応物が 1 種類で速度が k[A]^n の形の反応に限る。
 *   k[A][B] 型の 2 次反応（初期濃度が異なる場合）では、逆数は直線にならない。
 *
 * **令和 7 年度の甲種化学 問 3 が、速度式の積分だった。**
 * 教本には「0 次は濃度、1 次は濃度の対数、2 次は濃度の逆数が直線」と表で書けるが、
 * **表を覚えるのと、データを見て次数を当てられるのは別**である。
 *
 * 次数を切り替えると、3 つの列のうち**差が一定になる列が 1 つだけ**動く。
 * **実験データから次数を判定するとき、何を縦軸に取るかがそのまま判定になる**
 * ことが、ここで見える。
 *
 * ★ 0 次では濃度が 0 になりうる。そこから先は対数も逆数も取れないので、
 *   **反応が終わったものとして「—」を出す。**NaN を画面へ出さない。
 */
export const widgetId = 'hannou-jisuu';

const ORDERS = [
  { key: '0', label: '0 次' },
  { key: '1', label: '1 次' },
  { key: '2', label: '2 次' },
];

export default function HannouJisuu(): JSX.Element {
  const [order, setOrder] = useState('1');
  const [c0, setC0] = useState(1.0);
  const [k, setK] = useState(0.2);

  const times = [0, 1, 2, 3, 4, 5];
  const conc = times.map((t) => {
    if (order === '0') return c0 - k * t;
    if (order === '1') return c0 * Math.exp(-k * t);
    return 1 / (1 / c0 + k * t);
  });

  /** 列の差が一定かどうかを見る。反応が終わった行は見ない */
  const isLinear = (vals: (number | null)[]): boolean => {
    const ok = vals.filter((v): v is number => v !== null);
    if (ok.length < 3) return false;
    const diffs: number[] = [];
    for (let i = 1; i < ok.length; i++) diffs.push(ok[i] - ok[i - 1]);
    const first = diffs[0];
    if (Math.abs(first) < 1e-9) return false;
    return diffs.every((d) => Math.abs(d - first) / Math.abs(first) < 0.01);
  };

  const alive = conc.map((c) => (c > 1e-6 ? c : null));
  const colC = alive;
  const colLn = alive.map((c) => (c === null ? null : Math.log(c)));
  const colInv = alive.map((c) => (c === null ? null : 1 / c));

  const linC = isLinear(colC);
  const linLn = isLinear(colLn);
  const linInv = isLinear(colInv);

  const fmt = (v: number | null, digits: number): string => (v === null ? '—' : v.toFixed(digits));

  const answer = linC ? '濃度そのもの' : linLn ? '濃度の自然対数' : linInv ? '濃度の逆数' : '（判定できません）';

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">反応次数は、何を縦軸に取ると直線になるか</span>
      </div>
      <p className="widget-lead">
        全体反応の反応次数は<strong>実験で決まります。</strong>
        実験データからどの次数かを判定するとき、
        <strong>何を縦軸に取るかが、そのまま次数の判定になります。</strong>
        次数を切り替えて、差が一定になる列がどう移るかを見てください。
        ここで扱うのは、<strong>反応物が 1 種類で、速度がその濃度の次数乗に比例する形</strong>
        （2 次なら濃度の 2 乗に比例する形）です。2 つの成分の積に比例する 2 次反応は、初期濃度が等しくない限り、この表のようにはなりません。
      </p>

      <label className="widget-slider">
        <span>反応次数</span>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          {ORDERS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <span>を仮定</span>
      </label>
      <label className="widget-slider">
        <span>初期濃度</span>
        <input type="range" min={0.2} max={2} step={0.1} value={c0} onChange={(e) => setC0(Number(e.target.value))} />
        <span>{c0.toFixed(1)} mol/L</span>
      </label>
      <label className="widget-slider">
        <span>速度定数</span>
        <input type="range" min={0.05} max={0.5} step={0.05} value={k} onChange={(e) => setK(Number(e.target.value))} />
        <span>{k.toFixed(2)}</span>
      </label>

      <div className="widget-result tone-safe">直線になるのは {answer}</div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>時間</th>
            <th className={linC ? 'hit' : ''}>濃度</th>
            <th className={linLn ? 'hit' : ''}>濃度の自然対数</th>
            <th className={linInv ? 'hit' : ''}>濃度の逆数</th>
          </tr>
        </thead>
        <tbody>
          {times.map((t, i) => (
            <tr key={t}>
              <td>{t}</td>
              <td className={linC ? 'hit' : ''}>{fmt(colC[i], 3)}</td>
              <td className={linLn ? 'hit' : ''}>{fmt(colLn[i], 3)}</td>
              <td className={linInv ? 'hit' : ''}>{fmt(colInv[i], 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="widget-note">
        ★ 印を付けた列は、<strong>上から下へ一定の幅で変わっています。</strong>
        横軸を時間に取れば直線になる、ということです。
        次数を切り替えると、印の付く列が移ります。
      </p>
      <p className="widget-note">
        ★ 0 次では、濃度が 0 に達したところで反応が終わります。
        そこから先は対数も逆数も取れないので「—」にしてあります。
        <strong>1 次と 2 次では、計算の上では濃度が 0 になりません。</strong>
        ここも 0 次を見分ける手掛かりになります。
      </p>
      <p className="widget-note">
        ★ <strong>速度定数の単位は、次数によって変わります。</strong>
        1 次だけが「1 秒あたり」で、濃度の単位を含みません。
        <strong>出した値の単位を見れば、どの次数の式を使ったかが分かります。</strong>
      </p>
      <p className="widget-note">
        ★ 記述式では、<strong>変数分離してから積分の区間を明示する</strong>ところが採点の対象になります。
        時刻 0 のときの濃度と時刻 t のときの濃度を区間として書き、
        <strong>積分定数を残さず、初期条件を入れて決めます。</strong>
      </p>
    </div>
  );
}
