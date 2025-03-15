import { useEffect, useState } from "react";
import { Character, Stage, StartStage } from "./game-logic";
import { wait } from "./util";

export const musicUrl = '/retteges/audio/music.mp3'
export type AudioSnippet = { name: string, audio: HTMLAudioElement, durationMs: number };

export const useBackgroundMusic = (url: string, volume: number, firstInteractionHappened: boolean, paused: boolean): void => {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (firstInteractionHappened) {
            let currentAudio = audio;
            if (!currentAudio) {
                currentAudio = new Audio(url);
                currentAudio.loop = true
                setAudio(currentAudio);
            }
            currentAudio.volume = volume
            if (!paused) {
                // noinspection JSIgnoredPromiseFromCall
                currentAudio.play();
            } else {
                currentAudio.pause();
            }
        }
    }, [audio, firstInteractionHappened, paused, url, volume])
}

export function getAllAudioNames(stages: Stage[]): string[] {
    return stages.map((stage: Stage) => {
        if (stage.type === 'start') {
            return [(stage as StartStage).few, (stage as StartStage).many, (stage as StartStage).all];
        } else {
            return stage.audioFiles;
        }
    }).flat()
}

export function getAudioNamesToPlay(stage: Stage, selectedCharacters: Character[]): string[] {
    return (stage.type === 'start')
        ? [selectedCharacters.length <= 6 ? (stage as StartStage).few
            : selectedCharacters.length < 18 ? (stage as StartStage).many
                : (stage as StartStage).all]
        : (stage.audioFiles || [])
}

export function getTotalLength(snippets: AudioSnippet[]): number {
    return snippets.reduce((total, snippet) => total + snippet.durationMs, 0)
}

export async function playAudio(snippets: AudioSnippet[], breakMs: number, abortSignal: AbortSignal): Promise<boolean> {
    let canceled = false;
    let abortEventListener: ((this: AbortSignal, ev: AbortSignalEventMap['abort']) => any) | undefined;
    for (const [index, snippet] of snippets.entries()) {
        snippet.audio.currentTime = 0;
        await snippet.audio.play()
        if (abortEventListener) {
            abortSignal.removeEventListener("abort", abortEventListener);
        }
        abortEventListener = () => {
            snippet.audio.pause();
            canceled = true;
        };
        abortSignal.addEventListener("abort", abortEventListener);
        await waitToFinish(snippet.audio)
        if (index === snippets.length - 1) {
            break;
        }
        await wait(breakMs)
        if (canceled) {
            return true
        }
    }
    return false
}


export function useAllSnippets(names: string[]): Record<string, AudioSnippet> {
    const [snippets, setSnippets] = useState<Record<string, AudioSnippet>>({});
    useEffect(() => {
        loadSnippets(names).then(setSnippets)
    }, [names])
    return snippets;
}

export async function loadSnippets(names: string[]): Promise<Record<string, AudioSnippet>> {
    const promises = names.map(name => loadSnippet(name));
    const snippets = await Promise.all(promises);
    return snippets.reduce((acc, snippet) => ({ ...acc, [snippet.name]: snippet }), {})
}

function loadSnippet(name: string): Promise<AudioSnippet> {
    return new Promise((resolve, reject) => {
        try {
            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () => {
                resolve({ name, audio, durationMs: audio.duration * 1000 })
            })
            audio.src = getAudioUrl(name)
        } catch (e) {
            reject(e)
        }
    })
}

function getAudioUrl(name: string) {
    return `/retteges/audio/${name}.m4a`
}

// Audio as a promise
export function waitToFinish(audio: HTMLAudioElement) {
    return new Promise(resolve => {
        audio.onended = resolve
    })
}
