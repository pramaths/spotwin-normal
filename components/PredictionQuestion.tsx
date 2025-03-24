import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ContestJoinModal from './ContestJoinModal';
import { IContest, IDifficultyLevel } from '@/types';
import { useContestsStore } from '@/store/contestsStore';
import moment from 'moment';

interface PredictionQuestionProps {
    id: string;
    question: string;
    timeRemaining: string;
    contest: IContest | null;
    difficultyLevel: IDifficultyLevel;
    isUserParticipating: boolean;
}

const PredictionQuestion = ({
    id,
    question,
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
    
    const getDifficultyColor = () => {
        switch (difficultyLevel) {
            case IDifficultyLevel.EASY:
                return '#4CAF50'; // Green
            case IDifficultyLevel.MEDIUM:
                return '#FF9800'; // Orange
            case IDifficultyLevel.HARD:
                return '#F44336'; // Red
            default:
                return '#E0E0E0';
        }
    };
    
    const getDifficultyGradient = () => {
        switch (difficultyLevel) {
            case IDifficultyLevel.EASY:
                return ['rgba(76, 175, 80, 0.1)', 'rgba(76, 175, 80, 0.03)'] as const; // Green tint
            case IDifficultyLevel.MEDIUM:
                return ['rgba(255, 152, 0, 0.1)', 'rgba(255, 152, 0, 0.03)'] as const; // Orange tint
            case IDifficultyLevel.HARD:
                return ['rgba(244, 67, 54, 0.1)', 'rgba(244, 67, 54, 0.03)'] as const; // Red tint
            default:
                return ['#ffffff', '#ffffff'] as const;
        }
    };
    
    return (
        <TouchableOpacity 
            style={styles.container} 
            activeOpacity={0.9}
            onPress={handleContainerPress}
        >
            <LinearGradient
                colors={getDifficultyGradient()}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
                            <Text style={styles.difficultyText}>
                                {difficultyLevel}
                            </Text>
                        </View>
                        
                        <View style={styles.timeSection}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.timeText}> Starting in {moment(timeRemaining).fromNow()}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.questionSection}>
                        <Text style={styles.questionText}>{question}</Text>
                    </View>
                    
                    <View style={styles.actionRow}>
                        <View style={styles.actionButton}>
                            <Ionicons name="arrow-forward-outline" size={16} color={getDifficultyColor()} />
                            <Text style={[styles.actionText, { color: getDifficultyColor() }]}>View Details</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
            
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
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    gradientBackground: {
        width: '100%',
    },
    contentContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionSection: {
        marginBottom: 16,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        lineHeight: 22,
    },
    difficultyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'capitalize',
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
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 2,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default PredictionQuestion;
