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
#include "oatpp/core/async/Executor.hpp"
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

  ADD_CORS(UserGET,
           "*",
           "GET,POST,PUT,DELETE,OPTIONS",
           "Content-Type, Authorization",
           "3600");
  ENDPOINT_ASYNC("GET", "/user/{id}", UserGET)
  {
    ENDPOINT_ASYNC_INIT(UserGET)

    // 从请求中解析 id
    v_int64 id = std::strtoll(request->getPathVariable("id")->c_str(), nullptr, 10);

    // Coroutine 的核心逻辑入口
    Action act() override
    {
      Service service;
      auto dto = service.getUserById(id);
      // _return 调用会生成一个 TYPE_FINISH 的 Action 并发送响应
      return _return(controller->createDtoResponse(Status::CODE_200, dto));
    }
  };

//   /**
//    * POST方法:添加一个新的用户
//    * 参数:User信息列表(除了id) UserDto
//    * 返回值: 新用户id UInt64Dto
//    */
//   ADD_CORS(UserPOST,
//            "*",
//            "GET,POST,PUT,DELETE,OPTIONS",
//            "Content-Type, Authorization",
//            "3600");
//   ENDPOINT_ASYNC("POST", "/user", UserPOST){
//       ENDPOINT_ASYNC_INIT(UserPOST)
//       // 异步端点中,端点逻辑需要包含在Action函数中
//       Action act() override{
//           return request->readBodyToDtoAsync<oatpp::Object<UserDto>>(controller->getDefaultObjectMapper()).callbackTo(&UserPOST::returnResponse);
//       }

//       Action
//       returnResponse(const oatpp::Object<UserDto> &rDto)
//       {
//         UserService userService;
//         return _return(controller->createDtoResponse(Status::CODE_200, userService.createUserMySQL(rDto)));
//       }
//     };

// /**
//  * PUT方法:编辑用户信息
//  * 参数:User信息列表(除了id) UserDto
//  * 返回值: 影响行数(1代表编辑成功) UInt64Dto
//  */
// ADD_CORS(UserPUT,
//          "*",
//          "GET,POST,PUT,DELETE,OPTIONS",
//          "Content-Type, Authorization",
//          "3600");
// ENDPOINT_ASYNC("PUT", "/user", UserPUT){
//     ENDPOINT_ASYNC_INIT(UserPUT)
//     // 异步端点中,端点逻辑需要包含在Action函数中
//     Action act() override{
//         return request->readBodyToDtoAsync<oatpp::Object<UserDto>>(controller->getDefaultObjectMapper()).callbackTo(&UserPUT::returnResponse);
// }

// Action returnResponse(const oatpp::Object<UserDto> &rDto)
// {
//   UserService userService;
//   return _return(controller->createDtoResponse(Status::CODE_200, userService.updateUser(rDto)));
// }
// }
// ;

// /**
//  * DELETE方法:删除用户
//  * 参数:要删除的用户的id UInt64Dto
//  * 返回值: 影响行数(1代表编辑成功) UInt64Dto
//  */
// ADD_CORS(UserDELETE,
//          "*",
//          "GET,POST,PUT,DELETE,OPTIONS",
//          "Content-Type, Authorization",
//          "3600");
// ENDPOINT_ASYNC("DELETE", "/user/{id}", UserDELETE){
//     ENDPOINT_ASYNC_INIT(UserDELETE)
//     // 异步端点中,端点逻辑需要包含在Action函数中
//     Action act() override{
//         UserService userService;                                               // Create user service.
// Int64 id = std::strtoll(request->getPathVariable("id")->c_str(), nullptr, 10); // 获取路径参数
// // 异步操作示例（如数据库查询）
// return _return(controller->createDtoResponse(Status::CODE_200, userService.deleteUserById(id)));
// }
// }
// ;
// };
/**
 * Codegen 结束
 * 是否是固定模板:是
 */
};
#include OATPP_CODEGEN_END(ApiController)

#endif /* UserController_hpp */