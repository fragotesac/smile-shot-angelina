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
        {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "environment",
                frameRate: {ideal: 10, max: 30}
            }
        },
        stream => webcam.srcObject = stream,
        err => console.log(err)
    )
    setTimeout(function(){
        $('#loader-page').addClass('d-none')
        $('#shoot').removeClass('d-none')
    }, 3000)

}

function snapshot(faceapi, canvas, displaySize) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.height = '400'
    canvas.width = '800'

    ctx.drawImage(webcam, 0, 0, 800, 450)
    //webcamContent.append(canvas)

    $.ajax({
        type: 'POST',
        url: 'image_manager.php',
        data: {imgB64: canvas.toDataURL('image/jpeg').split(';base64,')[1]},
        dataType: 'text',
        beforeSend: function() {
            clearInterval(interval)
            Swal.fire({
                title: 'Capturamos Tu Foto!',
                text: 'Un momento..',
                icon: 'info',
                showConfirmButton :false
            })
        },
        complete: function(data) {
            memories()
            console.log('Guardado ' + data );
            Swal.close()
            initializeInterval(faceapi, canvas, displaySize)
        },
        error: function(xhr) {
            initializeInterval(faceapi, canvas, displaySize)
            console.log('error', xhr.statusText + xhr.responseText)
        },
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

    initializeInterval(faceapi, canvas, displaySize)
})

async function happinessFaceDetection(faceapi, canvas, displaySize)
{
    const detections = await faceapi.detectAllFaces(
        webcam
    ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()

    if (!detections.length) {
        return
    }
    if (typeof detections[0].expressions != 'undefined') {
        //const resizedDetections = faceapi.resizeResults(detections, displaySize)
        //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //faceapi.draw.drawDetections(canvas, resizedDetections)
        document.getElementById('nivelFelicidad').innerText = Math.floor((detections[0].expressions.happy) * 100) + '%'

        console.log(detections[0].expressions.happy)
        if (detections[0].expressions.happy >= 0.5) {
            $('.happiness-color').css('color', '#198754');
            snapshot(faceapi, canvas, displaySize)
        } else {
            $('.happiness-color').css('color', '#dc3545');
        }
    }
}

function initializeInterval(faceapi, canvas, displaySize)
{
    if (typeof interval != 'undefined') {
        clearInterval(interval);
    }

    interval = setInterval(() => happinessFaceDetection(faceapi, canvas, displaySize), 1500)
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
