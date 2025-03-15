export type CharacterType =
    | 'doppelganger'
    | 'werewolf'
    | 'minion'
    | 'mason'
    | 'seer'
    | 'robber'
    | 'troublemaker'
    | 'drunk'
    | 'insomniac'
    | 'villager'
    | 'hunter'
    | 'tanner'

export type Character = {
    id: string
    type: CharacterType
}

export type StartStage = {
    index: 0
    type: 'start'
    if: 'player-count'
    few: string
    many: string
    all: string
    breaks?: boolean
}

export type NormalStage = {
    index: number
    type: CharacterType | 'start' | 'end'
    audioFiles: string[]
    if?: 'minion' | 'insomniac'
    breaks?: boolean
}
export type Stage = NormalStage | StartStage

export const characters: Character[] = [
    { id: 'doppelganger', type: 'doppelganger' },
    { id: 'werewolf', type: 'werewolf' },
    { id: 'werewolf_2', type: 'werewolf' },
    { id: 'minion', type: 'minion' },
    { id: 'mason', type: 'mason' },
    { id: 'mason_2', type: 'mason' },
    { id: 'seer', type: 'seer' },
    { id: 'robber', type: 'robber' },
    { id: 'troublemaker', type: 'troublemaker' },
    { id: 'drunk', type: 'drunk' },
    { id: 'insomniac', type: 'insomniac' },
    { id: 'villager', type: 'villager' },
    { id: 'villager_2', type: 'villager' },
    { id: 'villager_3', type: 'villager' },
    { id: 'villager_4', type: 'villager' },
    { id: 'villager_5', type: 'villager' },
    { id: 'hunter', type: 'hunter' },
    { id: 'tanner', type: 'tanner' },
]

export const stages: Stage[] = [
    {
        index: 0,
        type: 'start',
        if: 'player-count',
        few: '0-start-few',
        many: '0-start-many',
        all: '0-start-all',
    },
    { index: 1, type: 'doppelganger', audioFiles: ['1-doppelganger'] },
    {
        index: 2,
        type: 'doppelganger',
        if: 'minion',
        audioFiles: ['2-doppelganger-1', '2-doppelganger-2', '2-doppelganger-3'],
    },
    { index: 3, type: 'werewolf', audioFiles: ['3-werewolf-1', '3-werewolf-2'] },
    { index: 4, type: 'minion', audioFiles: ['4-minion-1', '4-minion-2'] },
    { index: 5, type: 'mason', audioFiles: ['5-mason-1', '5-mason-2'] },
    { index: 6, type: 'seer', audioFiles: ['6-seer-1', '6-seer-2'] },
    { index: 7, type: 'robber', audioFiles: ['7-robber-1', '7-robber-2'] },
    { index: 8, type: 'troublemaker', audioFiles: ['8-troublemaker-1', '8-troublemaker-2'] },
    { index: 9, type: 'drunk', audioFiles: ['9-drunk-1', '9-drunk-2'] },
    { index: 10, type: 'insomniac', audioFiles: ['10-insomniac-1', '10-insomniac-2'] },
    {
        index: 11,
        type: 'doppelganger',
        if: 'insomniac',
        audioFiles: ['11-doppelganger-1', '11-doppelganger-2'],
    },
    { index: 12, type: 'end', audioFiles: ['12-end-1', '12-end-2'], breaks: false },
]

export function getDisplayableName(type: CharacterType) {
    // noinspection SpellCheckingInspection
    return {
        doppelganger: 'alakváltó',
        werewolf: 'vérfarkas',
        minion: 'csatlós',
        mason: 'szabadkőműves',
        seer: 'látnok',
        robber: 'rabló',
        troublemaker: 'bajkeverő',
        drunk: 'részeges',
        insomniac: 'éjjeli bagoly',
        villager: 'falusi',
        hunter: 'vadász',
        tanner: 'tímár',
    }[type]
}

export function getEnabledStages(stages: Stage[], selectedCharacters: Character[]) {
    const stageFilter = (stage: Stage) =>
        stage.type === 'start' ||
        stage.type === 'end' ||
        (selectedCharacters.some((character) => character.type === stage.type) &&
            (stage.if !== 'minion' || selectedCharacters.some((c) => c.type === 'minion')) &&
            (stage.if !== 'insomniac' || selectedCharacters.some((c) => c.type === 'insomniac')))
    return stages.filter(stageFilter)
}
