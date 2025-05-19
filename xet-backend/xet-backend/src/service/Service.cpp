
#include "Service.hpp"
#include <iostream>
#include <iomanip>

const int64_t PAGESIZE = 20;

oatpp::Object<RUserDto> Service::getUserById(const oatpp::Int64 &id)
{
  return dao.getUserById(id);
}
oatpp::Object<RLiveDto> Service::getLiveById(const oatpp::Int64 &id)
{
  return dao.getLiveById(id, PAGESIZE);
}
oatpp::Object<RLiveCommentDto> Service::getLiveComment(const oatpp::Int64 &id, int64_t page)
{
  return dao.getLiveComment(id, PAGESIZE, page);
}
oatpp::Object<RLiveExplaDto> Service::getLiveExpla(const oatpp::Int64 &id, int64_t page)
{
  return dao.getLiveExpla(id, PAGESIZE, page);
}
oatpp::Object<RLiveFileDto> Service::getLiveFile(const oatpp::Int64 &id, int64_t page)
{
  return dao.getLiveFile(id, PAGESIZE, page);
}
