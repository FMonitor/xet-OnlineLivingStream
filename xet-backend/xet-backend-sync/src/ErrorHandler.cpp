

#include "ErrorHandler.hpp"
/**
 * 错误处理源代码文件
 * 是否是固定模板:是
 */
ErrorHandler::ErrorHandler(const std::shared_ptr<oatpp::data::mapping::ObjectMapper> &objectMapper)
    : m_objectMapper(objectMapper)
{
}

std::shared_ptr<ErrorHandler::OutgoingResponse>
ErrorHandler::handleError(const Status &status, const oatpp::String &message, const Headers &headers)
{

  auto error = StatusDto::createShared();
  error->status = "ERROR";
  error->code = status.code;
  error->message = message;

  auto response = ResponseFactory::createResponse(status, error, m_objectMapper);

  for (const auto &pair : headers.getAll())
  {
    response->putHeader(pair.first.toString(), pair.second.toString());
  }

  return response;
}