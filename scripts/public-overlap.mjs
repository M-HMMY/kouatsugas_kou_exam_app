// 公開問題の文面と、src/ の文字列の「長い一致」を全部挙げる。
//
//   node scripts/public-overlap.mjs          # 保安管理技術・学識・記述式解答例と比べる
//   node scripts/public-overlap.mjs law      # 法令の冊子も比べる（条文の文言が大量に出る）
//   node scripts/public-overlap.mjs 20       # 20 字以上だけ（既定 15）
//
// ★ なぜ要るか（2026 年 9 月 30 日）
//   公開問題は KHK の著作物で、CLAUDE.md の「公開のルール」は「原文のまま収録しない」。
//   それなのに、確認問題・教本・用語辞典に**原文とほぼ同じ文が 8 テーマ分**入ったまま公開していた。
//   codex に原文と突き合わせてもらって見つかったが、**機械で比べると codex の見落としも出た**
//   （逃し弁の出口配管 45 字、HAZOP のガイドワード 43 字、入門編が学識の問題文を 78 字そのまま引用、など）。
//   読み返しでは見つからない型なので、道具にした。
//
// ★ npm run check には入れていない。KHK から PDF を取ってくる（外部通信が要る）ため。
//   PDF とテキストは node_modules/.cache/public-questions/ に置く。**リポジトリには入れないこと。**
//   テキスト化に pdftotext（Git for Windows なら同梱）を使う。
//
// ★ 読み方
//   1 列目が一致した文字数（空白・かっこ・句読点のゆれを落として数える）。
//   設問の定型（「次のイ、ロ、ハ、ニの記述のうち」「正しいものはどれか」）は落としてある。
//   **残してよいのは、技術用語＋助詞だけの一致と、法令の条文の文言だけ**（法令は著作権の対象外）。
//   **15 字未満に刻んだだけで、条件の並べ方が原文のままなら、書き直したことにならない。**
//   原文を横に置いて確かめること。
//
// ★ 年度が変わったら FILES に足すこと。
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE = 'https://www.khk.or.jp/Portals/0/khk/exam/';
const FILES = [
  { path: '2025/1110/R7ACAY-W.pdf', label: 'R7 甲化 保安', law: false },
  { path: '2025/1110/R7ACEY-W.pdf', label: 'R7 甲機 保安', law: false },
  { path: '2025/1110/R7ACAZ-W.pdf', label: 'R7 甲化 学識', law: false },
  { path: '2025/1110/R7ACEZ-W.pdf', label: 'R7 甲機 学識', law: false },
  { path: '2025/1219/R7fy_kaitourei_1.pdf', label: 'R7 解答例 甲化', law: false },
  { path: '2025/1219/R7fy_kaitourei_2.pdf', label: 'R7 解答例 甲機', law: false },
  { path: '2025/1110/R7ACAX-W.pdf', label: 'R7 甲化 法令', law: true },
  { path: '2025/1110/R7ACEX-W.pdf', label: 'R7 甲機 法令', law: true },
];

const args = process.argv.slice(2);
const withLaw = args.includes('law');
const MIN = Number(args.find((a) => /^\d+$/.test(a)) ?? 15);
const K = 10;

const CACHE = 'node_modules/.cache/public-questions';
mkdirSync(CACHE, { recursive: true });

async function load(f) {
  const name = f.path.split('/').pop().replace(/\.pdf$/, '');
  const pdf = join(CACHE, name + '.pdf');
  const txt = join(CACHE, name + '.txt');
  if (!existsSync(txt)) {
    if (!existsSync(pdf)) {
      const res = await fetch(BASE + f.path);
      if (!res.ok) throw new Error(`${f.path}: HTTP ${res.status}`);
      writeFileSync(pdf, Buffer.from(await res.arrayBuffer()));
    }
    try {
      execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', pdf, txt]);
    } catch {
      throw new Error('pdftotext が見つかりません（Git for Windows の mingw64/bin にあります）');
    }
  }
  return readFileSync(txt, 'utf8');
}

// 空白・かっこ・句読点のゆれを落とし、全角英数を半角にそろえる
function norm(s) {
  return s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]/g, '')
    .replace(/[、，,]/g, '、')
    .replace(/[。．]/g, '。')
    .replace(/[「」『』（）()]/g, '');
}

// 設問の定型。形式であって表現ではない
const BOILERPLATE = /記述のうち|正しいものはどれか/;

const pub = [];
for (const f of FILES) {
  if (f.law && !withLaw) continue;
  pub.push({ label: f.label, t: norm(await load(f)) });
}

const index = new Map();
for (const p of pub) {
  for (let i = 0; i + K <= p.t.length; i++) {
    const g = p.t.slice(i, i + K);
    let list = index.get(g);
    if (!list) index.set(g, (list = []));
    list.push([p, i]);
  }
}

function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

const hits = [];
for (const file of walk('src')) {
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, li) => {
      const t = norm(line);
      let i = 0;
      while (i + K <= t.length) {
        const cand = index.get(t.slice(i, i + K));
        if (!cand) {
          i++;
          continue;
        }
        let best = 0;
        let src = null;
        for (const [p, j] of cand) {
          let L = K;
          while (i + L < t.length && j + L < p.t.length && t[i + L] === p.t[j + L]) L++;
          if (L > best) [best, src] = [L, p];
        }
        const text = t.slice(i, i + best);
        if (best >= MIN && !BOILERPLATE.test(text)) {
          hits.push({ where: `${file.replace(/\\/g, '/')}:${li + 1}`, len: best, text, src: src.label });
        }
        i += Math.max(1, best);
      }
    });
}

hits.sort((a, b) => b.len - a.len || a.where.localeCompare(b.where));
for (const h of hits) console.log(`${String(h.len).padStart(3)}  ${h.where}  [${h.src}]  ${h.text}`);
console.log(`--- 公開問題との ${MIN} 字以上の一致: ${hits.length} 件${withLaw ? '（法令の冊子を含む）' : ''}`);
