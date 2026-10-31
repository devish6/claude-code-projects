# Lay out the V86 timeline from the trimmed VO: segment starts, chapter cards, chapter markers.
import json, subprocess
segs = json.load(open("script/segments.json"))
dur = lambda f: float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
GAP, CARD, LEAD, TAIL = 0.28, 2.2, 0.15, 5.0  # owner 10-30: "a tad faster so the audience stays" (was 0.45 / 3.0 / 0.25 / 6.0)
t, out, chapters, prev = LEAD, [], [], None
for s in segs:
    if s["ch"] != prev:
        if prev is not None:
            t += 0.2                                    # breath before the card
            chapters.append({"title": s["ch"], "start": round(t, 3), "card": [round(t, 3), round(t + CARD, 3)]})
            t += CARD + 0.1
        else:
            chapters.append({"title": s["ch"], "start": 0.0, "card": None})
        prev = s["ch"]
    d = dur(f"vo/trim/{s['id']}.wav")
    out.append({"id": s["id"], "ch": s["ch"], "start": round(t, 3), "dur": round(d, 3), "text": s["text"]})
    t += d + GAP
total = round(t - GAP + TAIL, 3)
json.dump({"total": total, "segments": out, "chapters": chapters}, open("script/timeline.json", "w"), indent=1)
print("total", total)
for c in chapters: print(f"{int(c['start']//60)}:{int(c['start']%60):02d}  {c['title']}")
