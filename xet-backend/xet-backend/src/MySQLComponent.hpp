#ifndef MYSQLCOMPONENT_HPP
#define MYSQLCOMPONENT_HPP

#include <mysqlx/xdevapi.h>
#include <string>

// 数据库会话
extern mysqlx::Client cli;
// 数据库连接url
extern std::string url; 

#endif