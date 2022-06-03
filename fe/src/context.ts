import React from 'react'
import { TSearchResultItem } from './services'

export type TContextProps = {
    textResult: TSearchResultItem[],
    matches: TSearchResultItem['matches']
    updateMatch: (m: TSearchResultItem['matches'][0], index: number) => void
    outputList: string[]
    fetchListOut: () => Promise<void>
    sourceList: string[]
    fetchListSource: () => Promise<void>
    sourceDocIds: string[]
    setSourceDocIds: (ids: string[]) => void
    updateTextResult: (item: TSearchResultItem, index: number) => void
}

export const AppContext = React.createContext<TContextProps>({
    textResult: [],
    matches: [],
    updateMatch: () => {},
    outputList: [],
    sourceList: [],
    fetchListSource: async () => {},
    fetchListOut: async () => {},
    sourceDocIds: [],
    setSourceDocIds: () => {},
    updateTextResult: () => {} 
})

