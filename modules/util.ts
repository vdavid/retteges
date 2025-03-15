import React, { useDebugValue, useEffect, useState } from 'react'

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useLocalStorage<T>(
    key: string,
    initialState: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialState)
    const [gotInitialState, setGotInitialState] = useState(false)
    useDebugValue(state)
    useEffect(() => {
        const item = localStorage.getItem(key)
        setGotInitialState(true)
        if (item) {
            setState(parse(item))
        }
    }, [key])
    useEffect(() => {
        if (gotInitialState) {
            localStorage.setItem(key, JSON.stringify(state))
        }
    }, [gotInitialState, key, state])
    return [state, setState]
}

const parse = (value: string) => {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}
