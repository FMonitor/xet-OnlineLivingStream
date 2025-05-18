
#ifndef USERSERVICE_HPP
#define USERSERVICE_HPP


#include "dto/DTOs.hpp"

#include "oatpp/web/protocol/http/Http.hpp"
#include "oatpp/core/macro/component.hpp"

#include "dao/Dao.hpp"
#include "../MySQLComponent.hpp"

class Service
{
private:
  typedef oatpp::web::protocol::http::Status Status;

private:
  Dao dao;
public:
  oatpp::Object<RUserDto> getUserById(const oatpp::Int64 &id);
};

#endif // CRUD_USERSERVICE_HPP
