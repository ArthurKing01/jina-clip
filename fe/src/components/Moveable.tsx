import cx from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createUseStyles } from 'react-jss'

const useStyle = createUseStyles({
    move: {
        '& .__inner_moveable__area__': {
            display: "none",
            width: '30px',
            height: '100%',
            marginLeft: '-15px',
            backgroundColor: "rgba(0,0,0,0.2)"
        },
        '&:hover .__inner_moveable__area__': {
            display: "block",
        }
    }
})


export const Moveable = ({
    className,
    children,
    left,
    handleDelta,
    onClick
}: {
    left?: string | number
    className?: string
    children?: React.ReactChild
    handleDelta?: (delta: number) => void
    onClick?: () => void
}) => {

    const classes = useStyle()
    const [mouseDown, setMouseDown] = useState(false)

    useEffect(() => {
        const handleMouseUp = () => {
            setMouseDown(false)
        }
        document.body.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.body.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const prePageX = useRef<number>(0)

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
        setMouseDown(true)
        prePageX.current = e.pageX
    }, [])

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
        setMouseDown(false)
    }, [])

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
        if (mouseDown) {
            handleDelta?.(e.pageX - prePageX.current)
            prePageX.current = e.pageX
        }
    }, [mouseDown, handleDelta])

    return <div
        className={cx(classes.move, className)}
        style={{
            left
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp} 
        onMouseMove={handleMouseMove}
        onClick={onClick}
        >
        {children}
        <div className='__inner_moveable__area__'></div>
    </div>
}