#include<map>
#include"./dto/DTOs.hpp"
#include <cstdlib>
//前一个int代表直播间id,后一个int代表管理该直播间直播流(ffmpeg运行的进程)的进程号
extern std::map<int, int> LivestreamPid;

//函数1:根据直播间id,回放id,开启一个新的进程并使用ffmpeg监听一个推流链接(需要回放id),并将进程号记录在LivingstreamPid(需要直播间id)
//不返回信息,直接传StartLivingDto的引用然后修改
//推流链接:
void start_ffmpeg(int64_t living_id, int64_t playback_id);

//函数2:根据直播间id,从LivestreamPid中找到直播间对应的ffmpeg运行进程,向直播间id对应的进程发送信号以停止ffmpeg进程
void end_ffmpeg(int64_t living_id);
