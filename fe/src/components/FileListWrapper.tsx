import { Tabs, Button, Upload, Modal, UploadProps, message, Row } from 'antd'
import { useCallback, useState } from 'react'
import { baseURL, listSource, clearDbAndSourceVideo, existVideo } from '../services'
import React from 'react'
import { OutputVideos } from './OutputVideos'
import { SourceVideos } from './SourceVideos'

import { UploadChangeParam } from 'antd/lib/upload'
import { UploadFile } from 'antd/lib/upload/interface'

const TabPane = Tabs.TabPane

const options: UploadProps = {
  name: 'file',
  action: `${baseURL}/upload`,
  accept: '.mp4',
  beforeUpload: async (file) => {
    const res = await existVideo(file.name)
    if (res.data.data) {
      message.warn('同名文件已存在，已停止上传')
      return false
    }
    return true
  },
}

export const FileListWrapper = () => {
  const [outputList, setOutputList] = useState<string[]>([])
  const [sourceList, setSourceList] = useState<string[]>([])

  const fetchListSource = useCallback(async () => {
    const res = await listSource()
    setSourceList(res.data.data)
  }, [])

  const handleClear = useCallback(() => {
    Modal.confirm({
      title: '确定要清空吗？',
      content: '清空后不可恢复',
      onOk: async () => {
        await clearDbAndSourceVideo()
        location.reload()
      },
    })
  }, [])

  const handleFileChange: (info: UploadChangeParam<UploadFile<any>>) => void = (info) => {
    if (info.file.status === 'done') {
      message.success('上传成功！')
      fetchListSource()
    }
  }

  const optionsSlot: React.ReactNode = (
    <Row gutter={10}>
      <Upload {...options} onChange={handleFileChange}>
        <Button>上传视频</Button>
      </Upload>
      <Button danger onClick={handleClear} style={{ marginLeft: 10 }}>
        清空数据库
      </Button>
    </Row>
  )

  return (
    <Tabs tabBarExtraContent={optionsSlot} type="card" size="small">
      <TabPane tab={'源视频'} key={1}>
        <SourceVideos />
      </TabPane>
      <TabPane tab={'output视频'} key={2}>
        <OutputVideos />
      </TabPane>
    </Tabs>
  )
}
