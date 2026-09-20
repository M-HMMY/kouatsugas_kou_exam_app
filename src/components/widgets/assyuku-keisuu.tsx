import { useState, type JSX } from 'react';

/**
 * 圧縮係数を動かして、実在気体が理想気体からどれだけずれるかを見る。
 *
 * **1 の上下どちらにも振れる**ことと、**ずれが効いてくるのは高圧側**であることを
 * 数字で見せるための道具。圧縮係数そのものの値は台帳にないので、
 * ここではユーザーに動かしてもらう（実在の気体の値を決め打ちしない）。
 */
export const widgetId = 'assyuku-keisuu';

export default function AssyukuKeisuu(): JSX.Element {
  const [z, setZ] = useState(0.85);
  const [videal, setVideal] = useState(20);

  const vreal = videal * z;
  const diff = vreal - videal;
  const pct = (diff / videal) * 100;

  const tone = Math.abs(pct) < 5 ? 'tone-safe' : Math.abs(pct) < 15 ? 'tone-warn' : 'tone-danger';

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">圧縮係数で、どれだけずれるか</span>
      </div>
      <p className="widget-lead">
        実在の気体は、高圧・低温になるほど状態方程式からずれます。そのずれを表すのが圧縮係数
        <strong>Z</strong> で、PV ＝ Z m R T と書きます。理想気体なら Z ＝ 1 です。
      </p>

      <label className="widget-slider">
        <span>理想気体として計算した体積</span>
        <input
          type="range"
          min={5}
          max={100}
          step={1}
          value={videal}
          onChange={(e) => setVideal(Number(e.target.value))}
        />
        <span>{videal} m³</span>
      </label>
      <label className="widget-slider">
        <span>圧縮係数 Z</span>
        <input type="range" min={0.5} max={1.5} step={0.01} value={z} onChange={(e) => setZ(Number(e.target.value))} />
        <span>{z.toFixed(2)}</span>
      </label>

      <div className={`widget-result ${tone}`}>
        実在気体としての体積は {vreal.toFixed(1)} m³（{pct >= 0 ? '＋' : '−'}
        {Math.abs(pct).toFixed(1)} パーセント）
      </div>

      <ul className="widget-list">
        <li className={z < 1 ? 'passed' : ''}>
          Z が 1 より小さい … <strong>分子間の引力</strong>が効いている。理想気体より縮む
        </li>
        <li className={z > 1 ? 'passed' : ''}>
          Z が 1 より大きい … <strong>分子自身の体積と反発</strong>が効いている。理想気体より縮みにくい
        </li>
        <li className={Math.abs(z - 1) < 0.02 ? 'passed' : ''}>
          Z がほぼ 1 … 常温・低圧の空気や窒素。状態方程式をそのまま使える
        </li>
      </ul>

      <p className="widget-note">
        ★ 圧縮係数は<strong>圧力と温度で変わる量</strong>であって、気体ごとに決まった定数ではありません。
        高圧ガスを扱う設備では、この差が貯蔵量の見積りにそのまま効いてきます。
        なお、具体的な Z の値はこの教本の数値の台帳に入れていないので、ここでは自分で動かして確かめる作りにしてあります。
      </p>
    </div>
  );
}
