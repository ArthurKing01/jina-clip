import { baseURL, clearDbAndSourceVideo, existVideo, listOutput, listSource, search, TSearchResultItem } from './services'
import 'antd/dist/antd.css';
import { Upload, UploadProps, Button, Input, Divider, message, Modal } from 'antd'
import { useCallback, useState } from 'react';
import { ResultItem } from './components/ResultItem';
import { AppContext } from './context';
import { LoadingOutlined } from '@ant-design/icons';
import { FileListWrapper } from './components/FileListWrapper';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';

const TextArea = Input.TextArea

const options: UploadProps = {
  name: "file",
  action: `${baseURL}/upload`,
  accept: ".mp4",
  beforeUpload: async (file) => {
    const res = await existVideo(file.name)
    if (res.data.data) {
      message.warn("同名文件已存在，已停止上传")
      return false
    }
    return true
  }
}

function App() {

  const [text, setText] = useState("")
  const [thod, setThod] = useState("")

  const [textResult, setTextResult] = useState<TSearchResultItem[]>([])
  const [matches, setMatches] = useState<TSearchResultItem['matches']>([])
  const [loading, setLoading] = useState(false)

  const [outputList, setOutputList] = useState<string[]>([])
  const [sourceList, setSourceList] = useState<string[]>([])

  const [sourceDocIds, setSourceDocIds] = useState<string[]>([])

  const fetchListOut = useCallback(async () => {
    const res = await listOutput()
    setOutputList(res.data.data)
  }, [])
  const fetchListSource = useCallback(async () => {
    const res = await listSource()
    setSourceList(res.data.data)
  }, [])

  const updateTextResult = useCallback((item: TSearchResultItem, index: number) => {
    textResult[index] = item
    setTextResult([...textResult])
  }, [textResult])

  const updateMatch = useCallback((m: TSearchResultItem['matches'][0], index: number) => {
    matches[index] = m
    setMatches([...matches])
  }, [matches])

  const handleChangeThod: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setThod(e.target.value)
  }
  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value)
  }

  const handleSearch = useCallback(async () => {
    if (!text.trim()) {
      message.warn("请输入文本")
      return
    }
    setLoading(true)
    const res = await search(
      text.split(/[,.，。]/).map(i => i.trim()).filter(Boolean), 
      Number(thod) || 0.1,
      sourceDocIds.length > 0 ? sourceDocIds : undefined
      )
    setTextResult(res.data.data)
    setMatches(res.data.data.map(item => item.matches[0]))
    setLoading(false)
  }, [text, thod, sourceDocIds])

  const handleClear = useCallback(() => {
    Modal.confirm({
      title: "确定要清空吗？",
      content: "清空后不可恢复",
      onOk: async () => {
        await clearDbAndSourceVideo()
        location.reload()
      }
    })
  }, [])

  const handleFileChange: (info: UploadChangeParam<UploadFile<any>>) => void = (info) => {
    if (info.file.status === 'done') {
      message.success("上传成功！")
      fetchListSource()
    }
  }

  return (
    <AppContext.Provider value={{
      textResult,
      matches,
      updateMatch,
      outputList,
      fetchListOut,
      sourceList,
      fetchListSource,
      sourceDocIds,
      setSourceDocIds,
      updateTextResult
    }}>
      <div className="App">
        <div style={{ display: 'flex' }}>
          <div style={{
            width: 500,
            paddingTop: 20
          }}>
            <div style={{ marginBottom: '10px' }}>
              <Button danger onClick={handleClear}>清空数据库与源视频文件</Button>
            </div>
            <Upload {...options} onChange={handleFileChange}>
              <Button>上传mp4视频文件</Button>
            </Upload>

            <Divider />

            <TextArea rows={4} value={text} onChange={handleChange} placeholder={"按逗号和句号分割句子"} />
            阈值：<Input value={thod} onChange={handleChangeThod} placeholder="相似度阈值，默认0.1，越小越相似，结果越精确，视频片段越短" />
            <Button onClick={handleSearch}>搜索</Button>
          </div>
          <div>
            <FileListWrapper />
          </div>
        </div>

        {loading && <LoadingOutlined style={{ fontSize: '20px', margin: "10px" }} />}
        {!loading && <div style={{
          display: "flex"
        }}>
          {textResult.map((item, index) => {
            return <ResultItem key={item.text + index} item={item} index={index} />
          })}
        </div>}

      </div>
    </AppContext.Provider>

  )
}

export default App