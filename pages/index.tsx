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
} from "../../modules/werewolf-game/audio"
import {
    Character,
    characters,
    getDisplayableName,
    getEnabledStages,
    Stage,
    stages
} from "../../modules/werewolf-game/game"

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
    useBackgroundMusic(musicUrl, firstInteractionHappened)

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
                nextStage={nextStage}/>)}
    </div>
}


function CharacterSelectionScreen({
                                      initialSelection,
                                      isReady,
                                      onStart
                                  }: { initialSelection: boolean[], isReady: boolean, onStart: (selection: boolean[]) => void }) {
    const [selection, setSelection] = useState(initialSelection)
    const selectedCount = selection.filter(s => s).length
    const buttonText = (selectedCount < 3) ? 'Válasszatok ki legalább három karaktert'
        : (isReady ? 'Kezdjük is el akkor' : 'Még várjunk egy picit, töltődnek a dolgok a háttérben...');
    return <div className={styles.characterSelectionScreen}>
        <header><h1>Rettegés éjszakája – Veszelovszki edition</h1></header>
        <ul className={styles.characterCards}>
            {characters.map((c, i) =>
                <li key={c.id} className={classnames(styles.characterCard, { [styles.selected]: selection[i] })}>
                    <CharacterCard
                        character={c}
                        onClick={() => setSelection(s => {
                            const newSelection = [...s]
                            newSelection[i] = !newSelection[i]
                            return newSelection
                        })}/>
                </li>)}
        </ul>
        <nav>
            <button onClick={() => onStart(selection)} disabled={!isReady || selectedCount < 3}>{buttonText}</button>
        </nav>
    </div>
}

function GameScreen({
                        audioSnippets,
                        selectedCharacters,
                        enabledStages,
                        stageLengthsMs,
                        stageIndex,
                        nextStage
                    }:
                        {
                            audioSnippets: AudioSnippet[],
                            selectedCharacters: Character[],
                            enabledStages: Stage[],
                            stageLengthsMs: number[],
                            stageIndex: number,
                            nextStage: () => void
                        }) {
    const [startDateTime, setStartDateTime] = useState(new Date())
    const [abortController, setAbortController] = useState<AbortController>(new AbortController())
    const stage = enabledStages[stageIndex]
    const currentCharacter = selectedCharacters.filter(c => c.type === stage.type)[0]
    useEffect(() => {
        setStartDateTime(new Date())
    }, [stageIndex])

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
        <TopTimer
            enabledStages={enabledStages}
            stageLengthsMs={stageLengthsMs}
            startDateTime={startDateTime}
            stageIndex={stageIndex}/>
        <main>
        {stage.type === 'start'
            ? <p>Kezdődik!</p>
            : (stage.type === 'end' ? <p>Vége...</p> : <ul>
                <CharacterCard key={currentCharacter.id} character={currentCharacter}/>
            </ul>)}
        </main>
        <nav className={styles.timerNav}>
            <Timer totalMs={stageLengthsMs[stageIndex]} startDateTime={startDateTime}></Timer>
            <button onClick={moveToNextStage}>Ugrás a kövire</button>
        </nav>
    </div>
}

function TopTimer({ enabledStages, stageLengthsMs, startDateTime, stageIndex }: {
    enabledStages: Stage[],
    stageLengthsMs: number[]
    startDateTime: Date
    stageIndex: number,
}) {
    const [elapsedMs, setElapsedMs] = useState(0)
    useEffect(() => {
        setElapsedMs(0);
    }, [stageIndex])
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMs(new Date().getTime() - startDateTime.getTime())
        }, 100)
        return () => clearInterval(interval)
    }, [startDateTime])

    return <header>
        {enabledStages.map((s, i) => {
            const progress = i < stageIndex ? 1 : (i === stageIndex ? (elapsedMs / stageLengthsMs[i]) : 0)
            return <div key={i} style={{ flexBasis: stageLengthsMs[i] }}>
                {(s.type === 'start' || s.type === 'end') ? s.type : getDisplayableName(s.type)}
                <div className={styles.progress} style={{ width: `${progress * 100}%` }}/>
            </div>
        })}
    </header>
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

function CharacterCard({ character, onClick }: { character: Character, onClick?: () => void }) {
    return <Image src={getCharacterImageUrl(character)}
                  alt={getDisplayableName(character.type)}
                  width={411}
                  height={561}
                  className={styles.characterImage}
                  priority={true}
                  onClick={onClick}/>
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
