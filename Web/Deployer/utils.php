<?php

function EchoError($text)
{
	file_put_contents('php://stderr', "!!!!! ".$text."\n");
}

function EchoDebug($text)
{
	file_put_contents('php://stderr', "***** ".$text."\n");
}

function EchoInfo($text)
{
	file_put_contents('php://stderr', "..... ".$text."\n");
}

function GetDocRoot()
{
	$localPath=$_SERVER["SCRIPT_NAME"];
	$localName=basename($localPath);
	$absolutePath=realpath($localName);
	$absolutePath=str_replace("\\", "/", $absolutePath);
	$docRoot=substr($absolutePath, 0, strpos($absolutePath, $localPath));
	return($docRoot);
}

function pcre_fnmatch($pattern, $string)
{
	$patternQuoted='#'.$pattern.'#';
	$pattern2=strtr($patternQuoted, array('*' => '.*', '?' => '.', '.' => '\\.'));
	return (boolean)preg_match($pattern2, $string);
}

function ScanFilesRecursive($path, &$files, $ignores)
{
	if (file_exists($path)===false) {
		return;
	}
	$dirObj=@opendir($path);
	if ($dirObj===false) {
		return;
	}
	while (1) {
		$file=readdir($dirObj);
		if ($file===false) {
			break;
		}
		$filePath=$path.$file;

		if ($file==='.' || $file==='..') {
			continue;
		}
		$ignoreThis=false;
		foreach ($ignores as $ignore) {
			if ($file===$ignore) {
				$ignoreThis=true;
				break;
			}
			if (pcre_fnmatch($ignore, $filePath)) {
				$ignoreThis=true;
				break;
			}
		}
		if ($ignoreThis) {
			continue;
		}

		if (is_dir($path.$file)) {
			ScanFilesRecursive($path.$file."/", $files, $ignores);
		} else {
			if (is_file($path.$file)) {
				$files[]=$path.$file;
			}
		}
	}
	closedir($dirObj);
}

function ReplacePrefix($text, $prefix)
{
	if (substr($text, 0, strlen($prefix)) == $prefix) {
		$text = substr($text, strlen($prefix));
	}
	return $text;
}

function PostRequest($url, $object)
{
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_HEADER, false);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-type: application/json"));
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($object));
	curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 20);

	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

	curl_setopt($curl, CURLOPT_NOBODY, false);
	curl_setopt($curl, CURLOPT_HTTPGET, false);

	curl_setopt($curl, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; pl; rv:1.9) Gecko/2008052906 Firefox/3.0");
	curl_setopt($curl, CURLOPT_AUTOREFERER, true);
	curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);

	#curl_setopt($curl, CURLOPT_VERBOSE, true);

	$json_response = curl_exec($curl);
	$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	if ($status!=200) {
		EchoDebug($json_response);
		EchoError("PostRequest.Code: ".$status." ".curl_error($curl));
		return null;
	}
	curl_close($curl);

	$response = json_decode($json_response, true);
	return $response;
}

function ReadJsonFile($file)
{
	$data=@file_get_contents($file);
	return json_decode($data, true);
}
