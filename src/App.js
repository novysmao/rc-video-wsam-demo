import { useEffect, useRef, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import './App.scss';
import { Button, Upload, Space, Slider } from 'antd'
import useFFmpeg from './useFFmpeg';
import FileSaver from 'file-saver';

const OUTPUT_NAME = 'output.mp4'

function App() {
  const [videoSrc, setVideoSrc] = useState('')
  const videoRef = useRef(null)
  const [range, setRange] = useState([0, 0])
  const { fileData, getDuration, setInputFile, trim } = useFFmpeg()

  async function trimVideo() {
    try {
      const data = await trim(range[0], range[1] - range[0], OUTPUT_NAME)
      setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })))
    } catch (error) {
      console.error('Error during video trim:', error);
    }
  }

  const saveFile = () => {
    FileSaver.saveAs(videoSrc, OUTPUT_NAME)
  }

  const props = {
    name: 'file',
    action: '',
    showUploadList: false,
    beforeUpload: async (file) => {
      setInputFile(file)
      return false
    },
  }

  const onSliderChange = (value) => {
    setRange(value)
  };

  useEffect(() => {
    if (videoRef.current) {
      console.log(videoRef.current.duration)
    }
  }, [videoRef.current])

  useEffect(() => {
    if (fileData) {
      setVideoSrc(URL.createObjectURL(new Blob([fileData.buffer], { type: 'video/mp4' })))
    }
  }, [fileData])

  return (
    <div className="App">
      <div className='video-wrap'>
        {
          videoSrc &&
          <video src={videoSrc} controls ref={videoRef}></video>
        }
      </div>
      <div className='operator-wrap'>
        <Space>
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>上传MP4视频</Button>
          </Upload>
        </Space>
      </div>
      <div className='operator-wrap'>
        <Space>
          <div className='slider-wrap'>
            <Slider range value={range} min={0} max={getDuration()} onChange={onSliderChange}/>
          </div>
          <Button onClick={trimVideo}>裁剪</Button>
          <Button onClick={saveFile}>保存</Button>
        </Space>
      </div>
    </div>
  );
}

export default App;
