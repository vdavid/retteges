import { getAllAudioNames, getAudioNamesToPlay, getTotalLength, AudioSnippet } from './audio'
import { stages, characters, StartStage, NormalStage } from './game-logic'

describe('Audio Functions', () => {
    describe('getAllAudioNames', () => {
        it('returns all audio names from stages', () => {
            const audioNames = getAllAudioNames(stages)

            // Check that we have audio names
            expect(audioNames.length).toBeGreaterThan(0)

            // Check that all items are strings
            audioNames.forEach((name) => {
                expect(typeof name).toBe('string')
            })
        })
    })

    describe('getAudioNamesToPlay', () => {
        it('returns correct audio for start stage with few players', () => {
            const startStage = stages.find((s) => s.type === 'start') as StartStage
            if (!startStage) {
                throw new Error('Start stage not found')
            }

            const selectedCharacters = characters.slice(0, 5) // Few players
            const audioNames = getAudioNamesToPlay(startStage, selectedCharacters)

            expect(audioNames.length).toBe(1)
            expect(audioNames[0]).toBe(startStage.few)
        })

        it('returns correct audio for character stages', () => {
            const werewolfStage = stages.find((s) => s.type === 'werewolf') as NormalStage

            if (!werewolfStage) {
                throw new Error('Werewolf stage not found')
            }

            const audioNames = getAudioNamesToPlay(werewolfStage, [])

            // For non-start stages, it should return the audioFiles array
            expect(audioNames).toEqual(werewolfStage.audioFiles || [])
        })
    })

    describe('getTotalLength', () => {
        it('returns sum of all snippet durations', () => {
            const snippets: AudioSnippet[] = [
                { name: 'test1', audio: new Audio(), durationMs: 1000 },
                { name: 'test2', audio: new Audio(), durationMs: 2000 },
                { name: 'test3', audio: new Audio(), durationMs: 3000 },
            ]

            const totalLength = getTotalLength(snippets)

            expect(totalLength).toBe(6000)
        })

        it('returns 0 for empty snippets array', () => {
            const totalLength = getTotalLength([])

            expect(totalLength).toBe(0)
        })
    })
})
