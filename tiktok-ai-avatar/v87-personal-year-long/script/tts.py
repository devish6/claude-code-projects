# Generate one Chatterbox wav per segment through VoiceStudio (localhost:3900). Usage: python3 tts.py [ids...]
import json, sys, subprocess, pathlib
here = pathlib.Path(__file__).parent
segs = json.load(open(here / "segments.json"))
SAY = {"Bhagyank": "Bhaagyaank",  # Chatterbox says "banyan" otherwise
       "Moolank": "Moolahnk", "Vedic": "Vaydhick",
       "2027": "twenty twenty-seven", "2026": "twenty twenty-six",
       "LIVE50": "Live fifty"}  # owner picked "Live fifty" (10-31)  # owner picked sample C (10-30): not "mool-enk" / "ve-dick"
want = set(sys.argv[1:])
for s in segs:
    if want and s["id"] not in want: continue
    t = s["text"]
    for k, v in SAY.items(): t = t.replace(k, v)
    out = here.parent / "vo" / f"{s['id']}.wav"
    body = json.dumps({"model": "mlx-audio", "input": t, "voice": "demo0001", "response_format": "wav"})
    subprocess.run(["curl", "-s", "-m", "300", "-X", "POST", "localhost:3900/v1/audio/speech", "-H", "content-type: application/json", "-d", body, "-o", str(out)], check=True)
    print(s["id"], flush=True)
