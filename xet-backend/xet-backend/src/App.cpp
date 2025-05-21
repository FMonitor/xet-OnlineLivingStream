#include "./controller/MyController.hpp"
#include "./controller/MediaController.hpp"
#include "./controller/LiveRoom/LiveRoomController.hpp"
#include "./controller/RoomsController.hpp"
#include "./AppComponent.hpp"

#include "oatpp/network/Server.hpp"

#include "oatpp-swagger/AsyncController.hpp" //swagger:引入异步swagger头文件

#include <iostream>

void run()
{

  /* Register Components in scope of run() method */
  AppComponent components;

  /* Get router component */
  OATPP_COMPONENT(std::shared_ptr<oatpp::web::server::HttpRouter>, router);

  /* Create MyController and add all of its endpoints to router */
  router->addController(std::make_shared<MyController>());

  /* 添加数据库增删改查API控制器 */
  router->addController(std::make_shared<LiveRoomController>());

  // 数据库增删改查API控制器增加swagger文档
  oatpp::web::server::api::Endpoints docEndpoints;
  docEndpoints.append(router->addController(LiveRoomController::createShared())->getEndpoints());
  router->addController(oatpp::swagger::AsyncController::createShared(docEndpoints));

  // 添加视频流Api控制器
  router->addController(MediaController::createShared());




  // 添加websocket服务器Api控制器
  router->addController(std::make_shared<RoomsController>());

  /* Get connection handler component */
  OATPP_COMPONENT(std::shared_ptr<oatpp::network::ConnectionHandler>, connectionHandler, "http");

  /* Get connection provider component */
  OATPP_COMPONENT(std::shared_ptr<oatpp::network::ServerConnectionProvider>, connectionProvider);

  /* Create server which takes provided TCP connections and passes them to HTTP connection handler */
  oatpp::network::Server server(connectionProvider, connectionHandler);

  /* Priny info about server port */
  OATPP_LOGI("MyApp", "Server running on port %s", connectionProvider->getProperty("port").getData());

  /* Run server */
  server.run();
}

int main(int argc, const char *argv[])
{

  oatpp::base::Environment::init();

  run();

  /* Print how much objects were created during app running, and what have left-probably leaked */
  /* Disable object counting for release builds using '-D OATPP_DISABLE_ENV_OBJECT_COUNTERS' flag for better performance */
  std::cout << "\nEnvironment:\n";
  std::cout << "objectsCount = " << oatpp::base::Environment::getObjectsCount() << "\n";
  std::cout << "objectsCreated = " << oatpp::base::Environment::getObjectsCreated() << "\n\n";

  oatpp::base::Environment::destroy();

  return 0;
}
