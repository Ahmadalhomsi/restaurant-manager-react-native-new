import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { router } from "expo-router";
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState<null | { latitude: number; longitude: number }>(null);
  const [region, setRegion] = useState({
    latitude: 41.008240, // Default latitude
    longitude: 28.978359, // Default longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Konum izni verilmedi');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      setLocation({ latitude, longitude });
      setRegion({
        ...region,
        latitude,
        longitude,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Benim Konumum"
            description="Burası sizin mevcut konumunuz"
          />
        )}
      </MapView>
      <Button
        title="Geri"
        onPress={() => router.back()}
        type="outline"
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
});
