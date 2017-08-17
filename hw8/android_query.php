<?php
	ini_set("allow_url_fopen", 1);
	define('app_id','212013145941711');
	define('app_secret','e969965908687cd7534956e586c3c8a7');
	define('FB_TOKEN','EAADA0yhAZAs8BAJtBGEF7bZAWT3LfCgD5L1GTp7WWJKN4z4rR4xIXKEfdt9ZBZBMV8dG5I7gINTvMgmjWaZBjUNZAopThKZBr6FZBijcW2cNf01ERpn4yFpYwFqSZASX8pvUG3JaRBzEkgohAp3Q4aiZACK3vSLMXrDroZD');
	define('GOOGLE_KEY','AIzaSyDk8TwQIlRe6HSLvn9Xy8EKCYuHPQ_jJ6o');
	$type_arr = array(
	    'Users' => 'user',
	    'Pages' => 'page',
	    'Events' => 'event',
	    'Places' => 'place',
	    'Groups' => 'group'
	);
	if(isset($_GET['keyword'])){
		header('Content-Type: application/json');
		if($_GET['keyword']=='Place' && isset($_GET['lat']) && isset($_GET['lon'])){
			$url="https://graph.facebook.com/v2.8/search?q=".urlencode($_GET['keyword'])."&type=place&limit=10&fields=id,name,picture.width(700).height(700)&center=".urlencode($_GET['lat']).",".urlencode($_GET['lon'])."&access_token=".urlencode(FB_TOKEN);
			$result=file_get_contents($url);
			if(!$result){
				$response = array(
					'status' => false,
					'message' => 'An error occurred!'
				);
				echo json_encode($response);
			}
			else{
				echo $result;
			}
		}
		else{
			if(isset($type_arr[$_GET['type']])){
				$result = file_get_contents("https://graph.facebook.com/v2.8/search?q=".urlencode($_GET['keyword'])."&type=".$type_arr[$_GET['type']]."&limit=10&fields=id,name,picture.width(700).height(700)&access_token=".urlencode(FB_TOKEN));
				if(!$result){
					$response = array(
						'status' => false,
						'message' => 'An error occurred!'
					);
					echo json_encode($response);
				}
				else{
					echo $result;
				}
			}
			else{
				$response = array(
					'status' => false,
					'message' => 'An error occurred!'
				);
				echo json_encode($response);
			}
		}
	}
	
	else if(isset($_GET['id'])){
		header('Content-Type: application/json');
		$url='https://graph.facebook.com/v2.8/'.$_GET['id'].'?fields=albums.limit(5){name,photos.limit(2){name,picture}},posts.limit(5){created_time,message}&access_token='.FB_TOKEN;
		$result = file_get_contents($url);
		if(!$result){
			$response = array(
				'status' => false,
				'message' => 'An error occurred!'
			);
			echo json_encode($response);
		}
		else{
			echo $result;
		}
	}
	else if(isset($_GET['pic_id'])){
		header('Content-type:image/png');
		$url='https://graph.facebook.com/v2.8/'.$_GET['pic_id'].'/picture?access_token='.FB_TOKEN;
		$result = file_get_contents($url);
		if($result){
			echo $result;
		}
	}
	
	else{
		$response = array(
				'status' => false,
				'message' => 'An error occurred!'
		);
		echo json_encode($response);
	}
?>