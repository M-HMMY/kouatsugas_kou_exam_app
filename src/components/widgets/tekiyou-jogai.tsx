import { useState, type JSX } from 'react';

/**
 * 内容積 1 デシリットル以下の容器について、どの条が適用されないかを見る。
 *
 * 法第 3 条第 2 項が列挙しているのは、**第 40 条から第 56 条の 2 の 2 まで、
 * 第 60 条、第 61 条から第 63 条まで**（docs/primary-numbers.md §2）。
 * 「第 4 章だけ」と覚えていると、第 5 章の帳簿や事故届が抜ける。
 *
 * 条番号を動かして、除外の範囲が飛び飛びであることを目で確かめる作り。
 */
export const widgetId = 'tekiyou-jogai';

/** 代表的な条と、その内容 */
const ARTICLES: { no: number; name: string }[] = [
  { no: 5, name: '製造の許可・届出' },
  { no: 16, name: '貯蔵所（第一種）' },
  { no: 20, name: '完成検査' },
  { no: 26, name: '危害予防規程' },
  { no: 35, name: '保安検査' },
  { no: 44, name: '容器検査' },
  { no: 45, name: '刻印等' },
  { no: 46, name: '表示' },
  { no: 48, name: '充塡' },
  { no: 49, name: '容器再検査' },
  { no: 56, name: 'くず化その他の処分' },
  { no: 60, name: '帳簿' },
  { no: 61, name: '報告の徴収' },
  { no: 62, name: '立入検査' },
  { no: 63, name: '事故届' },
];

/** 法第 3 条第 2 項が列挙している範囲かどうか */
function excluded(no: number): boolean {
  if (no >= 40 && no <= 56) return true; // 第 56 条の 2 の 2 まで
  if (no === 60) return true;
  if (no >= 61 && no <= 63) return true;
  return false;
}

export default function TekiyouJogai(): JSX.Element {
  const [on, setOn] = useState(true);

  const hidden = ARTICLES.filter((a) => excluded(a.no));

  return (
    <div className="widget-body">
      <div className="widget-head">
        <span className="widget-title">内容積 1 デシリットル以下の容器</span>
      </div>
      <p className="widget-lead">
        法第 3 条第 2 項は、内容積 1 デシリットル以下の容器と、密閉しないで用いられる容器について、
        <strong>列挙した条だけ</strong>を適用しないとしています。法律全体が外れるわけではありません。
      </p>

      <label className="widget-slider">
        <span>1 デシリットル以下として扱う</span>
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span>{on ? '適用除外を効かせる' : '通常の容器として見る'}</span>
      </label>

      <table className="widget-table">
        <thead>
          <tr>
            <th>条</th>
            <th>内容</th>
            <th>第 3 条第 2 項</th>
          </tr>
        </thead>
        <tbody>
          {ARTICLES.map((a) => {
            const off = on && excluded(a.no);
            return (
              <tr key={a.no}>
                <td>第 {a.no} 条</td>
                <td>{a.name}</td>
                <td className={off ? 'miss' : 'hit'}>{off ? 'この項で除外' : '除外されない'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="widget-result tone-warn">
        {/*
          ★ この件数は「この表に挙げた代表例のうち」の件数。法律全体の除外条数ではない。
          実際の範囲は第 40 条から第 56 条の 2 の 2 まで、第 60 条、第 61 条から第 63 条まで。
        */}
        この表の代表例のうち、適用されないのは {on ? hidden.length : 0} 件。
        残りはこの項では除外されていません
      </div>

      <p className="widget-note">
        ★ 列挙されているのは<strong>第 40 条から第 56 条の 2 の 2 まで</strong>（第 4 章 容器等）と、
        <strong>第 60 条、第 61 条から第 63 条まで</strong>（第 5 章 雑則の一部）です。
        帳簿と事故届が入っているので、「第 4 章だけ」と覚えると外します。
        製造の許可も貯蔵所も保安検査も、この除外には入っていません。
        <strong>表に出しているのは代表例だけ</strong>で、除外される条はこれより多くあります。
        また、除外されない条がそのまま適用になるかどうかは、その条自身の条件で決まります。
      </p>
    </div>
  );
}
