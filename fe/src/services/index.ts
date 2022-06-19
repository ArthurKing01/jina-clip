import axios from "axios"
import { getUid } from "../utils"
export const baseURL = "http://localhost:3001/api"
export const baseURLHost = `http://localhost:3001`

export type ResponseEntity<T=unknown> = {
    code: number
    message: string
    data: T
}

export type TSearchResultItem = {
    text: string
    matches: {
        id: string
        tags: {
            leftIndex: number
            maxImageScore: number
            maxIndex: number
            rightIndex: number
            uri: string
        }
    }[]
}

axios.defaults.headers.common["token"] = getUid()

export const search = (texts: string[], thod: number, doc_ids?: string[]) => axios.post<ResponseEntity<TSearchResultItem[]>>(`${baseURL}/search`, {
    texts,
    thod,
    doc_ids
}, {
    headers: {
        "Content-Type": "application/json"
    }
}
)



export const listOutput = () => axios.get<ResponseEntity<string[]>>(`${baseURL}/listOutput`)

export const listSource = () => axios.get<ResponseEntity<string[]>>(`${baseURL}/listSource`)

export const rename = (source: string, target: string) => axios.post<ResponseEntity>(`${baseURL}/rename`, {
    source,
    target
}, {
    headers: {
        "Content-Type": "application/json"
    }
})

export const deleteOutputVideo = (source: string) => axios.post<ResponseEntity>(`${baseURL}/delete`, {
    source
}, {
    headers: {
        "Content-Type": "application/json"
    }
})

export const existVideo = (source: string) => axios.post<ResponseEntity<boolean>>(`${baseURL}/exist`, {
    source
}, {
    headers: {
        "Content-Type": "application/json"
    }
})



export const clearDbAndSourceVideo = () => axios.post<ResponseEntity>(`${baseURL}/clear`)

export const cutVideo = (data: {
    start: number
    len: number
    uri: string
    mid: string
}) => axios.post<ResponseEntity>(`${baseURL}/cut`, data, {
    headers: {
        "Content-Type": "application/json"
    }
})

export const deleteSourceVideo = (data: {
    doc_ids: string[]
}) => axios.post<ResponseEntity>(`${baseURL}/deleteDoc`, data, {
    headers: {
        "Content-Type": "application/json"
    }
})