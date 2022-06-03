import { baseURLHost } from "./services"

export const getUri = (uri: string) => {
    return baseURLHost + uri.slice(6)
}