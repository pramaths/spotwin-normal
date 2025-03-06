import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Check, Upload, Video as VideoIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const ContributePage = () => {
  const [question, setQuestion] = useState('');
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoError, setVideoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPermission, setMediaPermission] = useState<string | null>(null);
  const videoRef = useRef(null);
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaPermission(status);
    })();
  }, []);

  const animateCheckmark = () => {
    checkmarkScale.setValue(0);
    checkmarkOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 4
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease
      })
    ]).start();
  };

  const pickVideo = async () => {
    setVideoError('');
    
    if (mediaPermission !== 'granted') {
      setVideoError('Permission to access media library is required!');
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        aspect: [16, 9],
      });

      console.log(result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        setVideoUri(result.assets[0].uri);
        
        // Simulate upload process - in a real app, you would upload to your server here
        setTimeout(() => {
          setUploading(false);
          setVideoUploaded(true);
          animateCheckmark(); // Trigger animation when upload completes
        }, 1500);
      }
    } catch (error: any) {
      setVideoError('Error picking video: ' + error.message);
      setUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoUri(null);
    setVideoUploaded(false);
    checkmarkScale.setValue(0);
    checkmarkOpacity.setValue(0);
  };

  const handleSubmit = () => {
    if (!videoUploaded || !question.trim()) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate back to contests or show success
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Contribute to contest</Text>
          </View>

          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Guidelines</Text>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>Ensure your question can be answered with Yes/No</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>Check for grammatical errors</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>Keep questions clear and concise</Text>
            </View>
            <View style={styles.guidelineItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.guidelineText}>Video should be relevant to the question</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.uploadButton, 
              videoUploaded && styles.uploadButtonSuccess,
              Platform.OS === 'android' && styles.uploadButtonAndroid
            ]} 
            onPress={pickVideo}
            disabled={uploading || videoUploaded}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : videoUploaded ? (
              <>
                <Animated.View style={{
                  transform: [{ scale: checkmarkScale }],
                  opacity: checkmarkOpacity,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Check color="#FFFFFF" size={20} />
                  <Text style={styles.uploadButtonText}>Video Uploaded</Text>
                </Animated.View>
              </>
            ) : (
              <>
                <VideoIcon color="#FFFFFF" size={20} />
                <Text style={styles.uploadButtonText}>Upload Video</Text>
              </>
            )}
          </TouchableOpacity>
          
          {videoError ? (
            <Text style={styles.errorText}>{videoError}</Text>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a Yes/No question here..."
              placeholderTextColor="#9CA3AF"
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={100}
            />
          </View>

          <View style={styles.singleButtonContainer}>
            <TouchableOpacity 
              style={[
                styles.submitButtonFull, 
                (!question.trim() || !videoUploaded) && styles.submitButtonDisabled,
                Platform.OS === 'android' && styles.buttonAndroid
              ]} 
              onPress={handleSubmit}
              disabled={!question.trim() || !videoUploaded || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A3A',
  },
  guidelinesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A3A',
    marginBottom: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginTop: 6,
    marginRight: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  uploadButtonAndroid: {
    elevation: 4,
    borderRadius: 8,
  },
  uploadButtonSuccess: {
    backgroundColor: '#10B981',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoPreviewContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  removeVideoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: Platform.OS === 'android' ? 4 : 2,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1A1A3A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  singleButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  buttonAndroid: {
    elevation: 4,
  },
  submitButtonFull: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5A6F6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContributePage;
