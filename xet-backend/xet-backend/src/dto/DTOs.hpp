#ifndef DTOs_hpp
#define DTOs_hpp

#include "oatpp/core/macro/codegen.hpp"
#include "oatpp/core/Types.hpp"

#include OATPP_CODEGEN_BEGIN(DTO)

/**
 *  Data Transfer Object. Object containing fields only.
 *  Used in API for serialization/deserialization and validation
 */
class MessageDto : public oatpp::DTO {

  DTO_INIT(MessageDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);

};

class UserDto : public oatpp::DTO {

  DTO_INIT(UserDto, DTO)

  DTO_FIELD(Int64, id);
  DTO_FIELD(String, name);

};

//用于返回用户信息(不包括隐私信息)的Dto
class RUserDto : public oatpp::DTO {

  DTO_INIT(RUserDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);
  DTO_FIELD(oatpp::List<oatpp::Object<UserDto>>, data);

};

class LiveCommentDto : public oatpp::DTO
{

  DTO_INIT(LiveCommentDto, DTO)

  DTO_FIELD(Int64, comment_id);
  DTO_FIELD(Int64, living_stream_id);
  DTO_FIELD(Int64, creator_user_id);
  DTO_FIELD(String, created_at);
  DTO_FIELD(String, content);
};

class LiveExplaDto : public oatpp::DTO
{

  DTO_INIT(LiveExplaDto, DTO)

  DTO_FIELD(Int64, expla_id);
  DTO_FIELD(Int64, living_stream_id);
  DTO_FIELD(Int64, creator_user_id);
  DTO_FIELD(String, created_at);
  DTO_FIELD(String, content);
};
class LiveFileDto : public oatpp::DTO
{

  DTO_INIT(LiveFileDto, DTO)

  DTO_FIELD(Int64, file_id);
  DTO_FIELD(Int64, living_stream_id);
  DTO_FIELD(Int64, creator_user_id);
  DTO_FIELD(String, created_at);
  DTO_FIELD(String, file_url);
};

class LiveDto : public oatpp::DTO
{

  DTO_INIT(LiveDto, DTO)

  DTO_FIELD(Int64, living_stream_id);
  DTO_FIELD(Int64, creator_user_id);
  DTO_FIELD(String, description);
  DTO_FIELD(String, playback_url);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveCommentDto>>, comments);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveExplaDto>>, explanations);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveFileDto>>, files);
};

// 用于返回直播信息的Dto
class RLiveDto : public oatpp::DTO
{
  DTO_INIT(RLiveDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveDto>>, data);
};

// 用于返回直播中评论信息组的Dto
class RLiveCommentDto : public oatpp::DTO
{
  DTO_INIT(RLiveCommentDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveCommentDto>>, data);
};
// 用于返回直播中讲解信息组的Dto
class RLiveExplaDto : public oatpp::DTO
{
  DTO_INIT(RLiveExplaDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveExplaDto>>, data);
};
// 用于返回直播中文件信息组的Dto
class RLiveFileDto : public oatpp::DTO
{
  DTO_INIT(RLiveFileDto, DTO)

  DTO_FIELD(Int64, statusCode);
  DTO_FIELD(String, message);
  DTO_FIELD(oatpp::List<oatpp::Object<LiveFileDto>>, data);
};

class UInt64Dto : public oatpp::DTO
{

  DTO_INIT(UInt64Dto, DTO)

  DTO_FIELD(Int64, statusCode);

  DTO_FIELD(Int64, message);
};
class StringDto : public oatpp::DTO
{

  DTO_INIT(StringDto, DTO)

  DTO_FIELD(Int64, statusCode);

  DTO_FIELD(String, message);
};
class StatusDto : public oatpp::DTO
{

  DTO_INIT(StatusDto, DTO)

  DTO_FIELD(String, status);

  DTO_FIELD(Int64, code);

  DTO_FIELD(String, message);
};
#include OATPP_CODEGEN_END(DTO)

#endif /* DTOs_hpp */
