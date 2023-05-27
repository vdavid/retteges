import { AudioSnippet, playAudio } from "./audio";
import { Character, getDisplayableName, Stage } from "./game-logic";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./StageScreen.module.scss";
import CharacterCard from "./CharacterCard";
import classnames from "classnames";

export default function StageScreen({
                                        audioSnippets,
                                        selectedCharacters,
                                        enabledStages,
                                        stageLengthsMs,
                                        stageIndex,
                                        nextStage,
                                        villagers,
                                        breakBetweenAudioFilesMs
                                    }:
                                        {
                                           audioSnippets: AudioSnippet[],
                                           selectedCharacters: Character[],
                                           enabledStages: Stage[],
                                           stageLengthsMs: number[],
                                           stageIndex: number,
                                           nextStage: () => void
                                           villagers: Character[],
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
    }, [abortController.signal, audioSnippets, breakBetweenAudioFilesMs, moveToNextStage, nextStage, stage.breaks])

    return <div className={styles.stageScreen}>
        <TopTimer
            enabledStages={enabledStages}
            stageLengthsMs={stageLengthsMs}
            startDateTime={startDateTime}
            stageIndex={stageIndex}/>
        <main>
        {stage.type === 'start'
            ? <Slideshow characters={villagers} totalMs={stageLengthsMs[stageIndex]}/>
            : (stage.type === 'end' ?
                <Slideshow characters={selectedCharacters} totalMs={stageLengthsMs[stageIndex]}/> : <>
                    <CharacterCard key={currentCharacter.id} character={currentCharacter}/>
                </>)}
        </main>
        <nav className={styles.timerNav}>
            <BottomTimer totalMs={stageLengthsMs[stageIndex]} startDateTime={startDateTime}></BottomTimer>
            <button onClick={moveToNextStage}>Ugrás a kövire</button>
        </nav>
    </div>
}

function Slideshow({ characters, totalMs }: { characters: Character[], totalMs: number }) {
    // Fade in the first villager, then second, up to the 5th
    const [activeIndex, setActiveIndex] = useState(0)
    const slideCount = characters.length
    useEffect(() => {
            const timeout = setTimeout(() => {
                setActiveIndex(i => i + 1)
            }, totalMs / slideCount)
            return () => clearTimeout(timeout)
        }
        , [totalMs, slideCount, activeIndex])
    const slides = useMemo(() => {
        const slides = characters.map((v, i) => <CharacterCard
            character={v}
            key={v.id}
            className={classnames({
                [styles.visible]: (i + 1) === activeIndex,
                [styles.upsideDown]: v.id === 'villager_5'
            })}/>)
        slides.unshift(<h2 key="starring" className={classnames({ [styles.visible]: activeIndex === 0 })}>Starring</h2>)
        return slides
    }, [activeIndex, characters])
    return <div className={styles.slideshow}>
        {slides}
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
