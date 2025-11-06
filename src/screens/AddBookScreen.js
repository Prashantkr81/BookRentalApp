import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../services/firebaseConfig";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Ask for permission once when the screen loads
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your media library to upload book images.");
      }
    })();
  }, []);

  // 📸 Pick image from gallery
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
      Alert.alert("Error picking image", error.message);
    }
  };

  // 🧾 Upload book info and image
  const uploadBook = async () => {
    if (!title || !author || !image) {
      Alert.alert("Please fill all fields and select an image.");
      return;
    }

    try {
      setUploading(true);

      // ✅ Upload image to Firebase Storage
      const imageRef = ref(storage, `books/${Date.now()}.jpg`);
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      // ✅ Save data in Firestore
      await addDoc(collection(db, "books"), {
        title,
        author,
        description,
        image: imageUrl,
        ownerId: auth.currentUser?.uid,
        isAvailable: true,
        rentedBy: null,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setAuthor("");
      setDescription("");
      setImage(null);
      Alert.alert("✅ Book added successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Upload failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <TextInput
        placeholder="Book Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Author Name"
        value={author}
        onChangeText={setAuthor}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, height: 80 }}
      />
      <Button title="Select Book Image" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 250, marginTop: 15, borderRadius: 10 }}
        />
      )}
      <Button
        title={uploading ? "Uploading..." : "Add Book"}
        onPress={uploadBook}
        disabled={uploading}
      />
    </ScrollView>
  );
}
