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

    canvas.height = '450'
    canvas.width = '800'

    ctx.drawImage(webcam, 0, 0)
    webcamContent.append(canvas)

    $.post('image_manager.php', {
        imgB64: canvas.toDataURL('image/jpeg').split(';base64,')[1]
    })
    .done(function(data) {
        console.log('Guardado ' + data );
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
        ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()

        if (!detections.length) {
            return
        }
        if (typeof detections[0].expressions != 'undefined') {
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)

            console.log(detections[0].expressions.happy)
            if (detections[0].expressions.happy >= 0.5) {
                snapshot()
            }
        }
    }, 3000)
})