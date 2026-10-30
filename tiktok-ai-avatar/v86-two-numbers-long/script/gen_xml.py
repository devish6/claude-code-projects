# Write the V86 FilmCraft timeline as FCP 7 XML (xmeml v4): V1 Hyperframes picture, V2 EffectCraft chapter cards,
# A1 voice lines, A2 ducked bed, A3 SFX, one sequence marker per chapter. FilmCraft imports it via File > Import.
import json, os, math, subprocess
from urllib.parse import quote
from xml.sax.saxutils import escape
ROOT = os.getcwd(); FPS = 30
T = json.load(open("script/timeline.json")); CUES = json.load(open("script/sfx_cues.json"))
TOTAL = math.ceil(T["total"] * FPS)
fr = lambda s: int(round(s * FPS))
dur = lambda p: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
rate = f"<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>"
ids = {"clip": 0, "file": 0}; files = {}
def file_el(path, kind):
    path = os.path.abspath(path)
    if path in files: return f'<file id="{files[path]}"/>'
    ids["file"] += 1; fid = f"file-{ids['file']}"; files[path] = fid
    n = fr(dur(path))
    media = ("<video><samplecharacteristics><width>1920</width><height>1080</height></samplecharacteristics></video>" if kind == "video"
             else "<audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio>")
    return (f'<file id="{fid}"><name>{escape(os.path.basename(path))}</name><pathurl>file://localhost{quote(path)}</pathurl>{rate}'
            f"<duration>{n}</duration><media>{media}</media></file>")
def clip(path, kind, start, length, src_in=0, level=None, name=None):
    ids["clip"] += 1
    lvl = ""
    if level is not None:
        lvl = ("<filter><effect><name>Audio Levels</name><effectid>audiolevels</effectid><effectcategory>audiolevels</effectcategory>"
               f"<effecttype>audiolevels</effecttype><mediatype>audio</mediatype><parameter><parameterid>level</parameterid><name>Level</name>"
               f"<valuemin>0</valuemin><valuemax>3.98109</valuemax><value>{level}</value></parameter></effect></filter>")
    st = "<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>" if kind == "audio" else ""
    return (f'<clipitem id="clipitem-{ids["clip"]}"><name>{escape(name or os.path.basename(path))}</name><enabled>TRUE</enabled>'
            f"<duration>{fr(dur(path))}</duration>{rate}<start>{start}</start><end>{start + length}</end><in>{src_in}</in><out>{src_in + length}</out>"
            f"{file_el(path, kind)}{st}{lvl}</clipitem>")
track = lambda items: "<track>" + "".join(items) + "<enabled>TRUE</enabled><locked>FALSE</locked></track>"

v1 = [clip("graphics/V86-v1.mp4", "video", 0, TOTAL, name="V86 picture (Hyperframes)")]
v2 = []
for i, c in enumerate(T["chapters"]):
    if c["card"]:
        n = f"{i + 1:02d}"; a, b = fr(c["card"][0]), fr(c["card"][1])
        v2.append(clip(f"graphics/card-{n}.mp4", "video", a, b - a, name=f"Chapter card {n} (EffectCraft)"))
a1, prev = [], -1
for s in T["segments"]:
    p = f"vo/norm/{s['id']}.wav"; a = max(fr(s["start"]), prev); n = math.floor(dur(p) * FPS)
    a1.append(clip(p, "audio", a, n, name=f"VO {s['id']}")); prev = a + n
a2 = [clip("assets/bed_ducked.wav", "audio", 0, min(TOTAL, math.floor(dur("assets/bed_ducked.wav") * FPS)), name="Bed Glass_Cosmos (ducked)")]
a3 = []
for c in sorted(CUES, key=lambda c: c["t"]):
    n = math.floor(dur(c["out"]) * FPS) - 1
    a3.append(clip(c["out"], "audio", fr(c["t"]), n, level=0.5, name=f"SFX {c['name']}"))
markers = "".join(f"<marker><comment></comment><name>{escape(c['title'])}</name><in>{fr(c['start'])}</in><out>-1</out><color>Mango</color></marker>" for c in T["chapters"])
xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><sequence id="sequence-1"><name>V86 Two Numbers (YouTube long)</name>'
       f"<duration>{TOTAL}</duration>{rate}<timecode>{rate}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>"
       "<media><video><format><samplecharacteristics>" + rate + "<width>1920</width><height>1080</height><anamorphic>FALSE</anamorphic>"
       "<pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></format>"
       + track(v1) + track(v2) + "</video><audio><format><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics></format>"
       + track(a1) + track(a2) + track(a3) + "</audio></media>" + markers + "</sequence></xmeml>\n")
open("V86-timeline.xml", "w").write(xml)
print("frames", TOTAL, "| V2 cards", len(v2), "| A1 vo", len(a1), "| A3 sfx", len(a3))
