
#include "Service.hpp"
#include <iostream>
#include <iomanip>

const int PAGESIZE = 20;

oatpp::Object<RUserDto> Service::getUserById(const oatpp::Int64 &id)
{
  return dao.getUserById(id);
}
oatpp::Object<RLiveDto> Service::getLiveById(const oatpp::Int64 &id)
{
  return dao.getLiveById(id, PAGESIZE);
}
