import { useState, type JSX } from 'react';
import { Widget, widgetIds } from '../components/Widget';
import { navigate } from '../lib/router';

/**
 * 体験ツール（対話ウィジェット）の一覧。教本の該当箇所にも同じものが埋め込まれている。
 *
 * ここに並べた id は、`src/components/widgets/<id>.tsx` を作れば自動で有効になる
 * （`Widget.tsx` がファイルを走査して登録する）。まだ書いていない id は表示されない。
 * つまり**この一覧は「作りたいものの計画表」も兼ねている。まだ 1 つも作っていない。**
 *
 * **先頭のグループを 1 つも実装しないまま置かないこと。**姉妹アプリでは、
 * 既定で開くグループが空で「この分類のツールはまだ用意されていません」だけの
 * 画面になる不具合が出た（下の `firstFilled` はその回避）。
 *
 * 並びは `docs/section-plan.md` の章立てに合わせてある。
 * **数値を動かすと結論が変わるところ**を選ぶこと（読めば分かるものはウィジェットにしない）。
 */
const GROUPS: { name: string; note: string; ids: string[] }[] = [
  {
    name: '高圧ガスの定義',
    // 法の定義は「圧力と温度の組合せ」で決まる。**表で覚えるより動かしたほうが早い。**
    // 令和 7 年度の法令は問 1・問 2 がここだった。
    note: '圧力と温度を動かすと、そのガスが法でいう「高圧ガス」に当たるかどうかが変わります',
    ids: ['kouatsu-hantei', 'tekiyou-jogai'],
  },
  {
    name: '気体の状態',
    note: '状態方程式・密度・圧縮係数を、数値を動かして確かめます（学識の計算問題の型）',
    ids: ['joutai-houteishiki', 'assyuku-keisuu'],
  },
  {
    name: '燃焼と爆発',
    note: '爆発範囲・化学量論組成・理論空気量の関係を並べて見ます',
    ids: ['bakuhatsu-hani', 'riron-kuuki'],
  },
  {
    name: '圧力容器の強度',
    note: '内径・肉厚・内圧を動かすと、薄肉円筒胴の円周応力と軸応力がどう変わるかを見ます',
    ids: ['usuniku-ouryoku'],
  },
];

export function Tools(): JSX.Element {
  const [openGroup, setOpenGroup] = useState<string>(GROUPS[0].name);
  const known = new Set(GROUPS.flatMap((g) => g.ids));
  const others = widgetIds.filter((id) => !known.has(id));

  if (widgetIds.length === 0) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>体験ツール</h1>
          <p className="lead">
            文章だけでは掴みにくいところを、数値を動かして確かめるための道具です。教本の該当セクションにも同じものが埋め込まれます。
          </p>
        </header>
        <section className="section">
          <p className="hint">
            体験ツールはまだ 1 つも用意されていません。
            <code>src/components/widgets/</code> にファイルを追加すると、この画面と教本本文の両方で自動的に使えるようになります。
          </p>
        </section>
        <div className="read-actions">
          <button type="button" className="btn primary" onClick={() => navigate('textbook')}>
            教本を読む
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>体験ツール</h1>
        <p className="lead">
          文章だけでは掴みにくいところを、数値を動かして確かめるための道具です。教本の該当セクションにも同じものが埋め込まれています。
        </p>
      </header>

      <div className="chips">
        {GROUPS.map((g) => (
          <button
            key={g.name}
            type="button"
            className={`chip ${openGroup === g.name ? 'on' : ''}`}
            onClick={() => setOpenGroup(g.name)}
          >
            {g.name}（{g.ids.filter((id) => widgetIds.includes(id)).length}）
          </button>
        ))}
      </div>

      {GROUPS.filter((g) => g.name === openGroup).map((g) => {
        const ready = g.ids.filter((id) => widgetIds.includes(id));
        return (
          <section key={g.name} className="section">
            <h2>{g.name}</h2>
            <p className="hint">{g.note}</p>
            {ready.length === 0 && <p className="hint">この分類のツールはまだ用意されていません。</p>}
            {ready.map((id) => (
              <Widget key={id} id={id} />
            ))}
          </section>
        );
      })}

      {others.length > 0 && (
        <section className="section">
          <h2>その他</h2>
          {others.map((id) => (
            <Widget key={id} id={id} />
          ))}
        </section>
      )}
    </div>
  );
}
