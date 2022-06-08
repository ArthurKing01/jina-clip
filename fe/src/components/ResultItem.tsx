import { Select, Card, Button, message } from "antd"
import { useContext, useMemo, useRef, useState } from "react"
import { AppContext } from "../context"
import { cutVideo, TSearchResultItem } from "../services"
import { Video } from "./Video"
import { EditIndex } from "./EditIndex"
import { getUri } from "../utils"
import { createUseStyles } from "react-jss"


const useStyle = createUseStyles({
    card: {
        "& .ant-card-head-wrapper": {
            flexWrap: "wrap"
        }
    },
    
})



export const ResultItem = ({ item, index }: { item: TSearchResultItem, index: number }) => {

    const { matches, updateMatch, fetchListOut } = useContext(AppContext)

    const classes = useStyle()
    const [modalVisible, setModalVisible] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)

    const currentMatch = useMemo(() => {
        return matches[index]
    }, [matches, index])

    const handleChange = (value: string) => {
        // setId(value)
        const nextMatch = item.matches.find(m => m.id === value)
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
            mid: currentMatch.id
        })
        message.success("剪切成功！")
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

    return <>
        <Card className={classes.card} size="small" title={item.text} extra={currentMatch && <>
            <Button type="link" onClick={handleEditD}>编辑时长</Button>
            <Button type="link" onClick={handleCut}>生成剪切</Button>
        </>} style={{ width: 200 }}>
            <div style={{ fontSize: "12px" }}>matches数量:{item.matches.length}</div>
            {
                item.matches.length > 0 && <>
                    <Video
                        src={getUri(currentMatch.tags.uri)}
                        leftIndex={currentMatch.tags.leftIndex}
                        rightIndex={currentMatch.tags.rightIndex}
                        videoRef={videoRef}
                    />
                    <div>
                        <Select value={currentMatch.id} style={{ width: "100%" }} onChange={handleChange}>
                            {item.matches.map(m => {
                                const basename = m.tags.uri.split('/').pop()
                                return <Select.Option value={m.id} key={m.id}>{`${m.tags.leftIndex}-${m.tags.rightIndex} ${basename}`}</Select.Option>
                            })}
                        </Select>
                    </div>
                </>
            }
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
}