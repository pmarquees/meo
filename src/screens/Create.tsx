import {
  EventListenerCallback,
  EventMapCore,
  NavigationProp,
  NavigationState,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, NativeMethods } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Frame } from "../components/Frame";
import { Picture } from "../components/Picture";
import { UserAvatar } from "../components/UserAvatar";
import { useCreatePost } from "../hooks/use-create-post";
import { PostLayout } from "../layouts/PostLayout";
import { NavigationParamsConfig } from "../shared/NavigationParamsConfig";
import { base64ToImageUrl } from "../shared/image-utils";
import { pickImage } from "../shared/pick-image";

function Create() {
  const params = useRoute<RouteProp<NavigationParamsConfig, "Create">>().params;
  const ref = useRef<(TextInput & NativeMethods) | null>(null);
  const [text, changeText] = useState(params?.initialTextContent || "");
  const [image, setImage] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<NavigationParamsConfig>>();
  const { mutate: createPost, status } = useCreatePost({
    onSuccess: () => {
      navigation.navigate(params?.onSuccesRoute || "Home", {
        resetScroll: true,
      });
    },
  });

  useEffect(() => {
    const listener: EventListenerCallback<
      EventMapCore<NavigationState<NavigationParamsConfig>>,
      "beforeRemove"
    > = (event) => {
      if (!text || status !== "idle") {
        return;
      }

      event.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure to leave?",
        [
          { text: "Don't leave", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(event.data.action),
          },
        ]
      );
    };

    navigation.addListener("beforeRemove", listener);
    return () => navigation.removeListener("beforeRemove", listener);
  }, [createPost, navigation, status, text]);

  /**
   * autoFocus on TextInput would do the job, BUT for some reason
   * it bugs `KeyboardAvoidingView` used on PostInputAccessory component
   *
   * Focusing manually seems to have fixed the problem, RN4LIFE
   */
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <PostLayout
      ref={ref}
      text={text}
      changeText={changeText}
      onAddImagePress={
        image
          ? undefined
          : async () => {
              const result = await pickImage();
              if (result?.base64) {
                setImage(result.base64);
              }
            }
      }
      bottomChildren={
        image ? (
          <Frame marginTop="small" paddingHorizontal="medium">
            <Picture source={{ uri: base64ToImageUrl(image) }} />
          </Frame>
        ) : null
      }
      onCreatePostPress={() => {
        if (text) {
          createPost({ text, image });
        }
      }}
    >
      <Frame
        alignItems="center"
        alignSelf="flex-start"
        justifyContent="center"
        width="larger"
        marginRight="medium"
      >
        <UserAvatar size="larger" />
      </Frame>
    </PostLayout>
  );
}

export { Create };
