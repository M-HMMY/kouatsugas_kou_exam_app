import { useState, type JSX } from 'react';

/**
 * 薄肉円筒胴と薄肉球形胴の応力を、内径・板厚・内圧を動かして比べる。
 *
 * **円周応力は軸応力の 2 倍**、**球形胴は円筒胴の円周応力の半分**という
 * 2 つの関係を、数字が並んで動くところで見せる。
 * **薄肉の目安（板厚が内半径の 10 分の 1 程度以下、つまり内径の 20 分の 1）を外れたら注意を出す。**
 * ★ 内径の 10 分の 1 を目安にする資料もあるが、それだと内半径に対して 20 %。
 *   **このアプリは半径で見る側を採る**（docs/primary-numbers.md §16）。
 */
export const widgetId = 'usuniku-ouryoku';

export default function UsunikuOuryoku(): JSX.Element {
  const [p, setP] = useState(2);
  const [d, setD] = useState(1000);
  const [t, setT] = useState(10);

  const hoop = (p * d) / (2 * t); // 円周応力
  const axial = (p * d) / (4 * t); // 軸応力
  const sphere = (p * d) / (4 * t); // 薄肉球形胴
  /*
   * ★ 薄肉の目安は「半径に対して」で見る。
   * t/d <= 0.1 だと、内径 200 mm・板厚 20 mm（半径 100 mm に対して 20 %）まで薄肉になってしまう。
   * r/t >= 10、すなわち t/d <= 0.05 で見る。
   */
  const thin = t / d <= 0.05;

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">薄肉円筒胴と薄肉球形胴の応力</span>
      </div>
      <p className="widget-lead">
        内圧のかかった円筒には 2 種類の応力が出ます。大きいほうが<strong>円周応力</strong>で、
        これが先に材料の限界に達するため、円筒は<strong>軸方向に裂けます</strong>。
      </p>

      <label className="widget-slider">
        <span>内外の圧力差</span>
        <input type="range" min={0.2} max={10} step={0.1} value={p} onChange={(e) => setP(Number(e.target.value))} />
        <span>{p.toFixed(1)} MPa</span>
      </label>
      <label className="widget-slider">
        <span>内径</span>
        <input type="range" min={200} max={3000} step={50} value={d} onChange={(e) => setD(Number(e.target.value))} />
        <span>{d} mm</span>
      </label>
      <label className="widget-slider">
        <span>板厚</span>
        <input type="range" min={4} max={60} step={1} value={t} onChange={(e) => setT(Number(e.target.value))} />
        <span>{t} mm</span>
      </label>

      <div className="widget-result tone-warn">
        円周応力 {hoop.toFixed(1)} MPa ／ 軸応力 {axial.toFixed(1)} MPa
      </div>

      <table className="widget-table">
        <thead>
          <tr>
            <th>応力</th>
            <th>式</th>
            <th>値</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>円周応力（円筒胴）</td>
            <td>PD ／ 2t</td>
            <td className="hit">{hoop.toFixed(1)} MPa</td>
          </tr>
          <tr>
            <td>軸応力（円筒胴）</td>
            <td>PD ／ 4t</td>
            <td>{axial.toFixed(1)} MPa</td>
          </tr>
          <tr>
            <td>薄肉球形胴</td>
            <td>PD ／ 4t</td>
            <td>{sphere.toFixed(1)} MPa</td>
          </tr>
        </tbody>
      </table>

      {!thin && (
        <p className="widget-warn">
          板厚が内半径の {((t / (d / 2)) * 100).toFixed(1)} パーセントになっています。
          薄肉の目安（<strong>内半径の 10 分の 1 程度以下</strong>）を外れると、この式は成り立ちません。
          厚肉では、板の内側と外側で応力が変わってきます。
        </p>
      )}

      <p className="widget-note">
        ★ どのつまみを動かしても、<strong>円周応力は軸応力のちょうど 2 倍</strong>のままです。
        そして<strong>球形胴の応力は、同じ条件の円筒胴の円周応力の半分</strong>になります。
        大型の高圧貯槽が球形なのは、同じ圧力で板を薄くできるからです。
      </p>
      <p className="widget-note">
        ★ 板厚のつまみを細くしていくと、応力が急に立ち上がります。板厚は分母にあるので、
        腐食で肉が減ればそのまま応力が上がります。定期検査で肉厚を測る理由が、ここに出ています。
      </p>
    </div>
  );
}
