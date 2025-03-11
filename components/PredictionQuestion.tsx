import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ContestJoinModal from './ContestJoinModal';
import { IContest, IContestWithVideos } from '@/types';
import { useContestsStore } from '@/store/contestsStore';

interface PredictionQuestionProps {
    id: string;
    question: string;
    matchImage: string;
    timeRemaining: string;
    contest: IContestWithVideos | null;
    isUserParticipating: boolean;
}

const PredictionQuestion = ({
    id,
    question,
    matchImage,
    timeRemaining,
    contest,
    isUserParticipating
}: PredictionQuestionProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { userContests } = useContestsStore();
    
    const handleContainerPress = () => {
        if (contest) {
            const isAlreadyParticipating = userContests.some(
                userContest => userContest.id === contest.id
            );
            
            if (isAlreadyParticipating) {
                Alert.alert(
                    "Already Participating",
                    "You're already participating in this contest.",
                    [{ text: "OK" }]
                );
            } else {
                setModalVisible(true);
            }
        }
    };
    
    const handleCloseModal = () => {
        setModalVisible(false);
    };
    
    return (
        <TouchableOpacity 
            style={styles.container} 
            activeOpacity={0.9}
            onPress={handleContainerPress}
        >
            <Image source={{ uri: matchImage }} style={styles.image} />

            <View style={styles.overlay}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>Ends in: {timeRemaining}</Text>
                </View>

                <View style={styles.bottomContent}>
                    {question ? (
                        <View style={styles.questionContainer}>
                            <View style={styles.blurContainer}>
                                <Text style={styles.questionText}>{question}</Text>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>
            
            {contest && (
                <ContestJoinModal
                    isVisible={modalVisible}
                    onClose={handleCloseModal}
                    contest={contest}
                    onConfirm={handleCloseModal}
                    isUserParticipating={isUserParticipating}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    image: {
        width: '100%',
        height: 260,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    timeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 6,
        borderRadius: 12,
    },
    timeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
    },
    bottomContent: {
        marginTop: 'auto',
    },
    questionContainer: {
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    blurContainer: {
        paddingHorizontal: 2,
    },
    questionText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
});

export default PredictionQuestion;
