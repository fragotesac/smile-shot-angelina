<?php

$imagesPath = __dir__ . '/images-smile/';
if (isset($_POST['imgB64'])) {
    $data = $_POST['imgB64'];
    $data = str_replace('data:image/png;base64,', '', $data);
    $data = str_replace(' ', '+', $data);
    $data = base64_decode($data);
    $path = $imagesPath;
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

if (!empty($_GET['list'])) {
    $result = [];
    foreach (glob($imagesPath . '*') as $file) {
        $result[filemtime($file)] = str_replace($imagesPath, '', $file);
    }

    ksort($result);
    echo json_encode($result);
}
