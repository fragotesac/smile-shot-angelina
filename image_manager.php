<?php
use PHPMailer\PHPMailer\PHPMailer;
require_once 'global.php';
$imagesPath = __dir__ . '/images-smile/';
if (isset($_POST['imgB64'])) {
    $data = $_POST['imgB64'];
    $data = str_replace('data:image/png;base64,', '', $data);
    $data = str_replace(' ', '+', $data);
    $data = base64_decode($data);

    $path = __DIR__ . '/images-smile/';
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }

    $path .= 'image_' . date('d_m_Y_H_i_s') . '.jpg';
    file_put_contents($path, $data);

    // Cargar borde
    $border = __DIR__ . '/assets/borde.png';
    $png = imagecreatefrompng($border);
    $jpeg = imagecreatefromjpeg($path);

    // Verificaciones de carga
    if (!$jpeg) {
        error_log("❌ No se pudo cargar la imagen JPEG: $path");
    }
    if (!$png) {
        error_log("❌ No se pudo cargar el borde PNG: $border");
    }

    // Verifica tamaños
    list($width, $height) = getimagesize($path);
    list($newwidth, $newheight) = getimagesize($border);
    error_log("📸 Tamaño JPEG: {$width}x{$height}");
    error_log("🖼️ Tamaño PNG: {$newwidth}x{$newheight}");

    // Crear imagen de salida
    $out = imagecreatetruecolor($newwidth, $newheight);
    imagesavealpha($out, true);
    $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
    imagefill($out, 0, 0, $transparent);

    // Escalar la imagen base y copiarla
    imagecopyresampled($out, $jpeg, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    // Copiar el borde encima
    imagecopyresampled($out, $png, 0, 0, 0, 0, $newwidth, $newheight, $newwidth, $newheight);

    // 🧪 PRUEBA: Escribir texto para confirmar procesamiento
    imagestring($out, 5, 10, 10, "Con Marco", imagecolorallocate($out, 255, 0, 0));

    // Guardar imagen final
    error_log("✅ Se llegó al guardado con borde");
    imagejpeg($out, $path, 100);

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
