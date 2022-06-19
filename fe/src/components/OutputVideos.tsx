import { Input, List, message, Modal } from "antd"
import { useCallback, useContext, useEffect, useState } from "react"
import { AppContext } from "../context"
import { baseURLHost, deleteOutputVideo, listOutput, rename } from "../services"
import { getUid } from "../utils"

export const OutputVideos = () => {
    
    const { outputList, fetchListOut } = useContext(AppContext)

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [renameValue, setRenameValue] = useState("")
    const [currentItem, setCurrentItem] = useState("")

    useEffect(() => {
        fetchListOut()
    }, [])

    

    const handleRename = useCallback((item: string) => {
        setCurrentItem(item)
        setRenameValue(item)
        setIsModalVisible(true);
    }, [])

    const handleDownload = useCallback((item: string) => {
        const a = document.createElement('a')
        a.href = `${baseURLHost}/output/${getUid()}/${item}`
        a.download = item
        a.click()
    }, [])

    const handleView = useCallback((item: string) => {
        window.open(`${baseURLHost}/output/${getUid()}/${item}`)
    }, [])

    const handleDelete = useCallback((item: string) => {
        Modal.confirm({
            title: "确定要删除吗？",
            content: "删除后不可恢复",
            onOk: async () => {
                const res = await deleteOutputVideo(item)
                if (res.data.code === 0) {
                    await fetchListOut()
                    message.success("删除成功")
                } else {
                    message.error(res.data.message)
                }
            }
        })
    }, [])

    const handleOk = async () => {

        const res = await rename(currentItem, renameValue)
        if (res.data.code !== 0) {
            message.error(res.data.message)
            return
        }
        await fetchListOut()
        message.success("修改成功")

        setIsModalVisible(false);
        setCurrentItem("")
        setRenameValue("")
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentItem("")
        setRenameValue("")
    };
    return <>
        <List
            itemLayout="horizontal"
            dataSource={outputList}
            renderItem={item => (
                <List.Item
                    actions={[
                    <a key="list-loadmore-edit" onClick={() => handleRename(item)}>重命名</a>, 
                    <a key="list-loadmore-more" onClick={() => handleDownload(item)}>下载</a>,
                    <a key="list-loadmore-view" onClick={() => handleView(item)}>预览</a>,
                    <a key="list-loadmore-delete" onClick={() => handleDelete(item)}>删除</a>,
                ]}
                >
                    <div>{item}</div>
                </List.Item>
            )}
        />
        <Modal title="重命名" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
        </Modal>
    </>
}