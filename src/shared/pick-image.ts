import * as ImagePicker from "expo-image-picker";

async function pickImage(): Promise<{ base64?: string } | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.cancelled) {
      return null;
    }

    return { base64: result.base64 };
  } catch (e) {
    throw new Error(e as any);
  }
}

export { pickImage };
