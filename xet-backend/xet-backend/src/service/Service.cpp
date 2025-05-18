
#include "Service.hpp"
#include <iostream>
#include <iomanip>


oatpp::Object<RUserDto> Service::getUserById(const oatpp::Int64 &id)
{
  return dao.getUserById(id);
}

