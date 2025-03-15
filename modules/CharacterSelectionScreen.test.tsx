import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CharacterSelectionScreen from './CharacterSelectionScreen'
import { characters } from './game-logic'

describe('CharacterSelectionScreen Component', () => {
    const mockOnStart = jest.fn()
    const mockSetSelection = jest.fn()
    const mockSetIsBackgroundMusicPaused = jest.fn()
    const mockSelection = characters.map(() => false)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the header correctly', () => {
        render(
            <CharacterSelectionScreen
                selection={mockSelection}
                setSelection={mockSetSelection}
                isReady={true}
                onStart={mockOnStart}
                isBackgroundMusicPaused={false}
                setIsBackgroundMusicPaused={mockSetIsBackgroundMusicPaused}
            />,
        )

        // Check if the header is rendered
        const headerElement = screen.getByText(/Rettegés éjszakája/i)
        expect(headerElement).toBeTruthy()
    })

    it('renders the start button with correct text when not enough characters selected', () => {
        render(
            <CharacterSelectionScreen
                selection={mockSelection}
                setSelection={mockSetSelection}
                isReady={true}
                onStart={mockOnStart}
                isBackgroundMusicPaused={false}
                setIsBackgroundMusicPaused={mockSetIsBackgroundMusicPaused}
            />,
        )

        // Find the start button
        const startButton = screen.getByText('Válasszatok ki legalább három karaktert')
        expect(startButton.hasAttribute('disabled')).toBe(true)
    })

    it('calls setIsBackgroundMusicPaused when music button is clicked', () => {
        render(
            <CharacterSelectionScreen
                selection={mockSelection}
                setSelection={mockSetSelection}
                isReady={true}
                onStart={mockOnStart}
                isBackgroundMusicPaused={false}
                setIsBackgroundMusicPaused={mockSetIsBackgroundMusicPaused}
            />,
        )

        // Find and click the music toggle button
        const musicButton = screen.getByText('Zene ki')
        fireEvent.click(musicButton)

        // Check if setIsBackgroundMusicPaused was called
        expect(mockSetIsBackgroundMusicPaused).toHaveBeenCalledTimes(1)
        expect(mockSetIsBackgroundMusicPaused).toHaveBeenCalledWith(true)
    })
})
