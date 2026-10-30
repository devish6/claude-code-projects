#!/bin/bash
# LOOK: frames from the FINAL export every 20s + 1s after each chapter marker + 1.6s into each card, as contact sheets of 12.
set -e; cd "$(dirname "$0")/.."; V=V86.mp4; rm -rf frames/look; mkdir -p frames/look
TIMES=$(python3 -c "
import json;t=json.load(open('script/timeline.json'))
ts=set(range(0,int(t['total']),20))|{round(c['start']+1,1) for c in t['chapters']}|{round(c['card'][0]+1.6,1) for c in t['chapters'] if c['card']}
print(' '.join(str(x) for x in sorted(ts)))")
i=0; for t in $TIMES; do ffmpeg -v error -y -ss $t -i $V -frames:v 1 -vf "scale=480:-1" frames/look/$(printf %03d $i).png; i=$((i+1)); done
n=0; for s in $(seq 0 12 $((i-1))); do ins=""; c=0; for k in $(seq $s $((s+11))); do [ -f frames/look/$(printf %03d $k).png ] && ins="$ins -i frames/look/$(printf %03d $k).png" && c=$((c+1)); done
  L=$(python3 -c "print('|'.join(f'{(j%4)*480}_{(j//4)*270}' for j in range($c)))"); ffmpeg -v error -y $ins -filter_complex "xstack=inputs=$c:layout=$L:fill=black" frames/look/sheet$n.png; n=$((n+1)); done
echo "$i frames, $n sheets"
