#ifndef UserController_hpp
#define UserController_hpp

#include "dto/DTOs.hpp"

#include "oatpp/web/server/api/ApiController.hpp"
#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/macro/component.hpp"

#include "oatpp/parser/json/mapping/ObjectMapper.hpp"
#include "service/Service.hpp"

#include <unistd.h> //usleep

#include "oatpp/core/async/CoroutineWaitList.hpp"
// #include "oatpp/core/async/Executor.hpp"
#include "oatpp/core/async/Coroutine.hpp"
/**
 * Codegen 开始
 * 是否是固定模板:是
 */
#include OATPP_CODEGEN_BEGIN(ApiController)

/**
 * 示例 API 控制器
 */
class LiveRoomController : public oatpp::web::server::api::ApiController
{
private:
public:
  /**
   * 带有对象映射器的构造函数
   * @param objectMapper - 用于序列化/反序列化 DTO 的默认对象映射器
   */
  LiveRoomController(OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper))
      : oatpp::web::server::api::ApiController(objectMapper)
  {
  }

public:
  static std::shared_ptr<LiveRoomController> createShared(
      OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper) // Inject objectMapper component here as default parameter
  )
  {
    return std::make_shared<LiveRoomController>(objectMapper);
  }

  Service service;

  ADD_CORS(UserGET)
  ENDPOINT("GET", "/user/{id}", UserGET, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.getUserById(id));
  };
  ADD_CORS(HomeGET)
  ENDPOINT("GET", "/home/{id}", HomeGET, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.getHomeById(id));
  };
  ADD_CORS(LivePlaybackGET)
  ENDPOINT("GET", "/home/playback/{id}", LivePlaybackGET, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.getLivePlaybackById(id));
  };
  ADD_CORS(LiveGET)
  ENDPOINT("GET", "/home/live/{id}", LiveGET, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.getLiveById(id));
  };
  ADD_CORS(StartLivePOST)
  ENDPOINT("POST", "/home/live/{id}/start", StartLivePOST, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.startLiving(id));
  };
  ADD_CORS(EndLivePOST)
  ENDPOINT("POST", "/home/live/{id}/end", EndLivePOST, PATH(Int64, id))
  {
    return createDtoResponse(Status::CODE_200, service.endLiving(id));
  };
  ADD_CORS(LiveCommentGET)
  ENDPOINT("GET", "/home/live/{id}/comment/{page}", LiveCommentGET, PATH(Int64, id), PATH(Int64, page))
  {
    return createDtoResponse(Status::CODE_200, service.getLiveComment(id, page));
  };
  ADD_CORS(LiveExplaGET)
  ENDPOINT("GET", "/home/live/{id}/expla/{page}", LiveExplaGET, PATH(Int64, id), PATH(Int64, page))
  {
    return createDtoResponse(Status::CODE_200, service.getLiveExpla(id, page));
  };
  ADD_CORS(LiveFileGET)
  ENDPOINT("GET", "/home/live/{id}/file/{page}", LiveFileGET, PATH(Int64, id), PATH(Int64, page))
  {
    return createDtoResponse(Status::CODE_200, service.getLiveFile(id, page));
  };

  ADD_CORS(LiveCommentPOST)
  ENDPOINT("POST", "/home/live/{id}/comment", LiveCommentPOST, PATH(Int64, id), BODY_DTO(Object<LiveCommentDto>, rDto))
  {
    rDto->living_stream_id = id;
    return createDtoResponse(Status::CODE_200, service.instertLiveComment(rDto));
  };
  ADD_CORS(LiveExplaPOST)
  ENDPOINT("POST", "/home/live/{id}/expla", LiveExplaPOST, PATH(Int64, id), BODY_DTO(Object<LiveExplaDto>, rDto))
  {
    rDto->living_stream_id = id;
    return createDtoResponse(Status::CODE_200, service.instertLiveExpla(rDto));
  };
  ADD_CORS(LiveFilePOST)
  ENDPOINT("POST", "/home/live/{id}/file", LiveFilePOST, PATH(Int64, id), BODY_DTO(Object<LiveFileDto>, rDto))
  {
    rDto->living_stream_id = id;
    return createDtoResponse(Status::CODE_200, service.instertLiveFile(rDto));
  };
  ;

  /**
   * Codegen 结束
   * 是否是固定模板:是
   */
};
#include OATPP_CODEGEN_END(ApiController)

#endif /* UserController_hpp */