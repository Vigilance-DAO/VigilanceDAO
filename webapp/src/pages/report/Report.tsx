import React, { useEffect, useState } from 'react';
import './Report.css';
import { connect } from "@tableland/sdk";
import { FileUploader } from "react-drag-drop-files";
import { Paper, TextField, Grid, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { create } from "ipfs-http-client";
import { useChain, useMoralis, useMoralisFile } from "react-moralis";
import { useLocation } from "react-router-dom";

function Report(props: any) {
    console.log('props', props, process.env)
    const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
    const { initialize, isInitialized, isAuthenticated } = useMoralis();
    const { account } = useChain();
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

    async function writeToTableLand(hashes: string[]) {
        const tableland = await connect({ network: "testnet" });
        const { name } = await tableland.create(
            `domain text, id int, evidences text, comments text, status text, account text, createdon text, updatedon text, primary key (id)`, // Table schema definition
            'vigiancedao_reports' // Optional `prefix` used to define a human-readable string
        );
        console.log({name})
        let cmd = `INSERT INTO ${name} (id, domain, evidences, comments, status, account, createdon, updatedon) VALUES (0, '${domain}', '${JSON.stringify(hashes)}', '${comments}', 'open', '${account}', '${new Date()}', '${new Date()}');`
        console.log(cmd)
        const writeRes = await tableland.write(cmd);
        console.log(writeRes)
    }

    const [files, setFile] = useState<any[]>([]);
    const handleChange = (file: any): any => {
        setFile(file);
    };

    useEffect(() => {
        if(error) {
            console.warn(error)
            alert('Error uploading document to IPFS. Check logs.')
        }
    }, [error])

    const [submitBtnTxt, setSubmitBtnTxt] = useState('Submit')
    const [submitDisabled, setSubmitDisabled] = useState(false)

    useEffect(()=>{
        if(isUploading) {
            setSubmitBtnTxt('uploading')
            setSubmitDisabled(true)
        } else {
            setSubmitBtnTxt('Submit')
            setSubmitDisabled(false)
        }
    }, [isUploading])

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

    const submit = async () => {
        try {
            let hashes: string[] = []
            if(!isAuthenticated) {
                return alert('Please connect metamask before submitting')
            }
            if(!files.length)
                return alert('Upload at least one evidence file')   

            if(!isInitialized) {
                await initialize()
            }
            await writeToTableLand(['fsdfdf'])
            // for(let i=0; i<files.length; ++i) {
            //     const file: any = await saveFile(files[0].name, files[0], {
            //         type: files[0].type,
            //         metadata: {'createdBy': account || 'na'},
            //         tags: {},
            //         saveIPFS: true,
            //     });
            //     console.log('saved filed', i, file)
            //     hashes.push(file._hash)
            // }
            // console.log(hashes)
        } catch (error: any) {
            console.log(error.message);
        }
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
                    <Button 
                        variant="contained" 
                        sx={{marginTop: '10px'}} 
                        disabled={submitDisabled}
                        onClick={submit}>{submitBtnTxt}</Button>
                </Paper>
            </Grid>
        </div>
    );
}

export default Report;
