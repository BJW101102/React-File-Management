//In Case: $env:NODE_OPTIONS="--openssl-legacy-provider"


import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import './App.css';
import trashicon from './icon/trashcan.png';
import downloadicon from './icon/donwload.png';



function App() {
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const server = 'http://127.0.0.1:5000/uploads';
  const filesEndpoint = 'http://127.0.0.1:5000/files';

  function fetchFiles() {
    axios.get(filesEndpoint)
      .then(response => {
        setFiles(response.data.files);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }

  function handleUpload() {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log('No file selected');
      setMsg('No File Selected');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    setMsg('Uploading...');
    fetch(server, {
      method: 'POST',
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
          setMsg('Upload Failed');
          throw new Error('Bad Response');
        } else {
          setMsg('Upload Successful');
          return res.json();
        }
      })
      .then(data => {
        fetchFiles(); // Fetch updated files after successful upload
        setSelectedFiles([]); // Clear the list of selected files
      })
      .catch(error => {
        console.error('Error handling upload:', error);
      });
  }

  useEffect(() => {
    fetchFiles();
  }, [filesEndpoint]);

  function deleteFile(file) {

    const deleteEndpoint = `http://127.0.0.1:5000/delete/${encodeURIComponent(file)}`; // Use the correct endpoint
    axios.delete(deleteEndpoint)
      .then(response => {
        console.log(response.data);
        fetchFiles(); // Fetch updated files after successful deletion
      })
      .catch(error => {
        console.error('Error deleting file:', error);
      });
  }

  function downloadFile(file) {
    console.log("Attempting to Download"); 
    const downloadEndpoint = `http://127.0.0.1:5000/download/${encodeURIComponent(file)}`;
    const aTag = document.createElement('a');
    aTag.href = downloadEndpoint;
    aTag.setAttribute("download", file);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
}

  return (
    <div className="App">
      <h1>Local File Manager</h1>
      <div className="file-upload">
        <input
          onChange={(event) => {
            setSelectedFiles([...event.target.files]);
          }}
          type="file"
          multiple
        />
        <button onClick={handleUpload}>Upload</button>
        <br />
        <span>{msg}</span>
      </div>

      <h2>Selected Files</h2>
      {
        selectedFiles.map((file, index) => (
          <p key={index}>{file.name}</p>
        ))}
      <h2>Uploaded Files</h2>
      <div className="scrollable-container">
        <div className="information-container">
          {files.length > 0 &&
            files.map((file, index) => (
              <div key={index} className="file-container">
                <p className="file-info">{file} <span style={{ marginLeft: '16px' }}></span> </p>
                <div className="button-container">
                  <button id="icon-button" onClick={() => downloadFile(file)}>
                    <img src={downloadicon} alt="Download" style={{ width: '25px', height: '25px' }} />
                  </button>
                  <button id="icon-button" onClick={() => deleteFile(file)}>
                    <img src={trashicon} alt="Delete" style={{ width: '25px', height: '25px' }} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
