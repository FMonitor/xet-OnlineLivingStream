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
  Dao() = default;
  // 获取用户信息(不包括隐私信息,如邮箱和密码)
  oatpp::Object<RUserDto> getUserById(const oatpp::Int64 &id)
  {
    auto DBSession = cli.getSession();

    // Get a list of all available schemas
    std::list<mysqlx::Schema> schemaList = DBSession.getSchemas();

    DBSession.sql("USE xet_living_table").execute();

    auto result_db = DBSession.sql("SELECT user_id,username FROM users WHERE user_id = ?").bind((int64_t)id).execute();

    if (result_db.count() == 0)
    {
      std::cerr << "No user found with id: " << id << std::endl;
      return nullptr;
    }

    auto row = result_db.fetchOne();
    auto result_dto = RUserDto::createShared();
    // 在oatpp中,所有的元素都需要初始化,否则分分钟段错误
    result_dto->data = oatpp::List<oatpp::Object<UserDto>>::createShared();

    result_dto->statusCode = 200;
    result_dto->message = "Find user ok";

    auto userdto = UserDto::createShared();
    userdto->id = row[0].get<int64_t>();
    userdto->name = row[1].get<std::string>();
    result_dto->data->push_back(userdto);

    return result_dto;
  }
  // 第一个参数是直播id,第二个参数是初始化的时候评论,讲解等的最大数目
  oatpp::Object<RLiveDto> getLiveById(const oatpp::Int64 &id, const int64_t num)
  {
    auto DBSession = cli.getSession();
    auto result_dto = RLiveDto::createShared();
    result_dto->data = oatpp::List<oatpp::Object<LiveDto>>::createShared();
    auto livedto = LiveDto::createShared();
    result_dto->data->push_back(livedto);

    // 初始化 comments, explanations, files 列表
    livedto->comments = oatpp::List<oatpp::Object<LiveCommentDto>>::createShared();
    livedto->explanations = oatpp::List<oatpp::Object<LiveExplaDto>>::createShared();
    livedto->files = oatpp::List<oatpp::Object<LiveFileDto>>::createShared();

    // 切换到目标数据库
    DBSession.sql("USE xet_living_table").execute();

    // 查询直播信息
    auto result_live_db = DBSession.sql("SELECT living_stream_id,creator_user_id,description,playback_url FROM living_stream WHERE living_stream_id = ?")
                              .bind((int64_t)id)
                              .execute();

    if (result_live_db.count() == 0)
    {
      result_dto->statusCode = 404;
      result_dto->message = "No living stream found with the given ID.";
      return result_dto;
    }

    auto live_row = result_live_db.fetchOne();

    result_dto->statusCode = 200;
    result_dto->message = "Find living_stream infomation ok";

    livedto->living_stream_id = live_row[0].get<int64_t>();
    livedto->creator_user_id = live_row[1].get<int64_t>();
    livedto->description = live_row[2].get<std::string>();
    livedto->playback_url = live_row[3].get<std::string>();

    // 查询评论总数并分页
    auto total_comments_result = DBSession.sql("SELECT COUNT(*) FROM live_comment WHERE living_stream_id = ?")
                                     .bind((int64_t)id)
                                     .execute();
    auto total_comments_count = total_comments_result.fetchOne()[0].get<int64_t>();
    int64_t comments_offset = (total_comments_count > num) ? total_comments_count - num : 0;

    auto result_comments_db = DBSession.sql("SELECT comment_id,living_stream_id,creator_user_id,DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,content FROM live_comment WHERE living_stream_id = ? ORDER BY created_at LIMIT ? OFFSET ?")
                                  .bind((int64_t)id)
                                  .bind((int64_t)num)
                                  .bind(comments_offset)
                                  .execute();

    for (auto live_comments_row : result_comments_db)
    {
      auto comment = LiveCommentDto::createShared();
      comment->comment_id = live_comments_row[0].get<int64_t>();
      comment->living_stream_id = live_comments_row[1].get<int64_t>();
      comment->creator_user_id = live_comments_row[2].get<int64_t>();
      comment->created_at = live_comments_row[3].get<std::string>();
      comment->content = live_comments_row[4].get<std::string>();
      livedto->comments->push_back(comment);
    }

    // 查询讲解总数并分页
    auto total_explanations_result = DBSession.sql("SELECT COUNT(*) FROM live_explanation WHERE living_stream_id = ?")
                                         .bind((int64_t)id)
                                         .execute();
    auto total_explanations_count = total_explanations_result.fetchOne()[0].get<int64_t>();
    int64_t explanations_offset = (total_explanations_count > num) ? total_explanations_count - num : 0;

    auto result_explanations_db = DBSession.sql("SELECT expla_id,living_stream_id,creator_user_id,DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,content FROM live_explanation WHERE living_stream_id = ? ORDER BY created_at LIMIT ? OFFSET ?")
                                      .bind((int64_t)id)
                                      .bind((int64_t)num)
                                      .bind(explanations_offset)
                                      .execute();

    for (auto explanation_row : result_explanations_db)
    {
      auto explanation = LiveExplaDto::createShared();
      explanation->expla_id = explanation_row[0].get<int64_t>();
      explanation->living_stream_id = explanation_row[1].get<int64_t>();
      explanation->creator_user_id = explanation_row[2].get<int64_t>();
      explanation->created_at = explanation_row[3].get<std::string>();
      explanation->content = explanation_row[4].get<std::string>();
      livedto->explanations->push_back(explanation);
    }

    // 查询文件总数并分页
    auto total_files_result = DBSession.sql("SELECT COUNT(*) FROM live_file WHERE living_stream_id = ?")
                                  .bind((int64_t)id)
                                  .execute();
    auto total_files_count = total_files_result.fetchOne()[0].get<int64_t>();
    int64_t files_offset = (total_files_count > num) ? total_files_count - num : 0;

    auto result_files_db = DBSession.sql("SELECT file_id,living_stream_id,creator_user_id,DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,file_url FROM live_file WHERE living_stream_id = ? ORDER BY created_at LIMIT ? OFFSET ?")
                               .bind((int64_t)id)
                               .bind((int64_t)num)
                               .bind(files_offset)
                               .execute();

    for (auto file_row : result_files_db)
    {
      auto file = LiveFileDto::createShared();
      file->file_id = file_row[0].get<int64_t>();
      file->living_stream_id = file_row[1].get<int64_t>();
      file->creator_user_id = file_row[2].get<int64_t>();
      file->created_at = file_row[3].get<std::string>();
      file->file_url = file_row[4].get<std::string>();
      livedto->files->push_back(file);
    }

    return result_dto;
  }
};

#endif // Dao_HPP
