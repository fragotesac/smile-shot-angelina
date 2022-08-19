const webcam = document.getElementById('webcam')
const webcamContent = document.getElementById('webcam_content')
let interval;

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
        Swal.close()
    });
}

let playCanvas;
let playDisplaySize;

webcam.addEventListener('play', () => {
    let canvas = playCanvas = document.getElementById('snapshot-canvas')
    var marco = document.getElementById('marco');

    if (!playCanvas) {
        playCanvas = faceapi.createCanvasFromMedia(webcam);
        playCanvas.setAttribute('id', 'snapshot-canvas')
        webcamContent.append(playCanvas)
    }
    webcamContent.append(playCanvas)
    marco.style.width =  webcam.offsetWidth + "px"
    marco.style.height =  webcam.offsetHeight + "px"

    const displaySize = playDisplaySize = { width: webcam.offsetWidth, height: webcam.offsetHeight }
    faceapi.matchDimensions(playCanvas, playDisplaySize)

    interval = setInterval(happinessFaceDetection(), 100)
})

async function happinessFaceDetection()
{
    const detections = await faceapi.detectAllFaces(
        webcam
    ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()

    if (!detections.length) {
        return
    }
    if (typeof detections[0].expressions != 'undefined') {
        const resizedDetections = faceapi.resizeResults(detections, playDisplaySize)
        playCanvas.getContext('2d').clearRect(0, 0, playCanvas.width, playCanvas.height)
        faceapi.draw.drawDetections(playCanvas, resizedDetections)
        document.getElementById('nivelFelicidad').innerText = Math.floor((detections[0].expressions.happy) * 100) + '%'

        console.log(detections[0].expressions.happy)
        if (detections[0].expressions.happy >= 0.5) {
            snapshot();
            $('.happiness-color').css('color', '#198754');
        } else {
            $('.happiness-color').css('color', '#dc3545');
        }
    }
}

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
