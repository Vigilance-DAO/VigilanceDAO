import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Form, Button, Space, Tooltip } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import { UploadOutlined, ExpandOutlined } from '@ant-design/icons';
import { UploadRequestOption } from 'rc-upload/lib/interface';

declare const chrome: any;

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const Evidence: React.FC<{fileList: UploadFile[], setFileList: Function}> = (inputs) => {
    const {fileList, setFileList} = inputs
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [emptyList, setEmptyList] = useState<UploadFile[]>([]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ file: newFile }) => {
        console.log('new upload file', newFile)
        let _fileList: UploadFile[] = [...fileList]
        let existingUIDs = _fileList.map(_file => _file.uid)
        if(existingUIDs.includes(newFile.uid)) {
            let indexOf = existingUIDs.indexOf(newFile.uid)
            if(newFile.status == 'error') {
                newFile.status = 'done' // Overwrite necessary
            }
            _fileList[indexOf] = newFile
        } else {
            _fileList.push(newFile)
        }
        setFileList(_fileList)
    }

    const uploadButton = (
        <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
        </div>  
    );

    if(chrome && chrome.runtime) {
        chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
            console.log('on message', msg, sender)
            if(msg && msg.type == "screenshot"){
                console.log('recieved screenshot')
                if(msg.data.isSuccess) {
                    let _fileList: UploadFile[] = [...fileList]
                    _fileList.push({
                        uid: `screenshot_${_fileList.length}`,
                        name: `evidence_${_fileList.length}.jpg`,
                        status: 'done',
                        url: msg.data.imageUri,
                    })
                    setFileList(_fileList)
                } else {
                    alert(msg.data.error)
                }
            }
        });
    }

    const takeScreenshot = () => {
        if(chrome && chrome.runtime) {
            console.log('runtime', chrome.runtime.sendMessage)
            chrome.runtime.sendMessage({type: "take-screenshot"});
        }
    }

    const uploadToIPFS = (file: RcFile) => {
        console.log('upload to IPFS', file)
        return ''
    }

    const getLabel = () => {
        return (<Space 
                style={{paddingBottom: '10px'}}
            >
            <b>Upload evidences</b>
            <Tooltip title="Upload image">
                <Upload 
                
                    fileList={fileList} 
                    maxCount={5} 
                    action={uploadToIPFS}
                    showUploadList={false}
                    multiple={true} 
                    onChange={handleChange}
                >
                    <Button type="primary" shape="circle" icon={<UploadOutlined />} size='middle' />
                </Upload>
            </Tooltip>
            <Tooltip title="Screenshot website">
                <Button onClick={takeScreenshot} type="primary" shape="circle" icon={<ExpandOutlined />} size='middle' />
            </Tooltip>

        </Space>)
    }

    const handleRemove = (file: UploadFile) => {
        let _fileList: UploadFile[] = [...fileList]
        let existingUIDs = _fileList.map(_file => _file.uid)
        let indexOf = existingUIDs.indexOf(file.uid)
        if(indexOf >=0) {
            _fileList.splice(indexOf, 1)
            setFileList(_fileList)
        }
    }

  return (
    <Form.Item
        label={getLabel()}
        name="evidences"
        rules={[{ required: true }]}
    >
        <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onRemove={handleRemove}
            maxCount={5}
        >
        </Upload>

        <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
    </Form.Item>
  );
};

export default Evidence;