<?php
if (isset($_POST['imgB64'])) {
    $data = $_POST['imgB64'];
    list($type, $data) = explode(';', $data);
    list(, $data)      = explode(',', $data);
    $data = base64_decode($data);
    $path = __dir__ . '/images-smile/';
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    $path .= 'image_' . date('d_m_Y_H_i_s') . '.jpg';
    file_put_contents($path, $data);

    $border = __DIR__ . '/assets/marco.png';
    $png = imagecreatefrompng($border);
    $jpeg = imagecreatefromjpeg($path);

    list($width, $height) = getimagesize($path);
    list($newwidth, $newheight) = getimagesize($border);
    $out = imagecreatetruecolor($newwidth, $newheight);
    imagecopyresampled($out, $jpeg, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
    imagecopyresampled($out, $png, 0, 0, 0, 0, $newwidth, $newheight, $newwidth, $newheight);
    imagejpeg($out, $path, 100);

    echo $path;
}
