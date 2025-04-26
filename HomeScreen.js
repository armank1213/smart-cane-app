import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

export default function HomeScreen() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState([]);

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

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{item.name}: {item.phone}</Text>
          </View>
        )}
        style={styles.list}
      />
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    marginTop: 10,
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
});
