import styles from './CharacterSelectionScreen.module.scss'
import { characters } from './game-logic'
import classnames from 'classnames'
import CharacterCard from './CharacterCard'

export default function CharacterSelectionScreen({
    selection,
    setSelection,
    isReady,
    onStart,
    isBackgroundMusicPaused,
    setIsBackgroundMusicPaused,
}: {
    selection: boolean[]
    setSelection: (selection: boolean[] | ((selection: boolean[]) => boolean[])) => void
    isReady: boolean
    onStart: (selection: boolean[]) => void
    isBackgroundMusicPaused: boolean
    setIsBackgroundMusicPaused: (isBackgroundMusicPaused: boolean) => void
}) {
    const selectedCount = selection.filter((s) => s).length
    const buttonText =
        selectedCount < 3
            ? 'Válasszatok ki legalább három karaktert'
            : isReady
              ? 'Kezdjük is el akkor!'
              : 'Még várjunk egy picit, töltődnek a dolgok a háttérben...'
    return (
        <div className={styles.characterSelectionScreen}>
            <header>
                <h1>
                    Rettegés éjszakája
                    <br />
                    Veszelovszki Edition
                </h1>
            </header>
            <ul className={styles.characterCards}>
                {characters.map((c, i) => (
                    <li
                        key={c.id}
                        className={classnames(styles.characterCard, {
                            [styles.selected]: selection[i],
                        })}
                    >
                        <CharacterCard
                            character={c}
                            onClick={() =>
                                setSelection((s) => {
                                    const newSelection = [...s]
                                    newSelection[i] = !newSelection[i]
                                    return newSelection
                                })
                            }
                        />
                    </li>
                ))}
            </ul>
            <nav>
                <button onClick={() => onStart(selection)} disabled={!isReady || selectedCount < 3}>
                    {buttonText}
                </button>
                <button
                    onClick={() => setIsBackgroundMusicPaused(!isBackgroundMusicPaused)}
                    className={classnames(styles.toggleButton, {
                        [styles.active]: !isBackgroundMusicPaused,
                    })}
                >
                    {isBackgroundMusicPaused ? 'Zene be' : 'Zene ki'}
                </button>
            </nav>
        </div>
    )
}
