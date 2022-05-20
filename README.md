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

## 使用方式
做了两个版本，一个入口是`app.py`，另一个入口是`app2.py`

### 启动命令
`python hello-jina2/app.py` 或 `python hello-jina2/app2.py`

`app.py`是原demo的升级版，存在`MemberError`问题，仅支持索引视频前35s
`app2.py`是基于`CLIP`新写的，支持各种长度视频，目前`ffmpeg`没有接完，只能将视频手动生成图片后测试

### 视频目录
`hello-jina2/toy_data`,通过`app(2).py`里的`get_docs`方法构造`Document`

### 利用`ffmpeg`生成图片（临时方法，app2.py需要）
`ffmpeg -i 1.mp4 -r 1 -f image2 image1-%03d.jpg`