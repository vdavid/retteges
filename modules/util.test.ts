import { useLocalStorage, wait } from './util'
import { renderHook, act } from '@testing-library/react'

describe('Utility Functions', () => {
    describe('wait', () => {
        it('resolves after the specified time', async () => {
            jest.useFakeTimers()

            const promise = wait(1000)

            // Fast-forward time
            jest.advanceTimersByTime(1000)

            await expect(promise).resolves.toBeUndefined()

            jest.useRealTimers()
        })
    })

    describe('useLocalStorage', () => {
        beforeEach(() => {
            // Clear localStorage before each test
            window.localStorage.clear()
        })

        it('returns the initial value when no stored value exists', () => {
            const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))

            expect(result.current[0]).toBe('initialValue')
        })

        it('returns the stored value when it exists', () => {
            // Set a value in localStorage
            window.localStorage.setItem('testKey', JSON.stringify('storedValue'))

            const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))

            expect(result.current[0]).toBe('storedValue')
        })

        it('updates the stored value when setValue is called', () => {
            const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'))

            act(() => {
                result.current[1]('newValue')
            })

            expect(result.current[0]).toBe('newValue')
            expect(window.localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'))
        })
    })
})
