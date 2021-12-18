const webcam = document.getElementById('webcam')
const webcamContent = document.getElementById('webcam_content')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        {video: {}},
        stream => webcam.srcObject = stream,
        err => console.log(err)
    )
}

function snapshot() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);


    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(document.createElement('br'))
    webcamContent.append(canvas)
   // document.getElementById("thumb").value = filename;
    /*$.post("thumb-saver.php", {
        base:img_data,
        output:"thumbnails/"+ filename +  '.jpg'
    }, function( data ) {
        //alert(data);
    });*/

    //video.removeEventListener('canplay', snapshot)
    //video.addEventListener('canplay', snapshot);
}

webcam.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(webcam)
    webcamContent.append(canvas)

    const displaySize = { width: webcam.offsetWidth, height: webcam.offsetHeight }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions()

        //const resizedDetections = faceapi.resizeResults(detections, displaySize)
        //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        if (typeof detections[0].expressions != 'undefined') {
            console.log(detections[0].expressions.happy)
            if (detections[0].expressions.happy > 0.5) {
                snapshot()
            }
        }
    }, 500)
})