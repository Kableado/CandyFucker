<?php

require_once(__DIR__."/Web/Deployer/utils.php");

$klogDeployerEndpoint="https://varstudio.net/CandyFucker/Deployer/";
#$klogDeployerEndpoint="http://localhost:8080/Deployer/";
$klogRoot=__DIR__."/Web/";
$config=ReadJsonFile(__DIR__."/Web/Deployer/priv/config.json");
if ($config==null) {
	EchoError("Config not found, use \"config.example.json\", as base to \"config.json\".");
	return;
}

EchoInfo("Checking files...");
$ignores=[
	"*.svg",
	"*.xcf",
	".php_cs.dist",
	"setup.php",
	"config.json",
	"Deployer",
];
$files=array();
ScanFilesRecursive($klogRoot, $files, $ignores);
$filesWithChecksum=array();
foreach ($files as $file) {
	$destPath=ReplacePrefix($file, $klogRoot);
	$data=file_get_contents($file);
	$sha1=sha1($data);
	$filesWithChecksum[]=[
		"DestPath"=>$destPath,
		"Checksum"=>$sha1,
	];
}
$filesChecked=PostRequest($klogDeployerEndpoint, [
	"Action"=>"CheckFiles",
	"Key"=>$config["Key"],
	"Files"=>$filesWithChecksum,
]);
if ($filesChecked===null) {
	EchoError("Failure in comms");
	return;
}
if (isset($filesChecked["Error"])) {
	EchoError("Server error: ".$filesChecked["Error"]);
	return;
}
foreach ($filesChecked as $file) {
	$destPath=$file["DestPath"];
	$filePath=$klogRoot.$destPath;
	if ($file["ChecksumDifferent"]===false) {
		EchoInfo("--- ".$destPath);
		continue;
	}
	EchoInfo("+++ ".$destPath);
	$data=file_get_contents($filePath);
	$timestamp=filemtime($filePath);
	$result=PostRequest($klogDeployerEndpoint, [
		"Action"=>"UploadFile",
		"Key"=>$config["Key"],
		"DestPath"=>$destPath,
		"Data"=>base64_encode($data),
		"Timestamp"=>$timestamp,
	]);
	if ($result!==true) {
		EchoError("Failure uploading ".$destPath);
	}
	if (isset($result["Error"])) {
		EchoError("Server error: ".$result["Error"]);
	}
}
