import { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library'; // MediaLibrary'yi import ediyoruz
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ImagePickerExample() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null); // Seçilen resim için ayrı bir state

  useEffect(() => {
    // Uygulama açıldığında daha önce kaydedilen resmi yükle
    const loadImage = async () => {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setImage(savedImage);
      }
    };

    loadImage();
  }, []);

  const pickImage = async () => {
    // Kamera rulodan fotoğraf seçme işlemi
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const pickedImageUri = result.assets[0].uri;
      setSelectedImageUri(pickedImageUri); // Seçilen fotoğrafın URI'sini state'e kaydediyoruz
      setImage(pickedImageUri); // Ekranda gösterilmek üzere state'e kaydediyoruz
    }
  };

  const saveImageToGallery = async () => {
    // Fotoğrafı galeriyi kaydetme
    if (selectedImageUri) {
      try {
        // Kullanıcıdan izin al
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          // Fotoğrafı yeni albüme kaydediyoruz
          const asset = await MediaLibrary.createAssetAsync(selectedImageUri);

          // Yeni albüm oluşturup fotoğrafı oraya kaydediyoruz
          const albumName = 'RestaurantManagerPP'; // Klasör adı
          const album = await MediaLibrary.getAlbumAsync(albumName);
          if (album == null) {
            // Albüm yoksa oluştur
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
          } else {
            // Albüm varsa fotoğrafı ekle
            await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
          }

          console.log('Fotoğraf başarıyla galeride kaydedildi.');
          // Kaydettikten sonra, AsyncStorage'a da kaydedebiliriz
          await AsyncStorage.setItem('profileImage', selectedImageUri);
        } else {
          alert('Galeriye kaydetmek için izin vermelisiniz.');
        }
      } catch (error) {
        console.error('Error saving image to gallery:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {selectedImageUri && (
        <Button title="Save Image to Gallery" onPress={saveImageToGallery} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
