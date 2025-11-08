import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function AddBookScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState(""); // 💰 New
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your gallery to upload book images."
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker error:", error);
      Alert.alert("Error selecting image");
    }
  };

  const uploadBook = async () => {
    if (!title.trim() || !author.trim() || !price.trim()) {
      Alert.alert("Missing info", "Please fill in title, author, and price fields.");
      return;
    }

    try {
      setUploading(true);
      let imageUrl;

      if (image) {
        const imageRef = ref(storage, `books/${Date.now()}.jpg`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      } else {
        imageUrl = "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";
      }

      await addDoc(collection(db, "books"), {
        title,
        author,
        description,
        price: parseFloat(price) || 0,
        image: imageUrl,
        ownerId: auth.currentUser?.uid || "anonymous",
        isAvailable: true,
        rentedBy: null,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setAuthor("");
      setPrice("");
      setDescription("");
      setImage(null);
      Alert.alert("✅ Book added successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("❌ Failed to add book", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        title="Add New Book"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.formContainer}>
        <Text style={styles.label}>Book Title</Text>
        <TextInput
          placeholder="Enter book title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Author</Text>
        <TextInput
          placeholder="Enter author name"
          value={author}
          onChangeText={setAuthor}
          style={styles.input}
        />

        <Text style={styles.label}>Price (in ₹)</Text>
        <TextInput
          placeholder="Enter price for renting"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Enter description (optional)"
          multiline
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 90 }]}
        />

        <Button title="Select Book Image (optional)" onPress={pickImage} />

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
          />
        )}

        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={{ marginTop: 8, color: "#555" }}>Uploading...</Text>
          </View>
        ) : (
          <Button title="Add Book" onPress={uploadBook} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  formContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    marginTop: 15,
    borderRadius: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
