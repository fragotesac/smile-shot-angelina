const webcam = document.getElementById('webcam')
const webcamContent = document.getElementById('webcam_content')

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
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
    setTimeout(function(){
        $('#loader-page').addClass('d-none')
        $('#shoot').removeClass('d-none')
    }, 3000)

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
    let canvas = document.getElementById('snapshot-canvas')
    var marco = document.getElementById('marco');

    if (!canvas) {
        canvas = faceapi.createCanvasFromMedia(webcam);
        canvas.setAttribute('id', 'snapshot-canvas')
        webcamContent.append(canvas)
    }
    webcamContent.append(canvas)
    marco.style.width =  webcam.offsetWidth + "px"
    marco.style.height =  webcam.offsetHeight + "px"

    const displaySize = { width: webcam.offsetWidth, height: webcam.offsetHeight }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam
        ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()

        if (!detections.length) {
            return
        }
        if (typeof detections[0].expressions != 'undefined') {
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            document.getElementById('nivelFelicidad').innerText = Math.floor((detections[0].expressions.happy) * 100) + '%'

            if (detections[0].expressions.happy >= 0.5) {
                $('.happiness-color').css('font-color', '#198754');
            } else {
                $('.happiness-color').css('font-color', '#dc3545');
            }

            console.log(detections[0].expressions.happy)
            if (detections[0].expressions.happy >= 0.5) {
                snapshot()
            }
        }
    }, 100)
})

function memories()
{
    $.get('image_manager.php?list=1')
        .done(function(data) {
            $('#memories').html('')
            let imgs = JSON.parse(data)
            let imgDiv = ''
            for (const item of Object.entries(imgs)) {
                imgDiv = '<div class="col-4">'
                imgDiv += '<img width="90%" height="90%" style="padding: 5%;" src="/angelina/images-smile/' + item[1] + '"/>'
                imgDiv += '<div/>'

                $('#memories').append(imgDiv)
            }
        });
}

memories()
