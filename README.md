## clip

## 环境搭建

python版本：3.9.x

### 安装ffmpeg
`brew install ffmpeg`

### 创建虚拟环境
`python3.9 -m venv venv`

### 切换至虚拟环境
`source venv/bin/activate`

### 设置pip镜像源
`pip install -U pip`
`pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`

### 安装依赖
`pip install -r hello-jina2/requirements.txt`

### 安装CLIP
`pip install git+https://github.com/openai/CLIP.git`

### 安装pick依赖
`cd pick && yarn`

## 启动
在pick目录下, `yarn start`,等待Jina启动，出现 `Flow is ready to serve!` 后再进行下一步


## 访问地址
`http://localhost:3001/public`