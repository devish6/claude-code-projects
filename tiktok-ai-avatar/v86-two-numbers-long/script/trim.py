# Trim edge silence from each raw VO line and speed it up 8% (pitch kept). Runs before timeline.py, which reads vo/trim/.
import json, subprocess
TEMPO = 1.08  # owner 10-30: "a tad faster so the audience stays"
for s in json.load(open("script/segments.json")):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"vo/{s['id']}.wav", "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,"
                    f"atempo={TEMPO},aresample=48000", "-ac", "1", f"vo/trim/{s['id']}.wav"], check=True)
print("trimmed at", TEMPO)
