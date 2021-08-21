
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const codecPreferences = document.querySelector('#codecPreferences');
const toggleCamera = document.querySelector("button#switch");
// const recordButton = document.querySelector("button#record");

// let mediaRecorder;
// let recordedBlobs;
toggleCamera.addEventListener("click", () => {
    if(toggleCamera.textContent === 'Switch on camera') {
        getStream().then(getDevices).then(gotDevices);
        toggleCamera.textContent = 'Switch off camera'
    } else {
        switchOff();
        toggleCamera.textContent = 'Switch on camera'
    }


    // getSupportedMimeTypes().forEach((mimeType ) => {
    //     const option = document.createElement('option');
    //     option.value = mimeType;
    //     option.innerText = option.value;
    //     codecPreferences.appendChild(option);
    // });
})

// recordButton.addEventListener('click', () => {
//     if (recordButton.textContent === 'Start Recording') {
//         startRecording();
//     } else {
//         stopRecording();
//         recordButton.textContent = 'Start Recording';
//     }
// });
//
// const startRecording = () => {
//     recordedBlobs = [];
//     const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
//     const options = {mimeType};
//     try {
//         mediaRecorder = new MediaRecorder(window.stream, options);
//     } catch (e) {
//         console.error('Exception while creating MediaRecorder:', e);
//     }
//     console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
//     recordButton.textContent = 'Stop Recording';
//     mediaRecorder.onstop = (event) => {
//         console.log('Recorder stopped: ', event);
//         console.log('Recorded Blobs: ', recordedBlobs);
//     };
//     mediaRecorder.ondataavailable = handleDataAvailable;
//     mediaRecorder.start();
//     console.log('MediaRecorder started', mediaRecorder);
// };
// const stopRecording = () => {
//     mediaRecorder.stop();
// };
//
// function handleDataAvailable(event) {
//     console.log('handleDataAvailable', event);
//     if (event.data && event.data.size > 0) {
//         recordedBlobs.push(event.data);
//     }
// }
//
// const downloadButton = document.querySelector('button#download');
// downloadButton.addEventListener('click', () => {
//     const blob = new Blob(recordedBlobs, {type: 'video/webm'});
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.style.display = 'none';
//     a.href = url;
//     a.download = 'test.webm';
//     document.body.appendChild(a);
//     a.click();
//     setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//     }, 100);
// });

// const getSupportedMimeTypes = () => {
//     const possibleTypes = [
//         'video/webm;codecs=vp9,opus',
//         'video/webm;codecs=vp8,opus',
//         'video/webm;codecs=h264,opus',
//         'video/mp4;codecs=h264,aac',
//         'video/mp4',
//     ];
//     return possibleTypes.filter(mimeType => {
//         return MediaRecorder.isTypeSupported(mimeType);
//     });
// }

const gotDevices = (deviceInfos) => {
    window.deviceInfos = deviceInfos; // make available to console
    for (const deviceInfoKey in deviceInfos) {
        const deviceInfo = deviceInfos[deviceInfoKey];
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if(deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        } else {
            console.log("Found another kind of device: ", deviceInfo);
        }
    }
}

const getDevices = () => {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices();
};
const switchOff = () => {
    if(window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        })
        audioSelect.options.length = 0;
        videoSelect.options.length = 0;
    } else {
        console.log('Yo dont have one');
    }
}
const getStream = () => {
    switchOff();
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: {
            deviceId: audioSource ? {exact: audioSource} : undefined,
            echoCancellation: true
        },
        video: {
            deviceId: videoSource ? {exact: videoSource} : undefined,
            width: 400,
            height: 400
        }
    }
    return navigator.mediaDevices.getUserMedia(constraints)
        .then((results) => gotStream(results))
        .catch((error) => handleError(error));
}

const gotStream = (stream) => {
    window.stream = stream; // make stream available to console
    audioSelect.selectedIndex = [...audioSelect.options].findIndex(option => option.text === stream.getAudioTracks()[0].label);
    videoSelect.selectedIndex = [...videoSelect.options].findIndex(option => option.text === stream.getVideoTracks()[0].label);
    videoElement.srcObject = stream;
}

const handleError = (error) => {
    console.error('Error', error);
}

audioSelect.onchange  = gotStream;
videoSelect.onchange = gotStream;
