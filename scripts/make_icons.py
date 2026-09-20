# -*- coding: utf-8 -*-
"""アプリのアイコンを作る（外部ライブラリなし）。

    python scripts/make_icons.py

出力先は 2 か所ある。**用途が違うので、透過の扱いも違う。**

  public/icons/   … PWA 用（iPhone のホーム画面・Android・ブラウザのタブ）
                    **透過なしの正方形**で書き出す。iOS は apple-touch-icon の
                    透明な画素を黒で塗り潰すため、角を丸めた透過 PNG を渡すと
                    ホーム画面で角が黒くなる。**丸めるのは iOS 側の仕事**なので、
                    こちらは背景を全面に敷く。
  scripts/app.ico … Windows のデスクトップのショートカット用。
                    こちらは逆に、**角丸の外側を透過**にする（そういう約束なので）。

**色は姉妹アプリとぶつからないように選ぶこと。** デスクトップとホーム画面に
4 つ以上並ぶので、色が近いと見分けられない。現在の割り当ては次のとおり。

  fe_exam_app                紺 → 青    「FE」
  e_exam_app                 紺 → 青    「E」
  itpassport_exam_app        緑 → 青緑  「iP」
  g_exam_app                 紺 → 青    「G」
  genai_passport_exam_app    紫 → 藤色  「AI」
  kikenbutsu_otsu4_exam_app  朱 → 橙    「4」
  kikenbutsu_kou_exam_app    黒鉄 → 金  「A」
  kouatsugas_otsu_exam_app   深い青緑 → 水色  「HP」
  **このアプリ**           **深い赤紫 → マゼンタ**  **「甲」**

**★ 8 つめ（高圧ガス乙種）とは、色も字も分けること。**
同じ試験の別の級なので、**いちばん取り違えやすい 2 本**です。
向こうが「深い青緑 → 水色」に「HP」、こちらが「深い赤紫 → マゼンタ」に「甲」。

**字は漢字の「甲」にしてある。**字形は座標で書く述語なので曲線は置けますが、
**画数の多い漢字は 192 px では潰れます。**「甲」は
**箱（外枠）＋中の横棒＋下へ突き抜ける縦棒**の 6 本だけなので、32 px でも形が残ります。
（「HP」を使い回すと、ホーム画面で 8 つめと見分けられません。）

**色は、読み取れた姉妹アプリの値と必ず離す。**
紺 → 青（g）、紫 → 藤（genai）、朱 → 橙（乙 4）、黒鉄 → 金（危険物甲種）、
青緑 → 水色（高圧ガス乙種）が埋まっている。
**赤紫 → マゼンタはどれとも重ならない。**

Pillow は使わない（依存を増やさない方針）。PNG を自前で組み立て、
それを ICO のコンテナに詰めている。Windows 7 以降は PNG 入りの ICO を読める。
"""
import os
import struct
import zlib

# ---------------------------------------------------------------- 見た目の設定
# 背景は左上から右下へのグラデーション。8 つめ（乙種）の青緑と必ず離すこと。
BG_FROM = (74, 4, 78)        # 深い赤紫
BG_TO = (232, 74, 161)       # マゼンタ
FG = (255, 255, 255)         # 白い字
ACCENT = (253, 224, 71)      # 下線（赤紫の背景から浮くよう淡い黄）

RADIUS = 0.22                # 角の丸み（app.ico のみ。一辺を 1 としたときの半径）

# 「甲」の字形。一辺を 1 とした座標で書く。**箱 ＋ 中の横棒 ＋ 下へ突き抜ける縦棒。**
#
#   ┌───┬───┐        外枠（上・下・左・右の 4 本）
#   ├───┼───┤        中の横棒 1 本
#   └───┼───┘        縦棒は箱を上から下まで貫き、さらに下へ出る
#       │
STEM = 0.058                      # 線の太さ

BOX_X = (0.285, 0.715)            # 箱の左右
BOX_Y = (0.215, 0.520)            # 箱の上下
MID_Y = 0.338                     # 中の横棒の上端
TAIL_Y = 0.665                    # 縦棒の下端（箱の下から突き抜ける）
CENTER_X = 0.5 - STEM * 0.5       # 縦棒の左端

# 下線。Android の maskable（中央 80 % だけが安全域）に収まる位置に置く。
# ★ 「甲」は下に突き抜けるので、乙種版（0.715〜0.775）より下げてある。
UNDER_X = (0.25, 0.75)
UNDER_Y = (0.735, 0.790)

SS = 4                       # 拡大して描いてから縮める（なめらかにするため）


def inside_round_square(x, y):
    r = RADIUS
    cx = min(max(x, r), 1.0 - r)
    cy = min(max(y, r), 1.0 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def inside_glyph(x, y):
    """「甲」の中かどうか。箱の 4 辺 + 中の横棒 + 下へ突き抜ける縦棒。"""
    x0, x1 = BOX_X
    y0, y1 = BOX_Y

    # --- 縦棒（箱を貫き、下へ突き抜ける）。箱より縦に長いので先に見る ---
    if CENTER_X <= x <= CENTER_X + STEM and y0 <= y <= TAIL_Y:
        return True

    if y < y0 or y > y1 or x < x0 or x > x1:
        return False

    # --- 箱の左右 ---
    if x <= x0 + STEM or x >= x1 - STEM:
        return True
    # --- 箱の上下 ---
    if y <= y0 + STEM or y >= y1 - STEM:
        return True
    # --- 中の横棒 ---
    if MID_Y <= y <= MID_Y + STEM:
        return True

    return False


def inside_underline(x, y):
    return UNDER_X[0] <= x <= UNDER_X[1] and UNDER_Y[0] <= y <= UNDER_Y[1]


def background(x, y):
    """左上から右下へのグラデーション。"""
    t = (x + y) * 0.5
    return tuple(
        int(round(BG_FROM[i] + (BG_TO[i] - BG_FROM[i]) * t)) for i in range(3)
    )


def render(size, rounded):
    """size × size の RGBA 行のリストを返す。rounded=True なら角の外を透過にする。"""
    n = size * SS
    inv = 1.0 / n
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            bg_hits = 0
            fg_hits = 0
            ac_hits = 0
            for sy in range(SS):
                y = (py * SS + sy + 0.5) * inv
                for sx in range(SS):
                    x = (px * SS + sx + 0.5) * inv
                    if rounded and not inside_round_square(x, y):
                        continue
                    bg_hits += 1
                    if inside_glyph(x, y):
                        fg_hits += 1
                    elif inside_underline(x, y):
                        ac_hits += 1
            total = SS * SS
            if bg_hits == 0:
                row += b"\x00\x00\x00\x00"
                continue

            base = background((px + 0.5) / size, (py + 0.5) / size)
            # 背景がある範囲の中で、字と下線の割合ぶんだけ色を寄せる
            f = fg_hits / float(bg_hits)
            a = ac_hits / float(bg_hits)
            comp = []
            for i in range(3):
                v = base[i] * (1 - f - a) + FG[i] * f + ACCENT[i] * a
                comp.append(max(0, min(255, int(round(v)))))
            row += bytes(comp) + bytes((int(round(255 * bg_hits / float(total))),))
        rows.append(bytes(row))
    return rows


def chunk(tag, data):
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def png_bytes(size, rows, alpha):
    """alpha=False なら RGB（透過なし）で書き出す。iOS 向けはこちら。"""
    if alpha:
        raw = b"".join(b"\x00" + r for r in rows)
        ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    else:
        stripped = []
        for r in rows:
            out = bytearray()
            for i in range(0, len(r), 4):
                out += r[i : i + 3]
            stripped.append(bytes(out))
        raw = b"".join(b"\x00" + r for r in stripped)
        ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def build_ico(sizes, path, rounded):
    images = [(s, png_bytes(s, render(s, rounded), True)) for s in sizes]
    header = struct.pack("<HHH", 0, 1, len(images))
    entries = b""
    offset = 6 + 16 * len(images)
    for s, data in images:
        w = 0 if s >= 256 else s
        entries += struct.pack("<BBBBHHII", w, w, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
    with open(path, "wb") as f:
        f.write(header + entries + b"".join(d for _, d in images))
    return os.path.getsize(path)


def write_png(size, path, rounded, alpha):
    with open(path, "wb") as f:
        f.write(png_bytes(size, render(size, rounded), alpha))
    return os.path.getsize(path)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icons = os.path.join(root, "public", "icons")

    # PWA 用：透過なし・角も丸めない（iOS が自分で丸める）
    for size, name in ((180, "icon-180.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        path = os.path.join(icons, name)
        print("%-28s %6d bytes" % (name, write_png(size, path, False, False)))

    # ブラウザのタブ用の .ico（小さいので透過ありでよい）
    path = os.path.join(icons, "icon.ico")
    print("%-28s %6d bytes" % ("icon.ico", build_ico([16, 32, 48], path, False)))

    # Windows のショートカット用：角丸 + 外側は透過
    path = os.path.join(root, "scripts", "app.ico")
    print("%-28s %6d bytes" % ("scripts/app.ico", build_ico([16, 32, 48, 64, 128, 256], path, True)))


main()
