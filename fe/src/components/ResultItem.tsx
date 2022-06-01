import { Select, Card, Button } from "antd"
import { useCallback, useContext, useMemo, useRef, useState } from "react"
import { AppContext } from "../context"
import { baseURLHost, cutVideo, TSearchResultItem } from "../services"
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons'

const getUri = (uri: string) => {
    return baseURLHost + uri.slice(6)
}

export const ResultItem = ({ item, index }: { item: TSearchResultItem, index: number }) => {

    const { matches, updateMatch, fetchListOut } = useContext(AppContext)

    const [playing, setPlaying] = useState(false)
    const [mouseEnter, setMouseEnter] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)
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
    const handleLoadStart = () => {
        videoRef.current && (videoRef.current.currentTime = currentMatch.tags.leftIndex)
    }

    const togglePlay = () => {
        if (playing) {
            videoRef.current?.pause()
        } else {
            videoRef.current?.play()
        }
        setPlaying(!playing)
    }

    const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
        if (e.currentTarget.currentTime >= currentMatch.tags.rightIndex) {
            e.currentTarget.pause()
            setPlaying(false)
            e.currentTarget.currentTime = currentMatch.tags.leftIndex
        }
        if (progressBarRef.current) {
            progressBarRef.current.style.width = (e.currentTarget.currentTime - currentMatch.tags.leftIndex) / (currentMatch.tags.rightIndex - currentMatch.tags.leftIndex) * 100 + '%'
            console.log(progressBarRef.current.style.width)
        }
        
    }, [currentMatch])

    const handleMouseEnter = () => {
        console.log('in')
        setMouseEnter(true)
    }

    const handleMouseLeave = () => {
        console.log('out')
        setMouseEnter(false)
    }

    const handleCut = async () => {
        await cutVideo({
            start: currentMatch.tags.leftIndex,
            len: currentMatch.tags.rightIndex - currentMatch.tags.leftIndex,
            uri: currentMatch.tags.uri,
            mid: currentMatch.id
        })
        await fetchListOut()
    }

    return <Card size="small" title={item.text} extra={currentMatch && <Button type="link" onClick={handleCut}>生成剪切</Button>} style={{ width: 200 }}>
        <div style={{ fontSize: "12px" }}>matches数量:{item.matches.length}</div>
        {
            item.matches.length > 0 && <>
                <div style={{
                    position: 'relative'
                }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <video
                        style={{ width: "100%", display: 'block' }}
                        ref={videoRef}
                        src={getUri(currentMatch.tags.uri)}
                        onLoadStart={handleLoadStart}
                        onTimeUpdate={handleTimeUpdate}
                    />
                    <div style={{
                        position: "absolute",
                        left: '50%',
                        top: "50%",
                        transform: 'translate(-50%, -50%)',
                        fontSize: '28px',
                        color: '#fff',
                        cursor: 'pointer'
                    }} onClick={togglePlay}>{playing ? mouseEnter ? <PauseCircleFilled /> : "" : <PlayCircleFilled />}</div>
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        height: '2px',
                        left: 0,
                        backgroundColor: '#51ace0',
                        width: 0
                    }} ref={progressBarRef} ></div>
                </div>
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
}