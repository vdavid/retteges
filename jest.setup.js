// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock the Audio API since it's not available in the test environment
global.Audio = class {
    constructor() {
        return {
            play: jest.fn().mockImplementation(() => Promise.resolve()),
            pause: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            volume: 0,
            loop: false,
            currentTime: 0,
            duration: 10,
        }
    }
}

// Mock HTMLAudioElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: jest.fn(),
})

// Mock AbortController
global.AbortController = class {
    constructor() {
        this.signal = {
            aborted: false,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        }
    }

    abort() {
        this.signal.aborted = true
    }
}
