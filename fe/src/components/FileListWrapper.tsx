import { Tabs } from "antd"
import { OutputVideos } from "./OutputVideos"
import { SourceVideos } from "./SourceVideos"

const TabPane = Tabs.TabPane

export const FileListWrapper = () => {
    return <Tabs type="card" size="small">
        <TabPane tab={"源视频"} key={1}>
        <SourceVideos />
        </TabPane>
        <TabPane tab={"output视频"} key={2}>
        <OutputVideos />
        </TabPane>
    </Tabs>
}