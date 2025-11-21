import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import Header from "../components/Header";

export default function EditBookScreen({ route, navigation }) {
  const { book } = route.params;

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description || "");
  const [price, setPrice] = useState(book.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(book.image);

  const [uploading, setUploading] = useState(false);

  // ⭐ Cloudinary Config (same format as AddBookScreen)
  const CLOUD_NAME = "bookrental-81"; 
  const UPLOAD_PRESET = "my_bookapp_preset";

  // ----------------------------------------------------------
  // 📸 PICK NEW IMAGE
  // ----------------------------------------------------------
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!res.canceled) {
        setImageUrl(res.assets[0].uri);
      }
    } catch (err) {
      console.log("Image Picker Error:", err);
      Alert.alert("Error picking image");
    }
  };

  // ----------------------------------------------------------
  // ☁ UPLOAD IMAGE TO CLOUDINARY
  // ----------------------------------------------------------
  const uploadToCloudinary = async (localUri) => {
    if (localUri === book.image) return book.image; // No change in image

    setUploading(true);

    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "book.jpg",
    });

    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setUploading(false);

      if (!data.secure_url) {
        throw new Error("Image upload failed");
      }

      return data.secure_url;
    } catch (err) {
      setUploading(false);
      console.log("Cloudinary Upload Error:", err);
      Alert.alert("Upload Failed", "Could not upload image.");
      return book.image;
    }
  };

  // ----------------------------------------------------------
  // 💾 UPDATE BOOK IN FIRESTORE
  // ----------------------------------------------------------
  const handleUpdate = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Missing Fields", "Title and Author are required.");
      return;
    }

    try {
      const finalImageUrl = await uploadToCloudinary(imageUrl);

      await updateDoc(doc(db, "books", book.id), {
        title,
        author,
        description,
        price: parseFloat(price) || 0,
        image: finalImageUrl,
      });

      Alert.alert("Success", "Book updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.log("Update Error:", err);
      Alert.alert("Failed to update book");
    }
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <ScrollView style={styles.container}>
      <Header
        title="Edit Book"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.formContainer}>
        <Text style={styles.label}>Book Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter book title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Author</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter author name"
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Price in ₹"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          placeholder="Enter book description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
          <Text style={styles.imgBtnText}>Change Book Image</Text>
        </TouchableOpacity>

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
        )}

        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={{ marginTop: 8 }}>Uploading...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateText}>Update Book</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// ----------------------------------------------------------
// 🎨 STYLES
// ----------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imgBtn: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  imgBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    marginTop: 15,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
  },
  updateText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
