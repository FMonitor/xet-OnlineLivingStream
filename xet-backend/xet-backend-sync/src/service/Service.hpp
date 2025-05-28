
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
  oatpp::Object<RHomeDto> getHomeById(const oatpp::Int64 &id);
  oatpp::Object<RLiveDto> getLiveById(const oatpp::Int64 &id);
  oatpp::Object<RLivePlaybackDto> getLivePlaybackById(const oatpp::Int64 &id);
  oatpp::Object<RLiveCommentDto> getLiveComment(const oatpp::Int64 &id, int64_t page);
  oatpp::Object<RLiveExplaDto> getLiveExpla(const oatpp::Int64 &id, int64_t page);
  oatpp::Object<RLiveFileDto> getLiveFile(const oatpp::Int64 &id, int64_t page);
  oatpp::Object<MessageDto> instertLiveComment(oatpp::Object<LiveCommentDto> comment);
  oatpp::Object<MessageDto> instertLiveExpla(oatpp::Object<LiveExplaDto> explanation);
  oatpp::Object<MessageDto> instertLiveFile(oatpp::Object<LiveFileDto> file);
  oatpp::Object<RStartLivingDto> startLiving(const oatpp::Int64 &id);
  oatpp::Object<MessageDto> endLiving(const oatpp::Int64 &id);
};

#endif // CRUD_USERSERVICE_HPP
