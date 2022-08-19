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

    canvas.height = '400'
    canvas.width = '800'

    ctx.drawImage(webcam, 0, 0, 800, 450)
    //webcamContent.append(canvas)

    $.post('image_manager.php', {
        imgB64: canvas.toDataURL('image/jpeg').split(';base64,')[1]
    })
    .done(function(data) {
        memories()
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

function memories()
{
    $.get('image_manager.php?list=1')
        .done(function(data) {
            $('#memories').html('')
            let imgs = JSON.parse(data)
            let i = 0
            let imgDiv = ''
            for (const item of Object.entries(imgs)) {
                imgDiv = '<div class="col-4">'
                imgDiv += '<img width="90%" height="90%" style="padding: 5%;" src="/angelina/images-smile/' + item[1] + '"/>'
                imgDiv += '<div/>'

                $('#memories').append(imgDiv)
                if (i > 11) {
                    continue
                }
            }
        });
}

memories()