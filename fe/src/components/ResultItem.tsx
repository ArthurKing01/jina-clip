import { Select, Card, Button, message } from 'antd'
import { EditOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import { useContext, useMemo, useRef, useState } from 'react'
import { AppContext } from '../context'
import { cutVideo, TSearchResultItem } from '../services'
import { Video } from './Video'
import { EditIndex } from './EditIndex'
import { getUri } from '../utils'
import { createUseStyles } from 'react-jss'

const useStyle = createUseStyles({
  card: {
    '& .ant-card-head-wrapper': {
      flexWrap: 'wrap',
    },
  },
})

export const ResultItem = ({ item, index }: { item: TSearchResultItem; index: number }) => {
  const { matches, updateMatch, fetchListOut } = useContext(AppContext)

  const classes = useStyle()
  const [modalVisible, setModalVisible] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  const currentMatch = useMemo(() => {
    return matches[index]
  }, [matches, index])

  const handleChange = (value: string) => {
    // setId(value)
    const nextMatch = item.matches.find((m) => m.id === value)
    if (nextMatch) {
      updateMatch(nextMatch, index)
      videoRef.current && (videoRef.current.currentTime = nextMatch.tags.leftIndex)
    }
  }

  const handleCut = async () => {
    await cutVideo({
      start: currentMatch.tags.leftIndex,
      len: currentMatch.tags.rightIndex - currentMatch.tags.leftIndex,
      uri: currentMatch.tags.uri,
      mid: currentMatch.id,
    })
    message.success('剪切成功！')
    await fetchListOut()
  }

  const handleEditD = () => {
    setModalVisible(true)
  }

  const handleOk = () => {
    setModalVisible(false)
    videoRef.current && (videoRef.current.currentTime = currentMatch.tags.leftIndex)
  }
  const handleCancel = () => {
    setModalVisible(false)
  }

  return (
    <>
      <Card
        className={classes.card}
        size="small"
        title={`${item.text}[${item.matches.length}]`}
        actions={[<CloudDownloadOutlined onClick={handleCut} />, <EditOutlined onClick={handleEditD} />]}
        extra={
          item.matches.length > 0 && (
            <>
              <div>
                <Select value={currentMatch.id} style={{ width: '100%' }} onChange={handleChange}>
                  {item.matches.map((m) => {
                    const basename = m.tags.uri.split('/').pop()
                    return (
                      <Select.Option value={m.id} key={m.id}>{`[${m.tags.rightIndex - m.tags.leftIndex + 1}]${
                        m.tags.leftIndex
                      }-${m.tags.rightIndex} ${basename}`}</Select.Option>
                    )
                  })}
                </Select>
              </div>
            </>
          )
        }
      >
        <Video
          src={getUri(currentMatch.tags.uri)}
          leftIndex={currentMatch.tags.leftIndex}
          rightIndex={currentMatch.tags.rightIndex}
          videoRef={videoRef}
        />
      </Card>
      <EditIndex
        modalVisible={modalVisible}
        currentMatch={currentMatch}
        handleCancel={handleCancel}
        handleOk={handleOk}
        item={item}
        index={index}
      />
    </>
  )
}
