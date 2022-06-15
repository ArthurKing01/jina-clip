import { listOutput, listSource, search, TSearchResultItem } from './services'
import 'antd/dist/antd.css'
import { Button, Input, Divider, message, Col, Row, Select, Form } from 'antd'
import { useCallback, useState } from 'react'
import { ResultItem } from './components/ResultItem'
import { AppContext } from './context'
import { LoadingOutlined } from '@ant-design/icons'
import { FileListWrapper } from './components/FileListWrapper'

const TextArea = Input.TextArea

function App() {
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

  const updateTextResult = useCallback(
    (item: TSearchResultItem, index: number) => {
      textResult[index] = item
      setTextResult([...textResult])
    },
    [textResult]
  )

  const updateMatch = useCallback(
    (m: TSearchResultItem['matches'][0], index: number) => {
      matches[index] = m
      setMatches([...matches])
    },
    [matches]
  )

  const handleSearch = useCallback(async function (formData: any) {
    if (!formData.text.length) {
      message.warn('请输入文本')
      return
    }
    setLoading(true)
    const res = await search(
      formData.text,
      Number(formData.thod) || 0.1,
      sourceDocIds.length > 0 ? sourceDocIds : undefined
    )
    setTextResult(res.data.data)
    setMatches(res.data.data.map((item) => item.matches[0]))
    setLoading(false)
  }, [])

  return (
    <AppContext.Provider
      value={{
        textResult,
        matches,
        updateMatch,
        outputList,
        fetchListOut,
        sourceList,
        fetchListSource,
        sourceDocIds,
        setSourceDocIds,
        updateTextResult,
      }}
    >
      <div className="App">
        <Row gutter={20} justify="space-between">
          <Col span={8}>
            <FileListWrapper />
          </Col>
          <Col span={15}>
            <Form layout="horizontal" onFinish={handleSearch}>
              <Form.Item label="描述语句" name="text">
                <Select mode="tags" tokenSeparators={[',', '.']} placeholder={'按逗号和句号分割句子'}></Select>
              </Form.Item>
              <Form.Item label="阈值" name="thod">
                <Input placeholder="相似度阈值，默认0.1，越小越相似，结果越精确，视频片段越短" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Form.Item>
            </Form>
            <Divider />
            {loading && <LoadingOutlined style={{ fontSize: '20px', margin: '10px' }} />}
            {!loading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                {textResult.map((item, index) => {
                  return <ResultItem key={item.text + index} item={item} index={index} />
                })}
              </div>
            )}
          </Col>
        </Row>
      </div>
    </AppContext.Provider>
  )
}

export default App
