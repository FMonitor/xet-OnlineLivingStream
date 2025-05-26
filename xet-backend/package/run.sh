#!/bin/bash

# 同时启动两个脚本
./xet-backend-async-exe &
pid1=$!

./xet-backend-sync-exe &
pid2=$!

# 等待两个脚本完成
wait $pid1
if [ $? -ne 0 ]; then
    echo "xet-backend-async-exe 执行失败"
    exit 1
fi

wait $pid2
if [ $? -ne 0 ]; then
    echo "xet-backend-sync-exe 执行失败"
    exit 1
fi

echo "所有脚本执行成功"