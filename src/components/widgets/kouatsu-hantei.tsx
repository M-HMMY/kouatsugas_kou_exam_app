import { useState, type JSX } from 'react';

/**
 * 高圧ガスに当たるかどうかを、圧力と温度を動かして確かめる。
 *
 * **表で覚えるより動かしたほうが早い**ところ。とくに第三号の後半
 * （いまの圧力が低くても、0.2 MPa になる温度が 35 度以下なら高圧ガス）は、
 * 読むだけでは腑に落ちにくい。
 *
 * 判定の根拠は法第 2 条（docs/primary-numbers.md §1）。
 * **圧力はゲージ圧力**で、圧縮アセチレンガスだけ温度 15 度で見る。
 */
export const widgetId = 'kouatsu-hantei';

type Kind = 'compressed' | 'acetylene' | 'liquefied';

export default function KouatsuHantei(): JSX.Element {
  const [kind, setKind] = useState<Kind>('compressed');
  /** 現にかかっているゲージ圧力（MPa） */
  const [now, setNow] = useState(0.5);
  /** 基準温度（圧縮・液化は 35 度、アセチレンは 15 度）に達したときのゲージ圧力（MPa） */
  const [atRef, setAtRef] = useState(1.2);
  /** 液化ガスで、圧力が 0.2 MPa になる温度（度） */
  const [t02, setT02] = useState(30);

  const refTemp = kind === 'acetylene' ? 15 : 35;
  const threshold = kind === 'compressed' ? 1.0 : 0.2;

  const byNow = now >= threshold;
  const byRef = atRef >= threshold;
  const byT02 = kind === 'liquefied' && t02 <= 35;
  const hit = kind === 'liquefied' ? byNow || byT02 : byNow || byRef;

  const kindName =
    kind === 'compressed' ? '圧縮ガス（アセチレンを除く）' : kind === 'acetylene' ? '圧縮アセチレンガス' : '液化ガス';
  /**
   * ★ 当たらないほうを言い切らないこと。
   * ここで見ているのは法 2 条の第一号から第三号までで、**第四号（政令で定める液化ガス）を見ていない。**
   * 第四号は、温度 35 度で圧力が 0 パスカルを超えるものが対象なので、
   * 第三号を外れても、なお高圧ガスに当たることがある。
   */
  const goNumber = kind === 'compressed' ? '第一号' : kind === 'acetylene' ? '第二号' : '第三号';

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">高圧ガスに当たるか</span>
      </div>
      <p className="widget-lead">
        法第 2 条は、ガスの状態ごとに別々の条件を置いています。ここでいう圧力は<strong>ゲージ圧力</strong>です。
        ここで見るのは<strong>第一号から第三号まで</strong>で、第四号（政令で定める液化ガス）は扱いません。
      </p>

      <div className="widget-grid">
        {(['compressed', 'acetylene', 'liquefied'] as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`widget-card ${kind === k ? 'on' : 'off'}`}
            onClick={() => setKind(k)}
          >
            <span>
              {k === 'compressed' ? '圧縮ガス' : k === 'acetylene' ? '圧縮アセチレン' : '液化ガス'}
            </span>
            <span className="widget-state">
              {k === 'compressed' ? '1 MPa / 35 度' : k === 'acetylene' ? '0.2 MPa / 15 度' : '0.2 MPa / 35 度'}
            </span>
          </button>
        ))}
      </div>

      <label className="widget-slider">
        <span>現にかかっている圧力</span>
        <input
          type="range"
          min={0}
          max={2}
          step={0.05}
          value={now}
          onChange={(e) => setNow(Number(e.target.value))}
        />
        <span>{now.toFixed(2)} MPa</span>
      </label>

      {kind === 'liquefied' ? (
        <label className="widget-slider">
          <span>圧力が 0.2 MPa になる温度</span>
          <input
            type="range"
            min={-50}
            max={80}
            step={1}
            value={t02}
            onChange={(e) => setT02(Number(e.target.value))}
          />
          <span>{t02} 度</span>
        </label>
      ) : (
        <label className="widget-slider">
          <span>温度 {refTemp} 度での圧力</span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={atRef}
            onChange={(e) => setAtRef(Number(e.target.value))}
          />
          <span>{atRef.toFixed(2)} MPa</span>
        </label>
      )}

      <div className={`widget-result ${hit ? 'tone-danger' : 'tone-safe'}`}>
        {hit ? `法第 2 条${goNumber}の高圧ガスに当たります` : `法第 2 条${goNumber}の条件には当たりません`}
      </div>

      <ul className="widget-list">
        <li className={byNow ? 'passed' : ''}>
          現にその圧力が {threshold.toFixed(1)} MPa 以上か … {byNow ? '当たる' : '当たらない'}
        </li>
        {kind === 'liquefied' ? (
          <li className={byT02 ? 'passed' : ''}>
            圧力が 0.2 MPa となる温度が 35 度以下か … {byT02 ? '当たる' : '当たらない'}
          </li>
        ) : (
          <li className={byRef ? 'passed' : ''}>
            温度 {refTemp} 度で {threshold.toFixed(1)} MPa 以上となるか … {byRef ? '当たる' : '当たらない'}
          </li>
        )}
      </ul>

      <p className="widget-note">
        {kindName}の条件です。
        {kind === 'liquefied'
          ? '★ 現在の圧力を 0.1 MPa まで下げても、0.2 MPa になる温度が 35 度以下なら高圧ガスのままです。現場の「圧力が高いガス」という感覚と、ここでずれます。なお、この号を外れても、第四号（政令で定める液化ガス。温度 35 度で圧力が 0 パスカルを超えるもの）に当たることがあります。'
          : kind === 'acetylene'
            ? '★ 温度が 35 度ではなく 15 度である点だけが、ほかの号と違います。'
            : '★ 圧縮アセチレンガスは、この号から除かれて第二号で別に定められています。'}
      </p>
    </div>
  );
}
