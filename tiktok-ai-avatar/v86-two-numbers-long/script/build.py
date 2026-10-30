# Inject timeline + engine numbers into script/template.html -> composition/index.html
import json
t = json.load(open("script/timeline.json")); n = json.load(open("script/numbers.json"))
data = {"total": t["total"], "segs": [{k: s[k] for k in ("id", "start", "dur")} for s in t["segments"]],
        "chapters": t["chapters"], "N": {k: n[k] for k in ("A", "B", "days", "layout", "planets")}}
html = open("script/template.html").read().replace("__DATA__", json.dumps(data)).replace("__TOTAL__", str(t["total"]))
open("composition/index.html", "w").write(html)
print("built", t["total"])
