/**
 * 错误处理头文件
 * 是否是固定模板:是
 */
#ifndef ERRORHANDLER_HPP
#define ERRORHANDLER_HPP

#include "dto/DTOs.hpp"

#include "oatpp/web/server/handler/ErrorHandler.hpp"
#include "oatpp/web/protocol/http/outgoing/ResponseFactory.hpp"

class ErrorHandler : public oatpp::web::server::handler::ErrorHandler
{
private:
  typedef oatpp::web::protocol::http::outgoing::Response OutgoingResponse;
  typedef oatpp::web::protocol::http::Status Status;
  typedef oatpp::web::protocol::http::outgoing::ResponseFactory ResponseFactory;

private:
  std::shared_ptr<oatpp::data::mapping::ObjectMapper> m_objectMapper;

public:
  ErrorHandler(const std::shared_ptr<oatpp::data::mapping::ObjectMapper> &objectMapper);

  std::shared_ptr<OutgoingResponse>
  handleError(const Status &status, const oatpp::String &message, const Headers &headers) override;
};

#endif // ERRORHANDLER_HPP
