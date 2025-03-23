import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ContestJoinModal from './ContestJoinModal';
import { IContest, IDifficultyLevel } from '@/types';
import { useContestsStore } from '@/store/contestsStore';

interface PredictionQuestionProps {
    id: string;
    question: string;
    matchImage: string;
    timeRemaining: string;
    contest: IContest | null;
    difficultyLevel: IDifficultyLevel;
    isUserParticipating: boolean;
}

const PredictionQuestion = ({
    id,
    question,
    matchImage,
    timeRemaining,
    contest,
    difficultyLevel,
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
            <View style={styles.contentContainer}>
                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>{question}</Text>
                    <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                            {difficultyLevel}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.timeSection}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.timeText}>{timeRemaining}</Text>
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    contentContainer: {
        padding: 12,
    },
    questionSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    questionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    difficultyBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    difficultyText: {
        fontSize: 12,
        color: '#666',
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
});

export default PredictionQuestion;
