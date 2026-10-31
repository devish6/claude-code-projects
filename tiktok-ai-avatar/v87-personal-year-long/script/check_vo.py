# Whisper every VO segment and compare word for word with segments.json. Usage: python3 check_vo.py [ids...]
import json, sys, subprocess, pathlib, re, tempfile
here = pathlib.Path(__file__).parent
segs = json.load(open(here / "segments.json"))
M = str(pathlib.Path.home() / ".numevix-publish/whisper-models/ggml-medium.bin")
NUM = {"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine","11":"eleven","14":"fourteen","22":"twenty-two","29":"twenty-ninth","30":"thirty","33":"thirty-three","38":"thirty-eight"}
def norm(s):
    s = s.lower().replace("numevix.com/try", "numevix dot com slash try").replace("numavix", "numevix")
    s = re.sub(r"[^a-z0-9' ]+", " ", s.replace("-", " "))
    return [w for w in s.split() if w]
want = set(sys.argv[1:]); out = {}
for s in segs:
    if want and s["id"] not in want: continue
    wav = here.parent / "vo" / f"{s['id']}.wav"
    t16 = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ar", "16000", "-ac", "1", t16], check=True)
    heard = subprocess.run(["whisper-cli", "-m", M, "-f", t16, "-nt", "-np", "--prompt", "Moolank, Bhagyank, Vedic, Rahu, Ketu, numevix"], capture_output=True, text=True).stdout.strip()
    a, b = norm(s["text"]), norm(heard)
    ok = a == b
    dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(wav)],capture_output=True,text=True).stdout)
    out[s["id"]] = {"ok": ok, "heard": heard, "dur": dur}
    print(("OK  " if ok else "DIFF"), s["id"], f"{dur:.1f}s", "" if ok else f"\n   want: {' '.join(a)}\n   got:  {' '.join(b)}", flush=True)
json.dump(out, open(here / "vo_check.json", "w"), indent=1)
