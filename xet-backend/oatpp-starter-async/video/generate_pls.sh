#!/bin/sh

# 生成video1的m3u8播放列表以及ts播放片段
ffmpeg -y \
 -i video1.mp4 \
 -c:v mpeg2video -qscale:v 10 \
 -c:a mp2 -b:a 192k \
 -vf scale=720x496 \
 -f segment \
 -segment_time 10 \
 -segment_list "playlist1.m3u8" \
 -segment_list_type m3u8 \
 "z_video1_cuhunk_%d.ts"

