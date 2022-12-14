// @ts-ignore
import { PocketConnector } from '../../../modules/tools/PocketConnector.ts'
import Image from "next/image";
import styles from './index.module.scss'
import { useEffect, useMemo, useState } from "react";
import classnames from "classnames";

const breakBetweenAudioFilesMs = 5000;

type CharacterType =
    'doppelganger'
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

type Character = {
    id: string
    type: CharacterType
}

type StartStage = {
    type: 'start'
    if: 'player-count'
    few: string
    many: string
    all: string
    breaks?: boolean
}

type Stage = {
    type: CharacterType | 'start' | 'end'
    audioFiles: string[]
    if?: 'minion' | 'insomniac'
    breaks?: boolean
} | StartStage

// noinspection SpellCheckingInspection
const characters: Character[] = [
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

const stages: Stage[] = [
    //{ type: 'start', if: 'player-count', few: '0-start-few', many: '0-start-many', all: '0-start-all' },
    { type: 'doppelganger', audioFiles: ['1-doppelganger'] },
    { type: 'doppelganger', if: 'minion', audioFiles: ['2-doppelganger-1', '2-doppelganger-2', '2-doppelganger-3'] },
    { type: 'werewolf', audioFiles: ['3-werewolf-1', '3-werewolf-2'] },
    { type: 'minion', audioFiles: ['4-minion-1', '4-minion-2'] },
    { type: 'mason', audioFiles: ['5-mason-1', '5-mason-2'] },
    { type: 'seer', audioFiles: ['6-seer-1', '6-seer-2'] },
    { type: 'robber', audioFiles: ['7-robber-1', '7-robber-2'] },
    { type: 'troublemaker', audioFiles: ['8-troublemaker-1', '8-troublemaker-2'] },
    { type: 'drunk', audioFiles: ['9-drunk-1', '9-drunk-2'] },
    { type: 'insomniac', audioFiles: ['10-insomniac-1', '10-insomniac-2'] },
    { type: 'doppelganger', if: 'insomniac', audioFiles: ['11-doppelganger-1', '11-doppelganger-2'] },
    { type: 'end', audioFiles: ['12-end-1', '12-end-2'], breaks: false },
]

function getDisplayableName(type: CharacterType) {
    return {
        'doppelganger': 'alakváltó',
        'werewolf': 'vérfarkas',
        'minion': 'csatlós',
        'mason': 'szabadkőműves',
        'seer': 'látnok',
        'robber': 'rabló',
        'troublemaker': 'bajkeverő',
        'drunk': 'részeges',
        'insomniac': 'éjjeli bagoly',
        'villager': 'falusi',
        'hunter': 'vadász',
        'tanner': 'tímár'
    }[type]
}

function getCharacterImageUrl(character: Character) {
    return `/static/werewolf-game/images/${character.id}.jpg`
}

function getAudioUrl(filename: string) {
    return `/static/werewolf-game/audio/${filename}.m4a`;
}

function Page() {
    const [firstInteractionHappened, setFirstInteractionHappened] = useState(false);
    const [started, setStarted] = useState(false)
    const [stageIndex, setStageIndex] = useState(0)
    const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])

    const onStart = (selection: boolean[]) => {
        setSelectedCharacters(characters.filter((_, index) => selection[index]))
        setStarted(true);
        setStageIndex(0);
    };

    const stageFilter = (stage: Stage) =>
        stage.type === 'start'
        || stage.type === 'end'
        || (selectedCharacters.some(character => character.type === stage.type)
            && (stage.if !== 'minion' || selectedCharacters.some(c => c.type === 'minion'))
            && (stage.if !== 'insomniac' || selectedCharacters.some(c => c.type === 'insomniac')))

    const enabledStages = stages.filter(stageFilter)

    const nextStage = () => {
        if (stageIndex < enabledStages.length - 1) {
            setStageIndex(stage => stage + 1);
        } else {
            setStarted(false);
            setStageIndex(0);
        }
    };

    // Start music at first click, and loop it
    useEffect(() => {
        if (firstInteractionHappened) {
            const backgroundMusic = new Audio('/static/werewolf-game/audio/music.mp3');
            backgroundMusic.play().then(() => {});
            backgroundMusic.loop = true
        }
    }, [firstInteractionHappened])

    return <div className={styles.entirePage} onClick={() => setFirstInteractionHappened(true)}>
        {(!started ?
        <CharacterSelectionPage initialSelection={new Array(characters.length).fill(false)} onStart={onStart}/>
        : <GamePage selectedCharacters={selectedCharacters}
                    stage={enabledStages[stageIndex]} nextStage={nextStage}/>)}
    </div>
}

function getAudioItemsWithDuration(stage: Stage, selectedCharacters: Character[]): Promise<{audio: HTMLAudioElement, durationMs: number}[]> {
    const audioFiles = (stage.type === 'start') ? [selectedCharacters.length <= 6 ? (stage as StartStage).few : selectedCharacters.length < 18 ? (stage as StartStage).many : (stage as StartStage).all] : stage.audioFiles
    const audioFilePromises = audioFiles.map(filename => getAudioWithDuration(getAudioUrl(filename)))
    return Promise.all(audioFilePromises)
}

function getAudioWithDuration(url: string): Promise<{ audio: HTMLAudioElement, durationMs: number }> {
    return new Promise((resolve, reject) => {
        try {
            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () => {
                resolve({ audio, durationMs: audio.duration * 1000 })
            })
            audio.src = url
        } catch (e) {
            reject(e)
        }
    })
}

function CharacterSelectionPage({
                                    initialSelection,
                                    onStart
                                }: { initialSelection: boolean[], onStart: (selection: boolean[]) => void }) {
    const [selection, setSelection] = useState(initialSelection)
    return <div className={styles.game}>
        <header></header>
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
            <button onClick={() => onStart(selection)}>Kezdjük is el akkor</button>
        </nav>
    </div>
}

function GamePage({
                      selectedCharacters,
                      stage,
                      nextStage
                  }: { selectedCharacters: Character[], stage: Stage, nextStage: () => void }) {
    // Calculate total audio length
    const [startDateTime, setStartDateTime] = useState(new Date())
    const [canceled, setCanceled] = useState(false)
    useMemo(() => {
        // noinspection BadExpressionStatementJS It's here to let React know that we depend on the value
        stage;
        setStartDateTime(new Date());
    }, [stage])

    const [audioItemsWithDuration, setAudioItemsWithDuration] = useState<{ audio: HTMLAudioElement, durationMs: number }[]>([])
    const audioItems = audioItemsWithDuration.map(a => a.audio)
    useEffect(() => {
        getAudioItemsWithDuration(stage, selectedCharacters).then(setAudioItemsWithDuration)
    }, [stage, selectedCharacters])
    const totalAudioLengthMs = audioItemsWithDuration.reduce((sum, item) => sum + item.durationMs, 0)
    const totalLengthMs = totalAudioLengthMs + ((stage.breaks ?? true) ? 1 : 0) * breakBetweenAudioFilesMs

    useEffect(() => {
        async function playAudio() {
            for (const [index, audio] of audioItems.entries()) {
                audio.currentTime = 0
                await audio.play()
                await waitToFinish(audio)
                if (index === audioItems.length - 1) {
                    break;
                }
                if ((stage.breaks ?? true)) {
                    await wait(breakBetweenAudioFilesMs)
                }
            }
        }

        if (audioItems.length > 0 && !canceled) {
            playAudio().then(nextStage)
        }

        return () => {
            audioItems.forEach(audio => audio.pause())
        }
    }, [audioItems, canceled, nextStage, stage.breaks])

    return <div className={styles.game}>
        <header><h1>Rettegés</h1></header>
        {stage.type === 'start'
            ? <p>Kezdődik!</p>
            : (stage.type === 'end' ? <p>Vége...</p> : <ul>
                {selectedCharacters
                    .filter(c => c.type === stage.type)
                    .map(c => <CharacterCard key={c.id} character={c}/>)}
            </ul>)}
        <nav className={styles.timerNav}>
            <Timer totalMs={totalLengthMs} startDateTime={startDateTime}></Timer>
            <button onClick={() => {
                setCanceled(true)
            }}>Ugrás a kövire</button>
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

function formatTime(ms: number): string {
    return `${Math.floor(ms / 1000)}:${Math.floor(ms / 100) % 10}${Math.floor(ms / 10) % 10}`
}

// audio as a promise
function waitToFinish(audio: HTMLAudioElement) {
    return new Promise(resolve => {
        audio.onended = resolve
    })
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
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

//
// function CloseEyesInstructions() {
//     const [playing, toggle] = useAudio(url);
//
//     return <div>
//         <h2>MINDENKI csukja be a szemét</h2>
//     </div>
// }

export default Page
