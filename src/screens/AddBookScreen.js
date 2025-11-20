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
import { db, auth } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function AddBookScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ⭐ Your Cloudinary Config (ADD YOUR VALUES)
  const CLOUD_NAME = "bookrental-81";
  const UPLOAD_PRESET = "my_bookapp_preset"; 


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Allow access to gallery to upload book images."
        );
      }
    })();
  }, []);

  // ----------------------------------------------------------
  // 📸 PICK IMAGE
  // ----------------------------------------------------------
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
      console.error("ImagePicker Error:", error);
      Alert.alert("Error selecting image.");
    }
  };

  // ----------------------------------------------------------
  // ☁ UPLOAD IMAGE TO CLOUDINARY
  // ----------------------------------------------------------
  const uploadToCloudinary = async (localUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "book.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      let response = await fetch(
        `https://api.cloudinary.com/v1_1/bookrental-81/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      Alert.alert("Image upload failed.");
      return null;
    }
  };

  // ----------------------------------------------------------
  // 📘 ADD BOOK
  // ----------------------------------------------------------
  const uploadBook = async () => {
    if (!title.trim() || !author.trim() || !price.trim()) {
      Alert.alert("Missing Fields", "Please enter title, author, and price.");
      return;
    }

    setUploading(true);

    try {
      // Default image URL if user doesn’t upload one
      let imageUrl =
        "https://cdn-icons-png.flaticon.com/512/2232/2232688.png";

      // Upload to Cloudinary if image selected
      if (image) {
        const uploadedUrl = await uploadToCloudinary(image);
        if (uploadedUrl) imageUrl = uploadedUrl;
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

      // Reset fields
      setTitle("");
      setAuthor("");
      setPrice("");
      setDescription("");
      setImage(null);

      Alert.alert("✅ Book added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Add Book Error:", error);
      Alert.alert("❌ Failed to add book");
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

        <Button title="Select Book Image" onPress={pickImage} />

        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

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

// ----------------------------------------------------------
// 🎨 STYLES
// ----------------------------------------------------------
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
