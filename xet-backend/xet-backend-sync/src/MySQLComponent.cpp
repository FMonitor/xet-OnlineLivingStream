#include "MySQLComponent.hpp"

std::string url = "root:123456@localhost:33060";

mysqlx::Client cli(url, mysqlx::ClientOption::POOL_MAX_SIZE, 20);

// mysqlx::Client cli("root:123456@192.168.13.128:33060", mysqlx::ClientOption::POOL_MAX_SIZE, 20);
// mysqlx::Session sess = cli.getSession();
