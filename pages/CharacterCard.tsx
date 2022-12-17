import { Character, getDisplayableName } from "../../modules/werewolf-game/game";
import Image from "next/image";
import styles from "../../modules/werewolf-game/index.module.scss";

export default function CharacterCard({ character, onClick }: { character: Character, onClick?: () => void }) {
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

