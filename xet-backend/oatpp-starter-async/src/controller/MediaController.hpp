#ifndef MediaController_hpp
#define MediaController_hpp

#include "../hls/Playlist.hpp"
#include "../Utils.hpp"

#include "oatpp/web/server/api/ApiController.hpp"
#include "oatpp/web/protocol/http/outgoing/StreamingBody.hpp"
#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/macro/component.hpp"

#include <unordered_map>

/**
 *  示例 ApiController
 *  创建 ENDPOINT 的基本示例
 *  更多详情请访问 oatpp.io
 */
class MediaController : public oatpp::web::server::api::ApiController {
public:
  typedef MediaController __ControllerType;
private:
  OATPP_COMPONENT(std::shared_ptr<StaticFilesManager>, staticFileManager);
  OATPP_COMPONENT(std::shared_ptr<Playlist>, livePlaylist);
private:
  std::shared_ptr<OutgoingResponse> getStaticFileResponse(const oatpp::String& filename, const oatpp::String& rangeHeader) const;
  std::shared_ptr<OutgoingResponse> getFullFileResponse(const oatpp::String& file) const;
  std::shared_ptr<OutgoingResponse> getRangeResponse(const oatpp::String& rangeStr, const oatpp::String& file) const;
public:
  MediaController(const std::shared_ptr<ObjectMapper>& objectMapper)
    : oatpp::web::server::api::ApiController(objectMapper)
  {}
public:

  /**
   *  在此处注入 @objectMapper 组件作为默认参数
   */
  static std::shared_ptr<MediaController> createShared(OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper)){
    return std::shared_ptr<MediaController>(std::make_shared<MediaController>(objectMapper));
  }
  
/**
 *  开始生成 ENDPOINT（'ApiController' 代码生成）
 */
#include OATPP_CODEGEN_BEGIN(ApiController)
  
  
  /**
   * index.html 端点
   作用：读取
   */
  ENDPOINT_ASYNC("GET", "/", Root) {
    
    ENDPOINT_ASYNC_INIT(Root)
    
    const char* pageTemplate =
    "<html lang='en'>"
      "<head>"
        "<meta charset=utf-8/>"
      "</head>"
      "<body>"
        "<p>Hello Asynchronous Media-Stream!</p>"
        "<a href='media/live'>View Live Stream</a></br>"
        "<a href='video/video1.mp4'>Play video1.mp4</a></br>"
        "<a href='video/video2.mp4'>Play video2.mp4</a>"
        "<p>"
          "Note:""</br>"
          "Http Live Streaming is supported only in Safari browser.""</br>"
          "You can also use VLC player to play this stream."
        "</p>"
      "</body>"
    "</html>";
    
    Action act() override {
      return _return(controller->createResponse(Status::CODE_200, pageTemplate));
    }
    
  };
  
  /**
   *  VideoPage.html 端点
   */
  ENDPOINT_ASYNC("GET", "video/*", Video) {
    
    ENDPOINT_ASYNC_INIT(Video)
    
    const char* pageTemplate =
    "<html lang='en'>"
      "<head>"
        "<meta charset=utf-8/>"
      "</head>"
      "<body>"
        "<div id='player'>"
          "<p>%s</p>"
          "<video width='640' height='400' controls>"
            "<source src='/media/%s' type='%s'>"
          "</video>"
        "</div>"
      "</body>"
    "</html>";
    
    Action act() override {
      auto filename = request->getPathTail();
      OATPP_ASSERT_HTTP(filename, Status::CODE_400, "Filename is empty");
      auto mime = controller->staticFileManager->guessMimeType(filename);
      OATPP_ASSERT_HTTP(mime, Status::CODE_500, "Unable to guess MIME type of the file");
      auto file = controller->staticFileManager->getFile(request->getPathTail());
      OATPP_ASSERT_HTTP(file.get() != nullptr, Status::CODE_404, "File not found");
      auto page = formatText(pageTemplate, filename->c_str(), filename->c_str(), mime->c_str());
      return _return(controller->createResponse(Status::CODE_200, page));
    }
    
  };
  
  /**
   *  直播流播放列表端点
   */
  ENDPOINT_ASYNC("GET", "media/live", Live) {
    
    ENDPOINT_ASYNC_INIT(Live)
    
    static v_int64 getTime0(){
      static v_int64 time0 = getMillisTickCount();
      return time0;
    }
    
    Action act() override {
      v_int64 time = getMillisTickCount() - getTime0();
      auto response = controller->createResponse(Status::CODE_200, controller->livePlaylist->generateForTime(time, 5)->toString());
      response->putHeader("Accept-Ranges", "bytes");
      response->putHeader(Header::CONNECTION, Header::Value::CONNECTION_KEEP_ALIVE);
      response->putHeader(Header::CONTENT_TYPE, "application/x-mpegURL");
      return _return(response);
    }
    
  };
  
  /**
   *  支持 Range 请求的媒体文件下载端点
   */
  ENDPOINT_ASYNC("GET", "media/*", Static) {
    
    ENDPOINT_ASYNC_INIT(Static)
    
    Action act() override {

      auto filename = request->getPathTail();
      OATPP_ASSERT_HTTP(filename, Status::CODE_400, "Filename is empty");

      auto range = request->getHeader(Header::RANGE);
      
      return _return(controller->getStaticFileResponse(filename, range));

    }
    
  };

/**
 *  结束生成 ENDPOINT（'ApiController' 代码生成）
 */
#include OATPP_CODEGEN_END(ApiController)
  
};

#endif /* MediaController_hpp */