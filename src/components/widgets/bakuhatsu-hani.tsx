import { useState, type JSX } from 'react';

/**
 * 爆発範囲の中を濃度が動くとどうなるかを見る。
 *
 * **★ 具体的な爆発範囲の値は、この教本の数値の台帳に入れていない**
 * （docs/primary-numbers.md §16。法令の外に一次資料が要る）。
 * だから下限界と上限界は**ユーザーに入力させる**作りにしてある。
 * 値を決め打ちせずに、置換の途中で範囲を通ることだけを体で覚えてもらう。
 */
export const widgetId = 'bakuhatsu-hani';

export default function BakuhatsuHani(): JSX.Element {
  const [lel, setLel] = useState(4);
  const [uel, setUel] = useState(75);
  const [c, setC] = useState(90);

  const lo = Math.min(lel, uel);
  const hi = Math.max(lel, uel);
  const inside = c >= lo && c <= hi;
  /*
   * ★ 範囲の中点から化学量論組成や燃焼速度の最大点は出せない。
   * 下限界 5 %・上限界 95 % なら、ガスの種類にかかわらず 50 % が最大だと言うことになる。
   * 最大の位置は燃料ごとに違うので、このウィジェットでは出さない。
   */

  const state = inside ? '爆発範囲の中' : c < lo ? '下限界より薄い' : '上限界より濃い';
  const tone = inside ? 'tone-danger' : 'tone-safe';

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">濃度を動かすと、どこで燃えるか</span>
      </div>
      <p className="widget-lead">
        可燃性ガスは、薄すぎても濃すぎても燃えません。
        <strong>下限界と上限界はガスによって違う</strong>ので、ここでは自分で入れて動かしてください。
      </p>

      <label className="widget-slider">
        <span>爆発下限界</span>
        <input type="range" min={0.5} max={20} step={0.1} value={lel} onChange={(e) => setLel(Number(e.target.value))} />
        <span>{lel.toFixed(1)} 体積パーセント</span>
      </label>
      <label className="widget-slider">
        <span>爆発上限界</span>
        <input type="range" min={5} max={95} step={0.5} value={uel} onChange={(e) => setUel(Number(e.target.value))} />
        <span>{uel.toFixed(1)} 体積パーセント</span>
      </label>
      <label className="widget-slider">
        <span>いまの濃度</span>
        <input type="range" min={0} max={100} step={0.5} value={c} onChange={(e) => setC(Number(e.target.value))} />
        <span>{c.toFixed(1)} 体積パーセント</span>
      </label>

      <div className={`widget-result ${tone}`}>{state}</div>

      <ul className="widget-list">
        <li className={c < lo ? 'passed' : ''}>下限界より薄い … 燃料が足りず、火炎が伝ぱしない</li>
        <li className={inside ? 'passed' : ''}>
          範囲の中 … 燃える。<strong>化学量論組成のあたりで燃焼速度が最大</strong>になるが、
          その位置は下限界と上限界からは決まらない
        </li>
        <li className={c > hi ? 'passed' : ''}>上限界より濃い … 酸素が足りず、火炎が伝ぱしない</li>
      </ul>

      <p className="widget-note">
        ★ <strong>上限界より濃い状態は「安全」ではありません。</strong>
        濃度のつまみを上限界より上から下へ動かしてみてください。空気で薄めていく途中で、必ず範囲の中を通ります。
        置換作業でいちばん危ないのが、この通過のときです。だから可燃性ガスを空気で直接置換せず、
        先に不活性ガスを挟みます。
      </p>
      <p className="widget-note">
        ★ 範囲そのものも動きます。<strong>温度・圧力・酸素濃度を上げると広がり、とくに上限界が大きく上がります。</strong>
        常圧で測った表を、そのまま高圧の設備に当てはめないでください。
      </p>
    </div>
  );
}
