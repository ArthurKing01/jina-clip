import { Modal } from "antd"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { createUseStyles } from "react-jss"
import { TSearchResultItem } from "../services"
import { getUri } from "../utils"
import { Moveable } from "./Moveable"
import { Video } from "./Video"
import cx from 'classnames'
import { AppContext } from "../context"


const useStyle = createUseStyles({
    handle: {
        position: 'absolute',
        left: 0,
        height: '100%',
        width: '2px',
        backgroundColor: 'rgb(0,0,0)',
        cursor: "ew-resize",
    },
    t: {
        position: 'absolute',
        left: 0,
        bottom: '-20px',
        width: "50px",
        pointerEvents: "none",
        userSelect: "none"
    },
    tLeft: {
        left: '-50px',
        textAlign: 'right'
    }
})

export const EditIndex = ({
    modalVisible,
    handleCancel,
    handleOk,
    currentMatch,
    index,
    item
}: {
    modalVisible: boolean
    handleCancel?: ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    handleOk?: ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    currentMatch: TSearchResultItem['matches'][0]
    index: number
    item: TSearchResultItem
}) => {

    const { updateMatch, updateTextResult } = useContext(AppContext)

    const [left, setLeft] = useState(currentMatch.tags.leftIndex)
    const [right, setRight] = useState(currentMatch.tags.rightIndex)

    const [playing, setPlaying] = useState(false)

    const classes = useStyle()

    const editVideoRef = useRef<HTMLVideoElement>(null)
    const progressWrapperRef = useRef<HTMLDivElement>(null)

    const [totalDuration, setTotalDuration] = useState(1)

    useEffect(() => {
        setLeft(currentMatch.tags.leftIndex)
        setRight(currentMatch.tags.rightIndex)
    }, [currentMatch])

    const handleLeftDelta = useCallback((d: number) => {
        const pWidth = progressWrapperRef.current?.offsetWidth
        if (pWidth && totalDuration) {
            const nextLeft = left + (d / pWidth) * totalDuration
            if (nextLeft >= right || nextLeft < 0) {
                return
            }
            const solvedNextLeft = Math.round(nextLeft * 100) / 100 
            setLeft(solvedNextLeft)
            if (editVideoRef.current) {
                if (!editVideoRef.current.paused) {
                    setPlaying(false)
                }
                editVideoRef.current.currentTime = solvedNextLeft
            }
        }
    }, [left, right, totalDuration])

    const handleRightDelta = useCallback((d: number) => {
        const pWidth = progressWrapperRef.current?.offsetWidth
        if (pWidth && totalDuration) {
            const nextRight = right + (d / pWidth) * totalDuration
            if (nextRight > totalDuration || nextRight <= left) {
                return
            }
            const solvedNextRight = Math.round(nextRight * 100) / 100 
            setRight(solvedNextRight)
            if (editVideoRef.current) {
                if (!editVideoRef.current.paused) {
                    setPlaying(false)
                }
                editVideoRef.current.currentTime = solvedNextRight
            }

        }
    }, [left, right, totalDuration])

    const handleMetaData = useCallback(() => {
        if (editVideoRef.current) {
            setTotalDuration(editVideoRef.current.duration)
        }
    }, [])

    const handleClickLeft = useCallback(() => {
        if (editVideoRef.current) {
            setPlaying(false)
            editVideoRef.current.currentTime = left
        }
    }, [left])

    const handleClickRight = useCallback(() => {
        if (editVideoRef.current) {
            setPlaying(false)
            editVideoRef.current.currentTime = right
        }
    }, [right])

    const innerHandleOk: ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void) = useCallback((e) => {
        currentMatch.tags.leftIndex = left
        currentMatch.tags.rightIndex = right
        const cMatch = item.matches.find(m => m.id === currentMatch.id)
        if (cMatch) {
            cMatch.tags = currentMatch.tags
        }
        updateMatch({
            ...currentMatch
        }, index)
        updateTextResult({
            ...item
        }, index)
        handleOk?.(e)
    }, [left, right, handleOk, currentMatch, index, item])

    const handlePlaying = useCallback((playing: boolean) => {
        if (playing) {
            if (editVideoRef.current) {
                editVideoRef.current.currentTime = left
            }
        } 
        setPlaying(playing)
    }, [right, left])

    return <Modal title={"编辑时长"} visible={modalVisible} onCancel={handleCancel} onOk={innerHandleOk}>
        <div>
            <div style={{ width: "200px", margin: "0 auto" }}>
                <Video
                    src={getUri(currentMatch.tags.uri)}
                    leftIndex={left}
                    rightIndex={right}
                    videoRef={editVideoRef}
                    onLoadedMetaData={handleMetaData}
                    playing={playing}
                    handlePlaying={handlePlaying}
                />
            </div>
            <div style={{
                height: "30px",
                backgroundColor: "rgba(0,0,0,0.1)",
                position: "relative"
            }} ref={progressWrapperRef}>
                <Moveable
                    className={classes.handle}
                    left={(left / totalDuration * 100) + '%'}
                    handleDelta={handleLeftDelta}
                    onClick={handleClickLeft}
                >
                    <div className={cx(classes.t, classes.tLeft)}>{left}</div>
                </Moveable>
                <Moveable
                    className={classes.handle}
                    left={(right / totalDuration * 100) + '%'}
                    handleDelta={handleRightDelta}
                    onClick={handleClickRight}
                >
                    <div className={classes.t}>{right}</div>
                </Moveable>
            </div>
        </div>

    </Modal>
}