#!/bin/bash

echo "🚀 Video.js HLS 优化测试项目"
echo "================================"

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
    echo "🎯 启动开发服务器..."
    npm run dev
else
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi