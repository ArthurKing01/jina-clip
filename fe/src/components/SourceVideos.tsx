import { List, message, Modal } from 'antd'
import { useCallback, useContext, useEffect } from 'react'
import { AppContext } from '../context'
import { baseURLHost, deleteSourceVideo } from '../services'
import { getUid } from '../utils'

export const SourceVideos = () => {
  const { sourceList, fetchListSource } = useContext(AppContext)

  useEffect(() => {
    fetchListSource()
  }, [])

  const handleDownload = useCallback((item: string) => {
    const a = document.createElement('a')
    a.href = `${baseURLHost}/videos/${getUid()}/${item}`
    a.download = item
    a.click()
  }, [])

  const handleView = useCallback((item: string) => {
    window.open(`${baseURLHost}/videos/${getUid()}/${item}`)
  }, [])

  const handleDelete = useCallback((item: string) => {
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后不可恢复',
      onOk: async () => {
        const res = await deleteSourceVideo({
          doc_ids: [item],
        })
        if (res.data.code === 0) {
          await fetchListSource()
          message.success('删除成功')
        } else {
          message.error(res.data.message)
        }
      },
    })
  }, [])

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={sourceList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="list-loadmore-more" onClick={() => handleDownload(item)}>
                下载
              </a>,
              <a key="list-loadmore-view" onClick={() => handleView(item)}>
                预览
              </a>,
              <a key="list-loadmore-delete" onClick={() => handleDelete(item)}>
                删除
              </a>,
            ]}
          >
            <div
              style={{
                maxWidth: '400px',
                whiteSpace: 'break-spaces',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {item}
            </div>
          </List.Item>
        )}
      />
    </>
  )
}
