import { useState, type JSX } from 'react';

/**
 * ラウールの法則で、液相の組成から全圧と気相の組成を出す。
 *
 * **令和 7 年度の甲種化学 問 2 がここだった。**
 * 教本には「平衡でも液相と気相の組成は同じではない」と書けるが、
 * **どれだけ違うのかは数字を動かさないと掴めない。**
 *
 * つまみを動かすと、次の 3 つが見える。
 *   - **気相は、必ず沸点の低い（飽和蒸気圧の高い）成分に富む**
 *   - **2 つの飽和蒸気圧を近づけると、液相と気相の差が消えていく**
 *     （比揮発度が 1 に近づく。蒸留で分けにくくなるのはこのため）
 *   - **全圧は、2 つの純成分の飽和蒸気圧の間に必ず入る**（桁の検算に使える）
 *
 * ★ 物性値は決め打ちしない。飽和蒸気圧は台帳に無いので、つまみで入れてもらう。
 */
export const widgetId = 'kieki-heikou';

export default function KiekiHeikou(): JSX.Element {
  const [xa, setXa] = useState(0.4);
  const [pa, setPa] = useState(160);
  const [pb, setPb] = useState(40);

  const partA = xa * pa;
  const partB = (1 - xa) * pb;
  const total = partA + partB;
  const ya = partA / total;
  // 比揮発度。1 に近いほど分けにくい
  const alpha = pa / pb;
  const enrich = ya - xa;

  const tone = Math.abs(enrich) < 0.03 ? 'tone-danger' : Math.abs(enrich) < 0.15 ? 'tone-warn' : 'tone-safe';

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">ラウールの法則と気液平衡</span>
      </div>
      <p className="widget-lead">
        平衡とは<strong>各成分の移動が釣り合った状態</strong>であって、
        <strong>組成が同じという意味ではありません。</strong>
        軽い成分ほど蒸気へ逃げやすいので、気相は液相より軽い成分に富みます。
        蒸留が成り立つのは、この差があるからです。
      </p>

      <label className="widget-slider">
        <span>液相の A のモル分率</span>
        <input type="range" min={0.05} max={0.95} step={0.05} value={xa} onChange={(e) => setXa(Number(e.target.value))} />
        <span>{xa.toFixed(2)}</span>
      </label>
      <label className="widget-slider">
        <span>純 A の飽和蒸気圧</span>
        <input type="range" min={20} max={300} step={10} value={pa} onChange={(e) => setPa(Number(e.target.value))} />
        <span>{pa} kPa</span>
      </label>
      <label className="widget-slider">
        <span>純 B の飽和蒸気圧</span>
        <input type="range" min={20} max={300} step={10} value={pb} onChange={(e) => setPb(Number(e.target.value))} />
        <span>{pb} kPa</span>
      </label>

      <div className={'widget-result ' + tone}>
        液相 {xa.toFixed(3)} → 気相 {ya.toFixed(3)}
      </div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>段</th>
            <th>出し方</th>
            <th>値</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A の分圧</td>
            <td>液相のモル分率 × 純 A の飽和蒸気圧</td>
            <td>{partA.toFixed(1)} kPa</td>
          </tr>
          <tr>
            <td>B の分圧</td>
            <td>（1 − 液相のモル分率）× 純 B の飽和蒸気圧</td>
            <td>{partB.toFixed(1)} kPa</td>
          </tr>
          <tr>
            <td>全圧</td>
            <td>分圧の和</td>
            <td>{total.toFixed(1)} kPa</td>
          </tr>
          <tr>
            <td>気相の A のモル分率</td>
            <td>A の分圧 ÷ 全圧</td>
            <td className="hit">{ya.toFixed(3)}</td>
          </tr>
          <tr>
            <td>比揮発度</td>
            <td>純 A の飽和蒸気圧 ÷ 純 B の飽和蒸気圧</td>
            <td className={Math.abs(alpha - 1) < 0.2 ? 'miss' : ''}>{alpha.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {Math.abs(alpha - 1) < 0.2 && (
        <p className="widget-warn">
          比揮発度が {alpha.toFixed(2)} で、1 にとても近い状態です。
          <strong>一回の気液平衡で得られる組成差がほとんどありません。</strong>
          分けるには段を何段も重ねる必要があり、必要な理論段数が跳ね上がります。
        </p>
      )}

      <p className="widget-note">
        ★ 気相のほうが {enrich >= 0 ? '大きく' : '小さく'}なっています（差 {Math.abs(enrich).toFixed(3)}）。
        {enrich >= 0
          ? '飽和蒸気圧の高い A が、気相に富んでいます。'
          : 'いまは B のほうが飽和蒸気圧が高いので、A は気相で薄まります。A と B のどちらが軽いかを確かめてください。'}
        <strong>この向きは検算に使えます。</strong>
      </p>
      <p className="widget-note">
        ★ 全圧 {total.toFixed(1)} kPa は、<strong>2 つの純成分の飽和蒸気圧（{Math.min(pa, pb)} と {Math.max(pa, pb)}）の間</strong>
        に必ず入ります。外へ出たら、どこかで計算を誤っています。
      </p>
      <p className="widget-note">
        ★ 2 つの飽和蒸気圧のつまみを近づけると、液相と気相の差が消えていきます。
        <strong>共沸はこれが完全に一致した状態</strong>で、そこから先は通常の蒸留では濃縮できません。
        「沸点が違えば分けられる」という一般化が通らない場面です。
      </p>
      <p className="widget-note">
        ★ 試験では<strong>逆向き</strong>に問われます。全圧が与えられて、液相のモル分率を出させる形です。
        その場合は、全圧から純 B の飽和蒸気圧を引き、2 つの飽和蒸気圧の差で割ります。
        <strong>未知数が 1 つの一次方程式を立てるところまでが答案です。</strong>
      </p>
    </div>
  );
}
