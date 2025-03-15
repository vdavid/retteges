import { getDisplayableName, getEnabledStages, characters, stages, Character } from './game-logic'

describe('Game Logic', () => {
    describe('getDisplayableName', () => {
        it('returns Hungarian character names', () => {
            expect(getDisplayableName('werewolf')).toBe('vérfarkas')
            expect(getDisplayableName('villager')).toBe('falusi')
            expect(getDisplayableName('seer')).toBe('látnok')
        })
    })

    describe('getEnabledStages', () => {
        it('always includes start and end stages', () => {
            const selectedCharacters: Character[] = []
            const enabledStages = getEnabledStages(stages, selectedCharacters)

            // Find start and end stages
            const startStage = enabledStages.find((stage) => stage.type === 'start')
            const endStage = enabledStages.find((stage) => stage.type === 'end')

            expect(startStage).toBeDefined()
            expect(endStage).toBeDefined()
        })

        it('includes stages for selected character types', () => {
            // Select a werewolf character
            const werewolf = characters.find((c) => c.type === 'werewolf')
            const selectedCharacters = werewolf ? [werewolf] : []

            const enabledStages = getEnabledStages(stages, selectedCharacters)

            // Should include werewolf stage
            const werewolfStage = enabledStages.find((stage) => stage.type === 'werewolf')
            expect(werewolfStage).toBeDefined()
        })

        it('excludes stages for non-selected character types', () => {
            // Select only a villager character
            const villager = characters.find((c) => c.type === 'villager')
            const selectedCharacters = villager ? [villager] : []

            const enabledStages = getEnabledStages(stages, selectedCharacters)

            // Should not include werewolf stage
            const werewolfStage = enabledStages.find((stage) => stage.type === 'werewolf')
            expect(werewolfStage).toBeUndefined()
        })
    })
})
