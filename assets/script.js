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

    const canvas = document.createElement('canvas');
    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;
    canvas.getContext('2d').drawImage(webcam, 0, 0);

    const img = document.createElement("img");
    img.src = canvas.toDataURL('image/webp');

    const contentImage = document.createElement('div')
    contentImage.className  = 'col-6'
    contentImage.appendChild(img)
    document.getElementById('collect-smiles').appendChild(contentImage)
    debugger
   $.post( "assets/save-image.php", { img: img.src })
        .done(function( data ) {
            console.log( "Guardado " + data );
        });
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
        if (detections.length > 0 && typeof detections[0].expressions != 'undefined') {
            //console.log(detections[0].expressions.happy)
            if (detections[0].expressions.happy > 0.5) {
                snapshot()
            }
        }
    }, 1000)
})