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
