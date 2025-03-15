import { Character, getDisplayableName } from "./game-logic";
import Image from "next/image";
import styles from "./CharacterCard.module.scss";
import classnames from "classnames";

export default function CharacterCard({ character, className, onClick }:
                                          { character: Character, className?: string, onClick?: () => void }) {
    return <Image src={getCharacterImageUrl(character)}
                  alt={getDisplayableName(character.type)}
                  width={411}
                  height={561}
                  className={classnames(className, styles.characterImage)}
                  priority={true}
                  onClick={onClick}/>
}

function getCharacterImageUrl(character: Character): string {
    return `/retteges/images/${character.id}.jpg`
}

