#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
离线抓取「汉典」(zdic.net) 生成小学常用字本地数据。
- 字表: tools/changyongzi-2500.txt（常用字 2500，码位）
- 每字字段: 拼音 / 部首 / 总笔画 / 部外笔画 / 释义 / 组词 / 发音音频
- 并发 + gzip + 断点续传
用法: python3 tools/fetch-zdic.py   （可反复运行续传）
"""
import os, re, json, gzip, time, urllib.request, urllib.parse, urllib.error
import concurrent.futures as cf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "chinese", "hanzi-dict.json")
CODES = os.path.join(ROOT, "tools", "changyongzi-2500.txt")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "Accept-Encoding": "gzip"}
WORKERS = int(os.environ.get("WORKERS", "6"))
LIMIT = int(os.environ.get("LIMIT", "0"))


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        if raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        return raw.decode("utf-8", "ignore")


def parse(h):
    def g(r):
        return r.group(1).strip() if r else ""
    # 拼音（title 列出多音，如“好 hǎo、hào - 汉典”）
    pinyin = []
    mt = re.search(r"<title>(.*?)-\s*汉典", h)
    if mt:
        rest = re.sub(r"^\s*[\u4e00-\u9fff]+\s*", "", mt.group(1))
        pinyin = [x.strip() for x in re.split(r"[、,，/\s]+", rest) if x.strip()]
    if not pinyin:
        mp = re.search(r'class="meta-pinyin">([^<]+)', h)
        if mp:
            pinyin = [mp.group(1).strip().split()[0]] if mp.group(1).strip() else []
    radical = g(re.search(r'class="meta-radical"[^>]*>([^<]+)</a>', h))
    strokes = g(re.search(r"总笔画</span>\s*<span class=\"meta-value\">(\d+)", h))
    radout = g(re.search(r"部外笔画[：:]\s*(\d+)", h))
    audio = g(re.search(r'data-audio="([^"]+)"', h))
    # 释义（基本解释 #jbjs）
    meaning = ""
    mm = re.search(r'<section class="dict-section" id="jbjs".*?>(.*?)</section>', h, re.S)
    if mm:
        seg = re.sub(r"<header.*?</header>", "", mm.group(1), flags=re.S)
        meaning = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", seg)).strip()
    # 组词（常用词组）
    words = []
    for w in re.findall(r'class="xxjs-cizu__word"[^>]*>([^<]+)</a>', h):
        w = w.strip()
        if w and w not in words:
            words.append(w)
    return {
        "pinyin": pinyin, "radical": radical, "strokes": strokes,
        "radicalOut": radout, "audio": audio, "meaning": meaning, "words": words[:20],
    }


def get_one(code):
    ch = chr(code)
    url = "https://www.zdic.net/hans/" + urllib.parse.quote(ch)
    for attempt in range(4):
        try:
            data = parse(fetch(url))
            if not (data["pinyin"] or data["radical"] or data["meaning"] or data["words"]):
                raise ValueError("empty")
            data["char"] = ch
            return code, data
        except urllib.error.HTTPError as e:
            time.sleep(0.8 * (attempt + 1))
        except Exception:
            time.sleep(0.5 * (attempt + 1))
    return code, None


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    existing = {}
    if os.path.exists(OUT):
        try:
            d = json.load(open(OUT, encoding="utf-8"))
            existing = {e["char"]: e for e in d.get("characters", [])}
        except Exception:
            existing = {}
    codes = [int(x) for x in open(CODES, encoding="utf-8").read().split() if x.strip()]
    print("字表: %d 字, 已有: %d" % (len(codes), len(existing)))
    todo = [c for c in codes if chr(c) not in existing]
    if LIMIT:
        todo = todo[:LIMIT]
    print("待抓: %d (workers=%d)" % (len(todo), WORKERS))

    done = dict(existing)
    t0 = time.time()
    n = 0
    with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for code, data in ex.map(get_one, todo):
            n += 1
            if data:
                done[data["char"]] = data
            if n % 50 == 0 or n == len(todo):
                ordered = [done[chr(c)] for c in codes if chr(c) in done]
                json.dump({"note": "由 tools/fetch-zdic.py 离线抓取自 zdic.net",
                           "characters": ordered},
                          open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
                print("进度 %d/%d  已存 %d 字  (%.1f 字/秒)" %
                      (n, len(todo), len(ordered), n / max(time.time() - t0, 1)))
    print("完成: %d 字" % len(done))


if __name__ == "__main__":
    main()
