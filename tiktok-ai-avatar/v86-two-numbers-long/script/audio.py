# Audio stems for V86: normalized VO lines, full VO guide, looped bed ducked under the VO, SFX cue list.
import json, subprocess, os
LIB = os.path.expanduser("~/Desktop/Claude Code Projects/tiktok-ai-avatar/public/elevenlabs-library")
T = json.load(open("script/timeline.json")); total = T["total"]
run = lambda *a: subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
os.makedirs("vo/norm", exist_ok=True); os.makedirs("assets", exist_ok=True)
for s in T["segments"]:
    run("-i", f"vo/trim/{s['id']}.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000", "-ac", "1", f"vo/norm/{s['id']}.wav")
# full VO guide (sidechain key + reference mix)
ins, f = [], []
for i, s in enumerate(T["segments"]):
    ins += ["-i", f"vo/norm/{s['id']}.wav"]; d = int(s["start"] * 1000); f.append(f"[{i}]adelay={d}|{d}[a{i}]")
n = len(T["segments"])
run(*ins, "-filter_complex", ";".join(f) + ";" + "".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad,atrim=0:{total}[o]", "-map", "[o]", "-ar", "48000", "-ac", "1", "assets/vo_full.wav")
# bed: Glass_Cosmos looped with 2s crossfades, to length, then ducked by the VO
bed = f"{LIB}/music/Glass_Cosmos.mp3"; k = 16
ins = sum([["-i", bed] for _ in range(k)], [])
chain, last = [], "[0]"
for i in range(1, k):
    chain.append(f"{last}[{i}]acrossfade=d=2:c1=tri:c2=tri[x{i}]"); last = f"[x{i}]"
run(*ins, "-filter_complex", ";".join(chain) + f";{last}atrim=0:{total},afade=t=out:st={total-3}:d=3,aresample=48000[o]", "-map", "[o]", "-ac", "2", "assets/bed_loop.wav")
run("-i", "assets/bed_loop.wav", "-i", "assets/vo_full.wav", "-filter_complex",
    "[0]loudnorm=I=-20:TP=-3,aresample=48000[b];[1]aresample=48000,asplit=1[k];[b][k]sidechaincompress=threshold=0.015:ratio=3:attack=30:release=600:makeup=1[o]",
    "-map", "[o]", "-ar", "48000", "-ac", "2", "assets/bed_ducked.wav")
# SFX cues (seconds on the master timeline)
S = {x["id"]: x for x in T["segments"]}
cues = [{"f": f"{LIB}/sfx/Cinematic_whoosh_tra_take1.mp3", "t": c["card"][0], "name": "whoosh"} for c in T["chapters"] if c["card"]]
cues += [{"f": f"{LIB}/sfx/Large_temple_bell_st_take2.mp3", "t": S[i]["start"] + fr * S[i]["dur"] + 0.2, "name": "bell"} for i, fr in (("c2b", .8), ("c3b", .9), ("c4k", .55))]
cues += [{"f": f"{LIB}/sfx/Single_sheet_of_pape_take1.mp3", "t": S["c6d"]["start"] + .1 * S["c6d"]["dur"] + 0.2, "name": "paper"}]
for c in cues:
    c["out"] = f"assets/sfx_{c['name']}.wav"
    if not os.path.exists(c["out"]): run("-i", c["f"], "-af", "loudnorm=I=-24:TP=-3,aresample=48000", "-ac", "2", c["out"])
json.dump(cues, open("script/sfx_cues.json", "w"), indent=1)
print("ok", len(cues), "sfx cues")
