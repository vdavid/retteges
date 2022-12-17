// @ts-ignore
import { PocketConnector } from '../../../modules/tools/PocketConnector.ts'
import styles from '../../modules/werewolf-game/index.module.scss'
import { useCallback, useMemo, useState } from "react"
import { getAllAudioNames, getAudioNamesToPlay, getTotalLength, musicUrl, useAllSnippets, useBackgroundMusic } from "../../modules/werewolf-game/audio"
import { characters, getEnabledStages, stages } from "../../modules/werewolf-game/game"
import GameScreen from "../../modules/werewolf-game/GameScreen";
import CharacterSelectionScreen from "../../modules/werewolf-game/CharacterSelectionScreen";

const breakBetweenAudioFilesMs = 5000

function Page() {
    const [firstInteractionHappened, setFirstInteractionHappened] = useState(false)
    const [started, setStarted] = useState(false)
    const [stageIndex, setStageIndex] = useState(0)
    const [characterSelection, setCharacterSelection] = useState(characters.map(c => c.id === 'werewolf'))
    const selectedCharacters = characters.filter((_, index) => characterSelection[index])

    // Load audio snippets in the background
    const snippets = useAllSnippets(useMemo(() => getAllAudioNames(stages), []))
    const snippetsLoaded = Object.keys(snippets).length > 0;

    const allStageLengthsMs = useMemo(() => snippetsLoaded ? stages.map(
            (stage) => {
                const names = getAudioNamesToPlay(stage, selectedCharacters);
                const totalAudioLength = getTotalLength(names.map(name => snippets[name]));
                const totalBreakLength = ((stage.breaks ?? true) ? (names.length - 1) : 0) * breakBetweenAudioFilesMs;
                return totalAudioLength + totalBreakLength;
            }) : [],
        [snippetsLoaded, snippets, selectedCharacters]
    )

    // Start music at first click, and loop it
    useBackgroundMusic(musicUrl, 0.5, firstInteractionHappened)

    const enabledStages = useMemo(() => getEnabledStages(stages, selectedCharacters), [selectedCharacters])
    const enabledStageLengthsMs = useMemo(() => allStageLengthsMs.filter(
            (_, index) => enabledStages.find(s => s.index === index)),
        [allStageLengthsMs, enabledStages]
    )
    const nextStage = useCallback(() => {
        if (stageIndex < enabledStages.length - 1) {
            setStageIndex(i => i + 1)
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
        () => getAudioNamesToPlay(enabledStages[stageIndex], selectedCharacters).map(name => snippets[name]),
        [enabledStages, stageIndex, selectedCharacters, snippets]
    )

    return <div className={styles.entirePage} onClick={() => setFirstInteractionHappened(true)}>
        {(!started ?
            <CharacterSelectionScreen
                initialSelection={characterSelection}
                isReady={snippetsLoaded}
                onStart={onStart}/>
            : <GameScreen
                audioSnippets={currentStageSnippets}
                selectedCharacters={selectedCharacters}
                enabledStages={enabledStages}
                stageLengthsMs={enabledStageLengthsMs}
                stageIndex={stageIndex}
                nextStage={nextStage}
                breakBetweenAudioFilesMs={breakBetweenAudioFilesMs}/>)}
    </div>
}

export default Page
