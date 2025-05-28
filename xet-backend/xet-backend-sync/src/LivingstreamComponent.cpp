#include "LivingstreamComponent.hpp"
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <string>
#include <cstdlib>
#include <iostream>
#include <sys/prctl.h>
#include <signal.h>
#include <sys/stat.h>
#include <errno.h>

std::map<int, int> LivingstreamPid;

// 函数1:根据直播间id,回放id,开启一个新的进程并使用ffmpeg监听一个推流链接(需要回放id),并将进程号记录在LivingstreamPid(需要直播间id)
// 不返回信息,直接传StartLivingDto的引用然后修改
// 推流链接:
void start_ffmpeg(int64_t living_id, int64_t playback_id)
{
  // OBS推流地址
  std::string obs_rtmp_url = "rtmp://localhost:1935/live/"+ std::to_string(living_id);
  // 构造输出路径
  std::string hls_output_dir = "../../xet-backend-async/file/" + std::to_string(playback_id);
  // HLS分段时长
  int hls_time = 2;
  // 回放ID字符串
  std::string playback_id_str = std::to_string(playback_id);

  // m3u8文件名
  std::string m3u8_name = "playback" + playback_id_str + ".m3u8";
  // ts文件命名格式
  std::string ts_pattern = hls_output_dir + "/playlist_%03d.ts";

  // 拼接输出文件（m3u8）路径
  std::string m3u8_full_path = hls_output_dir + "/" + m3u8_name;

  // 拼接分片文件（ts）路径模式
  std::string ts_full_pattern = hls_output_dir + "/" + ts_pattern;
  if (mkdir(hls_output_dir.c_str(), 0755) == -1)
  {
    if (errno != EEXIST)
    {
      std::cerr << "Failed to create directory: " << hls_output_dir << std::endl;
      return;
    }
  }
  pid_t pid = fork();
  if (pid < 0)
  {
    std::cerr << "fork failed!" << std::endl;
    return;
  }
  if (pid == 0)
  {
    prctl(PR_SET_PDEATHSIG, SIGHUP);
    // 子进程
    execlp(
        "ffmpeg", "ffmpeg",
        "-i", obs_rtmp_url.c_str(),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-g", "60",
        "-c:a", "aac", "-b:a", "128k",
        "-f", "hls",
        "-hls_time", std::to_string(hls_time).c_str(),
        "-hls_list_size", "0",
        // 🚨🚨🚨 重点修改：移除 "-hls_path"，替换为完整路径
        "-hls_segment_filename", ts_full_pattern.c_str(),
        m3u8_full_path.c_str(),
        (char *)nullptr);
    // execlp失败
    std::cerr << "execlp ffmpeg failed!" << std::endl;
    exit(1);
  }
  else
  {
    // 父进程，记录子进程pid
    LivingstreamPid[living_id] = pid;
    std::cout << "Started ffmpeg process, pid=" << pid << " for living_id=" << living_id << std::endl;
  }
}

// 函数2:根据直播间id,从LivestreamPid中找到直播间对应的ffmpeg运行进程,向直播间id对应的进程发送信号以停止ffmpeg进程
void end_ffmpeg(int64_t living_id)
{
  auto it = LivingstreamPid.find(living_id);
  if (it != LivingstreamPid.end())
  {
    int pid = it->second;
    // 向子进程发送SIGTERM信号
    if (kill(pid, SIGTERM) == 0)
    {
      std::cout << "Sent SIGTERM to ffmpeg process, pid=" << pid << " for living_id=" << living_id << std::endl;
      // 可选: 等待子进程退出
      waitpid(pid, nullptr, 0);
      LivingstreamPid.erase(it);
    }
    else
    {
      std::cerr << "Failed to send SIGTERM to pid=" << pid << std::endl;
    }
  }
  else
  {
    std::cerr << "No ffmpeg process found for living_id=" << living_id << std::endl;
  }
}
