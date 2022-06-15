import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons'
import { useCallback, useEffect, useRef, useState } from 'react'

export type TVideoProps = {
  src: string
  videoRef: React.RefObject<HTMLVideoElement>
  leftIndex: number
  rightIndex: number
  onLoadedMetaData?: React.ReactEventHandler<HTMLVideoElement>
  playing?: boolean
  handlePlaying?: (playing: boolean) => void
}

export const Video = ({
  src,
  videoRef,
  leftIndex,
  rightIndex,
  onLoadedMetaData,
  playing,
  handlePlaying,
}: TVideoProps) => {
  const [innerPlaying, setInnerPlaying] = useState(playing)
  const [mouseEnter, setMouseEnter] = useState(false)

  const progressBarRef = useRef<HTMLDivElement>(null)

  const handleLoadStart = useCallback(() => {
    videoRef.current && (videoRef.current.currentTime = leftIndex)
  }, [])

  useEffect(() => {
    setInnerPlaying(playing)
    if (playing) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }, [playing])

  const togglePlay = useCallback(() => {
    const nextPlaying = !innerPlaying
    if (handlePlaying) {
      handlePlaying(nextPlaying)
    } else {
      if (innerPlaying) {
        videoRef.current?.pause()
      } else {
        videoRef.current?.play()
      }
      setInnerPlaying(nextPlaying)
    }
  }, [innerPlaying, handlePlaying])

  const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = useCallback(
    (e) => {
      if (innerPlaying) {
        if (e.currentTarget.currentTime >= rightIndex) {
          e.currentTarget.pause()
          setInnerPlaying(false)
          handlePlaying?.(false)
          e.currentTarget.currentTime = leftIndex
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width =
            ((e.currentTarget.currentTime - leftIndex) / (rightIndex - leftIndex)) * 100 + '%'
        }
      }
    },
    [innerPlaying, leftIndex, rightIndex, handlePlaying]
  )
  const handleMouseEnter = () => {
    setMouseEnter(true)
  }

  const handleMouseLeave = () => {
    setMouseEnter(false)
  }
  return (
    <div
      style={{
        position: 'relative',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        style={{ width: '100%', display: 'block', maxHeight: 400 }}
        ref={videoRef}
        src={src}
        onLoadStart={handleLoadStart}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={onLoadedMetaData}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '28px',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={togglePlay}
      >
        {innerPlaying ? mouseEnter ? <PauseCircleFilled /> : '' : <PlayCircleFilled />}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          height: '2px',
          left: 0,
          backgroundColor: '#51ace0',
          width: 0,
        }}
        ref={progressBarRef}
      ></div>
    </div>
  )
}
