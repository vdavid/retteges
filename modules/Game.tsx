import styles from './Game.module.scss'
import { useCallback, useMemo, useState } from 'react'
import {
    getAllAudioNames,
    getAudioNamesToPlay,
    getTotalLength,
    musicUrl,
    useAllSnippets,
    useBackgroundMusic,
} from './audio'
import { characters, getEnabledStages, stages } from './game-logic'
import StageScreen from './/StageScreen'
import CharacterSelectionScreen from './/CharacterSelectionScreen'
import { useLocalStorage } from './util'

const breakBetweenAudioFilesMs = 5000

function Game() {
    const [firstInteractionHappened, setFirstInteractionHappened] = useState(false)
    const [started, setStarted] = useState(false)
    const [stageIndex, setStageIndex] = useState(0)
    const [characterSelection, setCharacterSelection] = useLocalStorage<boolean[]>(
        'characterSelection',
        characters.map(() => false),
    )
    const [isBackgroundMusicPaused, setIsBackgroundMusicPaused] = useLocalStorage<boolean>(
        'backgroundMusic',
        false,
    )
    const selectedCharacters = characters.filter((_, index) => characterSelection[index])
    const villagers = useMemo(() => {
        const selectedVillagers = selectedCharacters.filter((c) => c.type === 'villager')
        if (selectedVillagers.length) {
            return selectedVillagers
        }
        return characters.filter((c) => c.id === 'villager_5')
    }, [selectedCharacters])

    // Load audio snippets in the background
    const snippets = useAllSnippets(useMemo(() => getAllAudioNames(stages), []))
    const snippetsLoaded = Object.keys(snippets).length > 0

    const allStageLengthsMs = useMemo(
        () =>
            snippetsLoaded
                ? stages.map((stage) => {
                      const names = getAudioNamesToPlay(stage, selectedCharacters)
                      const totalAudioLength = getTotalLength(names.map((name) => snippets[name]))
                      const totalBreakLength =
                          ((stage.breaks ?? true) ? names.length - 1 : 0) * breakBetweenAudioFilesMs
                      return totalAudioLength + totalBreakLength
                  })
                : [],
        [snippetsLoaded, snippets, selectedCharacters],
    )

    // Start music at first click, and loop it
    useBackgroundMusic(musicUrl, 0.2, firstInteractionHappened, isBackgroundMusicPaused)

    const enabledStages = useMemo(
        () => getEnabledStages(stages, selectedCharacters),
        [selectedCharacters],
    )
    const enabledStageLengthsMs = useMemo(
        () => allStageLengthsMs.filter((_, index) => enabledStages.find((s) => s.index === index)),
        [allStageLengthsMs, enabledStages],
    )
    const nextStage = useCallback(() => {
        if (stageIndex < enabledStages.length - 1) {
            setStageIndex((i) => i + 1)
        } else {
            setStarted(false)
            setStageIndex(0)
        }
    }, [stageIndex, enabledStages])

    const onStart = (selection: boolean[]) => {
        setCharacterSelection(selection)
        setStarted(true)
        setStageIndex(0)
    }

    const currentStageSnippets = useMemo(
        () =>
            getAudioNamesToPlay(enabledStages[stageIndex], selectedCharacters).map(
                (name) => snippets[name],
            ),
        [enabledStages, stageIndex, selectedCharacters, snippets],
    )

    return (
        <div className={styles.page} onClick={() => setFirstInteractionHappened(true)}>
            {!started ? (
                <CharacterSelectionScreen
                    selection={characterSelection}
                    setSelection={setCharacterSelection}
                    isReady={snippetsLoaded}
                    onStart={onStart}
                    isBackgroundMusicPaused={isBackgroundMusicPaused}
                    setIsBackgroundMusicPaused={setIsBackgroundMusicPaused}
                />
            ) : (
                <StageScreen
                    audioSnippets={currentStageSnippets}
                    selectedCharacters={selectedCharacters}
                    enabledStages={enabledStages}
                    stageLengthsMs={enabledStageLengthsMs}
                    stageIndex={stageIndex}
                    nextStage={nextStage}
                    villagers={villagers}
                    breakBetweenAudioFilesMs={breakBetweenAudioFilesMs}
                />
            )}
        </div>
    )
}

export default Game
