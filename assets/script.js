const webcam = document.getElementById('webcam')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        {video: {}},
        stream => webcam.srcObject = stream,
        err => console.log(err)
    )
}

webcam.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(webcam)
    const webcamContent = document.getElementById('webcam_content')
    webcamContent.append(canvas)

    const displaySize = { width: webcam.offsetWidth, height: webcam.offsetHeight }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        console.log(detections[0].expressions.happy)
        if (detections[0].expressions.happy > 0.5) {
            alert('HAPPY !!!!!!!')
        }
    }, 500)
})