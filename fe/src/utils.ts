import { baseURLHost } from "./services"
import {v1} from 'uuid'

export const getUri = (uri: string) => {
    return baseURLHost + uri.slice(6)
}

export const getUid = () => {
    const uid = localStorage.getItem("uid")
    if (!uid) {
        localStorage.setItem("uid", v1())
    }
    return localStorage.getItem("uid") as string
}