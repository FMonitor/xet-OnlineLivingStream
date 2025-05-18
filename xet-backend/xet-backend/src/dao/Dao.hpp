#ifndef Dao_HPP
#define Dao_HPP

#include "dto/DTOs.hpp"
#include <mysqlx/xdevapi.h>
#include "oatpp/core/macro/codegen.hpp"
#include <iostream>

#include "../MySQLComponent.hpp"
extern mysqlx::Client cli;

class Dao
{
public:
  Dao()=default;
  // 获取用户信息(不包括隐私信息,如邮箱和密码)
  oatpp::Object<RUserDto> getUserById(const oatpp::Int64 &id)
  {
    auto DBSession=cli.getSession();

    // Get a list of all available schemas
    std::list<mysqlx::Schema> schemaList = DBSession.getSchemas();

    std::cout << "Available schemas in this session:" << std::endl;

    // Loop over all available schemas and print their name
    for (mysqlx::Schema schema : schemaList) {
      std::cout << schema.getName() << std::endl;
    }

    DBSession.sql("USE xet_living_table");

    auto result_db = DBSession.sql("SELECT user_id,username FROM users WHERE id = ?").bind((int64_t)id).execute();
    
    if(result_db.count()==0){
      std::cerr << "No user found with id: " << id << std::endl;
      return nullptr;
    }

    auto row=result_db.fetchOne();
    auto result_dto=RUserDto::createShared();
    result_dto->data->push_back(UserDto::createShared());
    result_dto->statusCode=200;
    result_dto->message="Find user ok";
    result_dto->data[0]->id=row[0].get<int64_t>();
    result_dto->data[0]->name=row[1].get<std::string>();

    return result_dto;
  }

};

#endif // Dao_HPP
