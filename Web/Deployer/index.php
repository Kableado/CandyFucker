<?php

require_once(__DIR__."/utils.php");

$klogRoot=__DIR__."/../";
$method=$_SERVER['REQUEST_METHOD'];
$input=json_decode(file_get_contents('php://input'), true);
$config=ReadJsonFile(__DIR__."/priv/config.json");
if ($config==null) {
	EchoError("Config not found, use \"config.example.json\", as base to \"config.json\".");
	echo json_encode(["Error"=>"NotConfigured", "Message"=>"Config not found, use \"config.example.json\", as base to \"config.json\"."]);
	return;
}

if (isset($input["Key"])===false || $input["Key"]!==$config["Key"]) {
	EchoError("AccessDenied");
	echo json_encode(["Error"=>"AccessDenied"]);
	return;
}

if (isset($input["Action"])===false) {
	EchoError("ActionNotSpecified");
	echo json_encode(["Error"=>"ActionNotSpecified"]);
	return;
}

if ($input["Action"]==="CheckFiles") {
	$filesChecked=array();
	$files=$input["Files"];
	foreach ($files as $file) {
		$destPath=$file["DestPath"];
		$checksum=$file["Checksum"];

		$filePath=$klogRoot.$destPath;
		$data=file_get_contents($filePath);
		$sha1=sha1($data);

		$filesChecked[]=[
			"DestPath"=>$destPath,
			"ChecksumDifferent"=>($checksum!==$sha1),
		];
	}
	echo json_encode($filesChecked);
	return;
}

if ($input["Action"]==="UploadFile") {
	$destPath=$input["DestPath"];
	$data=base64_decode($input["Data"]);
	EchoDebug("UploadFile: ".$destPath);
	$destPathDir=dirname($klogRoot.$destPath."/");
	mkdir($destPathDir, 0777, true);
	file_put_contents($klogRoot.$destPath, $data);
	if (isset($input["Timestamp"])) {
		touch($klogRoot.$destPath, $input["Timestamp"]);
	}
	echo json_encode(true);
	return;
}


echo json_encode(null);
