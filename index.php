<?php require_once 'head.php'?>
<div class="container-fluid">
    <main>
        <div class="container" id="loader-page">
            <div class="row">
                <div class="col">
                    <h1 class="loader-title">Happy Birthday!</h1>
                    <div class="flame-cont">
                        <div class="flame">
                            <div class="flame-center"></div>
                        </div>
                    </div>
                    <div class="candle-cont">
                        <div class="candle">
                            <div class="stripe"></div>
                            <div class="stripe"></div>
                            <div class="stripe"></div>
                        </div>
                    </div>
                    <div class="cake-cont">
                        <div class="cake">
                            <div class="frosting-cont">
                                <div class="frosting"></div>
                            </div>
                            <div class="choc-layer"></div>
                            <div class="choc-layer top"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid text-center d-none mb-5" id="shoot">
            <div class="row mb-2">
                <div class="col-12">
                    <div class="py-2 text-center wrapper">
                        <h1 class="loader-title">Sonríe y déjale un recuerdo a Angelina</h1>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-2">
                    <div class="qr-wrapper bg-white">
                        <h2 class="text-center">Recuerdos Generados</h2>
                        <h5>Obten tus fotos</h5>
                        <div class="mb-3">
                            <img src="./assets/qr-memories.png" alt="" class="img-fluid">
                        </div>
                    </div>
                </div>

                <div class="col-lg-8 position-relative p-0" id="webcam_content">
                    <video id="webcam" class="img-fluid w-100 position-absolute" autoplay muted></video>
                    <img id="marco" src="assets/borde.png" />
                </div>
                <div class="col-lg-2">
                    <div id="memories" class="row"></div>
                </div>
            </div>
        </div>
    </main>
</div>


<script src="node_modules/@vladmandic/face-api/dist/face-api.js"></script>
<script defer src="assets/script.js?v=20230812115100"></script>
<?php require_once 'footer.php'?>
