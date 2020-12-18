import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Text, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const HelloWorldApp = () => {
	const [image, setImage] = useState(null);
	const [googleResponse, setGoogleResponse] = useState()

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
			base64: true
		});

		if (!result.cancelled) {
			// check for google vision and 
			// then set the image in UI
			setImage(result.uri)
			
			// Google Vision needs base64 Image
			let fileBase64 = await FileSystem.readAsStringAsync(result.uri, { encoding: 'Base64'  });    		
			
			// Request Object
			let body = JSON.stringify({
				requests: [{
					features: [
						{ type: "LABEL_DETECTION", maxResults: 10 },
						{ type: "LANDMARK_DETECTION", maxResults: 5 },
						{ type: "FACE_DETECTION", maxResults: 5 },
						{ type: "LOGO_DETECTION", maxResults: 5 },
						{ type: "TEXT_DETECTION", maxResults: 5 },
						{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
						{ type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
						{ type: "IMAGE_PROPERTIES", maxResults: 5 },
						{ type: "CROP_HINTS", maxResults: 5 },
						{ type: "WEB_DETECTION", maxResults: 5 }
					],
					image: {
						"content": fileBase64
					}
				}]
			});
			
			
			let response = await fetch(
				"https://vision.googleapis.com/v1/images:annotate?key=********",       			
				{
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json"
					},
					method: "POST",
					body: body
       			}
     		);
			
			let responseJson = await response.json();
			
			if (responseJson) {
				console.log(responseJson.responses[0].safeSearchAnnotation);
				alert(JSON.stringify(responseJson.responses[0].safeSearchAnnotation));
				setGoogleResponse(responseJson.responses[0].safeSearchAnnotation)
			}
			
		}
  	};

	return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center'
		}}>
		<Button 
			title="Pick an image from camera roll" 
			onPress={pickImage} 
		/>
		{image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
		</View>
	);
}

export default HelloWorldApp;