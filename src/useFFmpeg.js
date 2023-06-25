import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useEffect, useState } from 'react';
import { getInfo } from 'react-mediainfo'

export default function useFFmpeg() {
    const ffmpeg = createFFmpeg({ log: true });
    const [mediaInfo, setMediaInfo] = useState(null)
    const [inputFile, setInputFile] = useState(null)
    const [fileData, setFileData] = useState(null)

    const runCommand = async (start, duration, name, output) => await ffmpeg.run('-ss', start.toString(), '-t', duration.toString(), '-i', name, '-codec', 'copy', output);

    const loadFFmpeg = async () => {
        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load()
        }
    }
    const getDuration = () => {
        if (!mediaInfo) return 0
        const video = mediaInfo.track.find(v => v['@type'] === 'Video')
        return Number(video.Duration)
    }

    const trim = async (start, duration, output) => {
        await loadFFmpeg()
        ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));
        await runCommand(start, duration, inputFile.name, output)
        const data = ffmpeg.FS('readFile', output);
        return data
    }

    useEffect(() => {
        const init = async (inputFile) => {
            const { name } = inputFile
            
            await loadFFmpeg()
            await ffmpeg.FS('writeFile', name, await fetchFile(inputFile))
            const data = ffmpeg.FS('readFile', name)
            const { media } = await getInfo(inputFile)
            console.log(media)
            setMediaInfo(media)
            setFileData(data)
        }
        if (inputFile) {
            init(inputFile)
        }
    }, [inputFile])

    return {
        mediaInfo,
        getDuration,
        setInputFile,
        trim,
        fileData
    }
}