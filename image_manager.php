<?php
use PHPMailer\PHPMailer\PHPMailer;
require_once 'global.php';
$imagesPath = __dir__ . '/images-smile/';
if (isset($_POST['imgB64'])) {
    $data = $_POST['imgB64'];
$data = str_replace('data:image/png;base64,', '', $data);
$data = str_replace(' ', '+', $data);
$data = base64_decode($data);

// Nombre y ruta final
$filename = 'image_' . date('d_m_Y_H_i_s') . '.png';
$path = $imagesPath . $filename;
file_put_contents($path, $data);

// Crear imagen base desde PNG (formato base64)
$jpeg = imagecreatefrompng($path);

// Cargar borde
$border = __DIR__ . '/assets/borde.png';
$png = imagecreatefrompng($border);

// Obtener dimensiones
list($width, $height) = getimagesize($path);
list($borderWidth, $borderHeight) = getimagesize($border);

// Crear imagen con fondo transparente
$out = imagecreatetruecolor($borderWidth, $borderHeight);
imagesavealpha($out, true);
imagealphablending($out, false);
$transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
imagefill($out, 0, 0, $transparent);

// Reescalar imagen base a tamaño del marco
imagecopyresampled($out, $jpeg, 0, 0, 0, 0, $borderWidth, $borderHeight, $width, $height);

// Superponer borde
imagecopy($out, $png, 0, 0, 0, 0, $borderWidth, $borderHeight);

// Guardar imagen final (con borde)
imagepng($out, $path);

echo $path;

}

if (!empty($_GET['list'])) {
    $result = [];
    foreach (glob($imagesPath . '*') as $file) {
        $result[filemtime($file)] = str_replace($imagesPath, '', $file);
        //$result[filemtime($file)] = $url . '/images-smile/' . str_replace($imagesPath, '', $file);
    }

    krsort($result);

    $newList = [];
    $i = 0;
    foreach ($result as $image) {
        if ($i > 3) {
            break;
        }

        $newList[] = $image;
        ++$i;
    }
    echo json_encode($newList);
}

if (isset($_GET['enviar_fotos'])) {
    require_once "vendor/autoload.php";
    $mail = new PHPMailer;
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    //credential
    $mail->Host = "mail.fragote.com";
    $mail->SMTPAuth = true;
    $mail->Username = "angelina@fragote.com";
    $mail->Password = "angelina#3011ang$";
    $mail->SMTPSecure = "ssl";
    $mail->Port = 465;
    $mail->From = "francis@fragote.com";
    $mail->CharSet = "UTF-8";
    $mail->FromName = "Francis Gonzales";
    $mail->isHTML(true);
    $mail->Subject = "Cumpleaños de Angelina";

    $texto = "<p>Hola </p>";
    $texto .= "<p>Quiero expresar mi más sincero agradecimiento por asistir al cumpleaños de mi hija. Fue maravilloso contar con tu presencia y ver la alegría que le brindaste. Tu amabilidad y cariño hicieron que el día fuera aún más especial. Gracias por hacer parte de este hermoso recuerdo.</p>";
    $texto .= "<p>Con aprecio,</p>";
    $texto .= "<p>Francis Gonzales</p>";
    $mail->Body = $texto;

    $email = $_POST['email'];
    $images = $_POST['images'];
    $mail->addAddress($email);

    error_log(print_r(['tipo' => 'fotos-angelina', 'email' => $email, 'fotos' => $images],1));

    if (!empty($images)) {
        foreach ($images as $image) {
            if (file_exists(__DIR__ . '/images-smile/' . $image)) {
                $mail->addAttachment(__DIR__ . '/images-smile/' . $image);
            }
        }
    }

    $sendEmail = $mail->send();
    if(!$sendEmail) {
        error_log(print_r($mail->ErrorInfo));
    }

    echo json_encode([
        'result' => $sendEmail
    ]);
    exit;
}
