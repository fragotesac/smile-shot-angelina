<?php
if (isset($_POST['img'])) {
    $data = $_POST['img'];
    list($type, $data) = explode(';', $data);
    list(, $data)      = explode(',', $data);
    $data = base64_decode($data);
    $path = __dir__ . '/../images-smile/';
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    $path .= 'image_' . date('d_m_Y_H_i_s') . '.jpg';
    echo file_put_contents($path, $data) ? $path : 'No';
}