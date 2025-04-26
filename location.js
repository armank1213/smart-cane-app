import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, Button } from 'react-native';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    // Ask for permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    // Get current location
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Get Location" onPress={getLocation} />
      {location && (
        <Text>Latitude: {location.latitude}, Longitude: {location.longitude}</Text>
      )}
      {errorMsg && <Text>Error: {errorMsg}</Text>}
    </View>
  );
}
