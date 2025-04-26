import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigation = useNavigation();

  const handleAddContact = () => {
    if (!contactName || !contactPhone) {
      Alert.alert('Missing Fields', 'Please enter both a name and a phone number.');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: contactName,
      phone: contactPhone,
    };

    setContacts([...contacts, newContact]);
    setContactName('');
    setContactPhone('');
  };

  const handleRemoveContact = () => {
    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'No contact to remove.');
      return;
    }

    const updatedContacts = contacts.slice(0, -1);
    setContacts(updatedContacts);
    Alert.alert('Contact Removed', 'The last contact has been removed.');
    setContactName('');
    setContactPhone('');
  }

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Sign Out Error:', error.message);
        Alert.alert('Error', error.message);
      });
  };
  

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (locUpdate) => {
          setLocation(locUpdate.coords);
        }
      );
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <TextInput
        style={styles.input}
        placeholder="Contact Name"
        placeholderTextColor="#B0C4DE"
        value={contactName}
        onChangeText={setContactName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#B0C4DE"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <Text style={styles.buttonText}>Add Contact</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.removeButton} onPress={handleRemoveContact}>
        <Text style={styles.buttonText}>Remove Contact</Text>
      </TouchableOpacity>

      <View style={{ height: 100, marginBottom: 15 }}>
        <ScrollView style={styles.list}>
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <Text style={styles.contactText}>{contact.name}: {contact.phone}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>


      <Text style={styles.mapTitle}>Your Real-Time Location</Text>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="You are here"
          />
        </MapView>
      ) : errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <ActivityIndicator size="large" color="#0077CC" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    backgroundColor: '#F0F8FF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 30,
    
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#00BFFF',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#003366',
  },
  addButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  removeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    marginTop: 10,
    marginBottom: 20,
  },
  contactItem: {
    backgroundColor: '#e0f0ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  contactText: {
    fontSize: 18,
    color: '#003366',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 45,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 10,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },  
});
