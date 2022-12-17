import { AudioSnippet, playAudio } from "../../modules/werewolf-game/audio";
import { Character, getDisplayableName, Stage } from "../../modules/werewolf-game/game";
import { useCallback, useEffect, useState } from "react";
import styles from "../../modules/werewolf-game/index.module.scss";
import CharacterCard from "./CharacterCard";

export default function GameScreen({
                                       audioSnippets,
                                       selectedCharacters,
                                       enabledStages,
                                       stageLengthsMs,
                                       stageIndex,
                                       nextStage,
                                       breakBetweenAudioFilesMs
                                   }:
                                       {
                                           audioSnippets: AudioSnippet[],
                                           selectedCharacters: Character[],
                                           enabledStages: Stage[],
                                           stageLengthsMs: number[],
                                           stageIndex: number,
                                           nextStage: () => void
                                           breakBetweenAudioFilesMs: number
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
        playAudio(audioSnippets, (stage.breaks ?? true) ? breakBetweenAudioFilesMs : 0, abortController.signal).then(canceled => {
            if (!canceled) {
                moveToNextStage()
            }
        })

        return () => {
            audioSnippets.forEach(s => s.audio.pause())

        }
    }, [abortController.signal, audioSnippets, breakBetweenAudioFilesMs, moveToNextStage, nextStage, stage.breaks])

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
            <BottomTimer totalMs={stageLengthsMs[stageIndex]} startDateTime={startDateTime}></BottomTimer>
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
            setElapsedMs(Math.max(new Date().getTime() - startDateTime.getTime(), 0))
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

function BottomTimer({ totalMs, startDateTime }: { totalMs: number, startDateTime: Date }) {
    const [elapsedMs, setElapsedMs] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMs(Math.min(new Date().getTime() - startDateTime.getTime(), totalMs))
        }, 100)
        return () => clearInterval(interval)
    }, [startDateTime, totalMs])
    return <div className={styles.timer}>{formatTime(totalMs - elapsedMs)}</div>
}

// ss:ms
function formatTime(ms: number): string {
    return `${Math.floor(ms / 1000)}.${Math.floor(ms / 100) % 10}${Math.floor(ms / 10) % 10}`
}
