// @ts-ignore
import { PocketConnector } from '../../../modules/tools/PocketConnector.ts'
import Image from "next/image"
import styles from './index.module.scss'
import { useCallback, useEffect, useMemo, useState } from "react"
import classnames from "classnames"
import {
    AudioSnippet,
    getAllAudioNames,
    getAudioNamesToPlay,
    getTotalLength,
    musicUrl,
    playAudio,
    useAllSnippets,
    useBackgroundMusic
} from "./audio"
import { Character, characters, getDisplayableName, getEnabledStages, Stage, stages } from "./game"

const breakBetweenAudioFilesMs = 5000

function Page() {
    const [firstInteractionHappened, setFirstInteractionHappened] = useState(false)
    const [started, setStarted] = useState(false)
    const [stageIndex, setStageIndex] = useState(0)
    const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])

    // Load audio snippets in the background
    const snippets = useAllSnippets(useMemo(() => getAllAudioNames(stages), []))

    // Start music at first click, and loop it
    useBackgroundMusic(musicUrl, firstInteractionHappened)

    const enabledStages = useMemo(() => getEnabledStages(stages, selectedCharacters), [selectedCharacters])
    const nextStage = useCallback(() => {
        if (stageIndex < enabledStages.length - 1) {
            setStageIndex(i => i + 1)
        } else {
            setStarted(false)
            setStageIndex(0)
        }
    }, [stageIndex, enabledStages])

    const onStart = (selection: boolean[]) => {
        setSelectedCharacters(characters.filter((_, index) => selection[index]))
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
                initialSelection={new Array(characters.length).fill(false)}
                isReady={Object.keys(snippets).length > 0}
                onStart={onStart}/>
            : <GameScreen
                audioSnippets={currentStageSnippets}
                selectedCharacters={selectedCharacters}
                enabledStages={enabledStages}
                stageIndex={stageIndex}
                nextStage={nextStage}/>)}
    </div>
}


function CharacterSelectionScreen({
                                      initialSelection,
                                      isReady,
                                      onStart
                                  }: { initialSelection: boolean[], isReady: boolean, onStart: (selection: boolean[]) => void }) {
    const [selection, setSelection] = useState(initialSelection)
    return <div className={styles.characterSelectionScreen}>
        <header><h1>Rettegés!! Valami címet ide</h1></header>
        <ul className={styles.characterCards}>
            {characters.map((c, i) =>
                <CharacterCard
                    character={c}
                    key={c.id}
                    selected={selection[i]}
                    toggleSelected={() => setSelection(s => {
                        const newSelection = [...s]
                        newSelection[i] = !newSelection[i]
                        return newSelection
                    })}/>)}
        </ul>
        <nav>
            <button onClick={() => onStart(selection)} disabled={!isReady}>Kezdjük is el akkor</button>
        </nav>
    </div>
}

function GameScreen({
                        audioSnippets,
                        selectedCharacters,
                        enabledStages,
                        stageIndex,
                        nextStage
                    }:
                        {
                            audioSnippets: AudioSnippet[],
                            selectedCharacters: Character[],
                            enabledStages: Stage[],
                            stageIndex: number,
                            nextStage: () => void
                        }) {
    const [startDateTime, setStartDateTime] = useState(new Date())
    const [abortController, setAbortController] = useState<AbortController>(new AbortController())
    const stage = enabledStages[stageIndex]
    useEffect(() => {
        setStartDateTime(new Date())
    }, [stageIndex])

    const totalLengthMs = useMemo(
        () => getTotalLength(audioSnippets) + ((stage.breaks ?? true) ? 1 : 0) * breakBetweenAudioFilesMs,
        [audioSnippets, stage.breaks]
    )

    const moveToNextStage = useCallback(() => {
        abortController.abort()
        setAbortController(new AbortController())
        nextStage()
    }, [abortController, nextStage])

    useEffect(() => {
        playAudio(audioSnippets, stage.breaks ? breakBetweenAudioFilesMs : 0, abortController.signal).then(() => {
            moveToNextStage()
        })

        return () => {
            audioSnippets.forEach(s => s.audio.pause())

        }
    }, [abortController.signal, audioSnippets, moveToNextStage, nextStage, stage.breaks])

    return <div className={styles.gameScreen}>
        <header>
            {enabledStages.map((s, i) => {
                return <div
                    key={i}>{(s.type === 'start' || s.type === 'end') ? s.type : getDisplayableName(s.type)}</div>
            })}
        </header>
        {stage.type === 'start'
            ? <p>Kezdődik!</p>
            : (stage.type === 'end' ? <p>Vége...</p> : <ul>
                {selectedCharacters
                    .filter(c => c.type === stage.type)
                    .map(c => <CharacterCard key={c.id} character={c}/>)}
            </ul>)}
        <nav className={styles.timerNav}>
            <Timer totalMs={totalLengthMs} startDateTime={startDateTime}></Timer>
            <button onClick={moveToNextStage}>Ugrás a kövire
            </button>
        </nav>
    </div>
}

function Timer({ totalMs, startDateTime }: { totalMs: number, startDateTime: Date }) {
    const [elapsedMs, setElapsedMs] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMs(new Date().getTime() - startDateTime.getTime())
        }, 100)
        return () => clearInterval(interval)
    }, [startDateTime])
    return <div className={styles.timer}>
        <span>{formatTime(totalMs - elapsedMs)}</span>
        <div style={{ width: `${78 * elapsedMs / totalMs}%` }}></div>
    </div>
}

// ss:ms
function formatTime(ms: number): string {
    return `${Math.floor(ms / 1000)}.${Math.floor(ms / 100) % 10}${Math.floor(ms / 10) % 10}`
}

function CharacterCard({
                           character,
                           selected,
                           toggleSelected
                       }: { character: Character, selected?: boolean, toggleSelected?: () => void }) {
    return <li className={classnames(styles.characterCard, { [styles.interactive]: !!toggleSelected })}>
        <Image src={getCharacterImageUrl(character)}
               alt={getDisplayableName(character.type)}
               width={411}
               height={561}
               className={selected ? styles.selected : ''}
               priority={true}
               onClick={toggleSelected}/>
    </li>
}

function getCharacterImageUrl(character: Character): string {
    return `/werewolf-game/images/${character.id}.jpg`
}


//
// function CloseEyesInstructions() {
//     const [playing, toggle] = useAudio(url)
//
//     return <div>
//         <h2>MINDENKI csukja be a szemét</h2>
//     </div>
// }

export default Page
