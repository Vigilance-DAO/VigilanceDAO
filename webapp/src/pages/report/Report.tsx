import React, { useEffect, useState } from 'react';
import './Report.css';
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile } from "react-moralis";
import { useLocation } from "react-router-dom";
import Web3Service from '../../services/web3Service';
import ReportSubmit from './ReportSubmit';

function Report(props: any) {
    console.log('props', props, process.env)
    const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { initialize, web3, isInitialized, isAuthenticated } = useMoralis();

    const { search } = useLocation();
    function useQuery(search: string) {
        return React.useMemo(() => new URLSearchParams(search), [search]);
    }
    let query = useQuery(search);
    const [domain, setDomain] = useState('')
    const [comments, setComments] = useState('')
    const [isScam, setIsScam] = useState(true)
    
    let _domain = query.get('domain')

    useEffect(()=>{
        if(_domain)
            setDomain(_domain)    
    }, [_domain])
    

    const fileTypes = ["JPEG", "PNG"];

    const [files, setFile] = useState<any[]>([]);
    const handleChange = (file: any): any => {
        setFile(file);
    };
    

    const selectedFiles = () => {
        let elements: any[] = []
        console.log(files)
        for(let key in files) {
            if(files.hasOwnProperty(key)) {
            // : "no files uploaded yet"}</p>
                let file = files[key]
                elements.push(<p key={file.name}>File name: ${file.name}</p>)
            }
        }
        return elements
    }

    

    return (
        <div className="report">
            <Grid container md={3} key={'1'} sx={{float: 'left'}}>.</Grid>
            <Grid container md={6} key={'2'} sx={{float: 'left'}}>
                <Paper sx={{padding: '20px', backgroundColor: '#f7f7f7', width: '100%', border: '1px solid #ebebeb'}}>
                    <h1>Report scam domain</h1>
                    <TextField value={domain} sx={{width: '100%'}} id="outlined-basic" label="domain (without sub-domain e.g. example.com)" variant="outlined"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setDomain(event.target.value);
                        }}
                     />
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={isScam}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setIsScam((event.target as HTMLInputElement).value=="true");
                        }}
                        sx={{marginTop: '10px'}}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="Scam" />
                        <FormControlLabel value="false" control={<Radio />} label="Legit" />
                    </RadioGroup>
                    <p className='mylabel'>Evidences:</p>
                    <FileUploader
                        multiple={true}
                        handleChange={handleChange}
                        name="file"
                        types={fileTypes}
                        style="max-width: 100%"
                    />
                    {files.length ? <>{selectedFiles()}</> : <p>No files uploaded yet</p>}
                    <TextField
                        id="outlined-multiline-static"
                        label="Comments"
                        multiline
                        rows={4}
                        defaultValue=""
                        value={comments}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setComments(event.target.value);
                        }}
                        sx={{width: '100%'}}
                    />
                    <ReportSubmit
                        domain={domain}
                        files={files}
                        isScam={isScam}
                        comments={comments}
                    ></ReportSubmit>
                </Paper>
            </Grid>
        </div>
    );
}

export default Report;
