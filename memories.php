<?php require_once 'head.php'; ?>

<?php
require_once 'global.php';
$imagesPath = __dir__ . '/images-smile/';
$imagenes = [];
foreach (glob($imagesPath . '*') as $file) {
    $imagenes[] = [
            'path' => $url . '/angelina/images-smile/' . str_replace($imagesPath, '', $file),
            'name' => str_replace($imagesPath, '', $file),
            'created' => filectime($file)
    ];
}

usort($imagenes, function($a, $b) {
    return $b['created'] - $a['created'];
});
?>
<!-- Gallery -->
<div class="container">
    <div class="row py-1 ">
        <div class="bg-white">
            <h1 class="text-center ">Galeria</h1>
        </div>
    </div>
    <div class="row">
            <div style="text-align: right">
                <a class="btn btn-lg btn-primary mb-3 mr-1" href="#carouselExampleIndicators2" role="button" data-slide="prev">
                    <i class="fa fa-arrow-left"></i>
                </a>
                <a class="btn btn-lg btn-primary mb-3 " href="#carouselExampleIndicators2" role="button" data-slide="next">
                    <i class="fa fa-arrow-right"></i>
                </a>
            </div>
            <div class="col-12">
                <div id="carouselExampleIndicators2" class="carousel slide" data-bs-interval="false" data-interval="false" data-ride="carousel">
                    <div class="carousel-inner">
                        <?php
                        $totalImagenes = count($imagenes);
                        $imagenesPorGrupo = 3;

                        for ($i = 0; $i < $totalImagenes; $i += $imagenesPorGrupo):
                        ?>
                        <div class="carousel-item <?= $i == 0 ? 'active' : '' ?>">
                            <div class="row">
                            <?php for ($j = $i; $j < $i + $imagenesPorGrupo; $j++):?>
                                <?php if ($j < $totalImagenes): ?>
                                        <div class="col-md-4 mb-3">
                                            <div class="card">
                                                <img class="img-fluid" alt="" src="<?= $imagenes[$j]['path'] ?>">
                                                <div class="card-body">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" value="<?= $imagenes[$j]['name'] ?>" id="img-<?= $j ?>">
                                                        <label class="form-check-label" for="img-<?= $j ?>">
                                                            Seleccionar
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                <?php endif;?>
                            <?php endfor;?>
                            </div>
                        </div>
                        <?php endfor;?>
                    </div>
                </div>
            </div>
    </div>

    <div class="row">
        <div class="col-12">
            <button id="seleccionar-fotos" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#enviar-fotos-modal">Seleccionar</button>
        </div>
    </div>
</div>

<!-- Modal -->
<div class="modal fade" id="enviar-fotos-modal" tabindex="-1" data-bs-backdrop="static" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Ingrese datos</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form>
                    <div class="mb-3">
                        <label for="recipient-name" class="col-form-label">Correo:</label>
                        <input type="text" class="form-control" id="recipient-name">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" id="enviar-foto" class="btn btn-primary">
                    <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    <span>Enviar Fotos!</span>
                </button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript" src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"></script>

<?php require_once 'footer.php'; ?>
<script>
    $(function() {
        const cerrarModal = $('#enviar-fotos-modal .btn-close')
        const spinnerModal = $('#enviar-fotos-modal .spinner-border')
        const allCheckbox = $(".form-check-input")
        const email = $('#recipient-name')

        let images = []

        $("#enviar-foto").on( "click", function() {
            const button = $(this)
            let validateEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            images = $('.carousel-item .form-check-input:checked').map(function() {
                return $(this).val();
            }).get();

            if (images.length <= 0) {
                cerrarModal.click();
                Swal.fire({
                    title: 'Información',
                    text: 'Selecciona alguna Foto!',
                    icon: 'warning',
                    showConfirmButton :true
                })
                return false;
            }

            if (email.length < 1 || !validateEmail.test(email.val())) {
                email.val('')
                Swal.fire({
                    title: 'Información',
                    text: 'Ingresa un correo válido!',
                    icon: 'warning',
                    showConfirmButton :true
                })
                return false;
            }

            $.ajax({
                url : './image_manager.php?enviar_fotos=1',
                data : { images : images, email: email.val() },
                type : 'POST',
                dataType : 'json',
                beforeSend: function () {
                    button.prop("disabled", true);
                    spinnerModal.removeClass('d-none')
                },
                success : function(json) {
                    if (json.result) {
                        Swal.fire({
                            title: 'Información',
                            text: 'Se envío las fotos!',
                            icon: 'success',
                            showConfirmButton :true
                        })
                    } else {
                        Swal.fire({
                            title: 'Información',
                            text: 'No se envio las fotos, intentelo nuevamente',
                            icon: 'warning',
                            showConfirmButton :true
                        })
                    }
                },
                error : function(xhr, status, error) {
                    console.log(xhr.responseText)
                },
                complete : function(xhr, status) {
                    email.val('')
                    allCheckbox.prop("checked", false);
                    spinnerModal.addClass('d-none')
                    button.prop("disabled", false);
                    cerrarModal.click();
                }
            });
        });
    });
</script>
