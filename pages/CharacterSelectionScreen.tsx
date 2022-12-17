import { useState } from "react";
import styles from "../../modules/werewolf-game/index.module.scss";
import { characters } from "../../modules/werewolf-game/game";
import classnames from "classnames";
import CharacterCard from "./CharacterCard";

export default function CharacterSelectionScreen({
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
