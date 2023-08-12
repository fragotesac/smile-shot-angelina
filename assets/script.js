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

async function startVideo() {
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
        async: false,
        beforeSend: function() {
            clearInterval(interval)
            Swal.fire({
                title: 'Procesando',
                text: 'Un momento..',
                icon: 'info',
                showConfirmButton :false,
                timer: 1000
            })
        },
        complete: function(data) {
            memories()
            console.log('Guardado ' + data );
            Swal.fire({
                title: 'Foto Capturada!',
                text: 'Un momento..',
                icon: 'info',
                showConfirmButton :false,
                timer: 2000
            })

            setTimeout(function() {
                initializeInterval(faceapi, canvas, displaySize)
            }, 2000);
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

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            webcam
        ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        if (resizedDetections.length > 0) {
            resizedDetections.forEach(detection => {
                const box = detection.detection.box;
                if (box.x > 0 && box.y > 0 && box.width > 0 && box.height > 0) {
                    const happy = detection.expressions.happy
                    const levelHappy = (Math.floor((happy) * 100)) + '%'
                    const drawOptions = {
                        label: 'Felicidad ' + levelHappy,
                        lineWidth: 2,
                        boxColor: 'rgba(32,219,98,0.38)'
                    }

                    if (happy >= 0.5) {
                        drawOptions.boxColor = '#198754';
                    } else {
                        drawOptions.boxColor = '#dc3545';
                    }

                    const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
                    drawBox.draw(canvas);
                }
            });
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
    }, 100);

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

    try {
        detections.forEach(detection => {
            let happy = detection.expressions.happy
            if (happy >= 0.5) {
                clearInterval(interval)
                snapshot(faceapi, canvas, displaySize)
                throw new Error('break');
            }
        });
    } catch (e) {
        if (e.message !== "break") {
            throw e;
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
    const memories = $('#memories')
    $.get('image_manager.php?list=1')
        .done(function(data) {
            memories.html('')
            let imgs = JSON.parse(data)
            let imgDiv = ''
            for (const item of Object.entries(imgs)) {
                imgDiv = `
                    <div class="col-12 mb-4 mb-lg-0">
                        <img
                                src="/angelina/images-smile/${item[1]}"
                                class="w-100 shadow-1-strong rounded mb-4"
                                alt=""
                        />
                    </div>`
                memories.append(imgDiv)
            }
        });
}

memories()
