import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import StageScreen from './StageScreen'
import { characters, stages } from './game-logic'

describe('StageScreen Component', () => {
    const mockNextStage = jest.fn()
    const enabledStages = [stages[0], stages[1]] // Use the first two stages
    const selectedCharacters = characters.slice(0, 3) // Use the first three characters
    const stageLengthsMs = [10000, 10000]
    const villagers = characters.filter((c) => c.type === 'villager')
    const breakBetweenAudioFilesMs = 5000

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders without crashing', () => {
        render(
            <StageScreen
                audioSnippets={[]}
                selectedCharacters={selectedCharacters}
                enabledStages={enabledStages}
                stageLengthsMs={stageLengthsMs}
                stageIndex={0}
                nextStage={mockNextStage}
                villagers={villagers}
                breakBetweenAudioFilesMs={breakBetweenAudioFilesMs}
            />,
        )

        // Just check that it renders without crashing
        expect(true).toBeTruthy()
    })

    it('calls nextStage when next button is clicked', () => {
        render(
            <StageScreen
                audioSnippets={[]}
                selectedCharacters={selectedCharacters}
                enabledStages={enabledStages}
                stageLengthsMs={stageLengthsMs}
                stageIndex={0}
                nextStage={mockNextStage}
                villagers={villagers}
                breakBetweenAudioFilesMs={breakBetweenAudioFilesMs}
            />,
        )

        // Find and click the next button
        const nextButton = screen.getByText(/Ugrás a kövire/i)
        fireEvent.click(nextButton)

        // Check if nextStage was called
        expect(mockNextStage).toHaveBeenCalledTimes(1)
    })
})
