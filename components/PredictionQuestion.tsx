import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ContestJoinModal from './ContestJoinModal';
import { IContest } from '@/types';

interface PredictionQuestionProps {
    id: string;
    question: string;
    matchImage: string;
    league: string;
    teams: string;
    timeRemaining: string;
    onAnswer: (id: string, answer: 'YES' | 'NO') => void;
    onQuestionPress?: (id: string) => void;
    contest?: IContest;
}

const PredictionQuestion = ({
    id,
    question,
    matchImage,
    timeRemaining,
    onAnswer,
    onQuestionPress,
    contest,
}: PredictionQuestionProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<'YES' | 'NO' | null>(null);
    
    // Default contest if none provided
    const defaultContest: IContest = {
        id: "default-contest",
        name: question,
        entryFee: 49,
        currency: "USD",
        description: "Answer prediction questions to win prizes",
        status: "OPEN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        event: {
            id: "default-event",
            title: "Sports Prediction",
            description: "Sports prediction event",
            eventImageUrl: matchImage,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 3600000).toISOString(),
            status: "OPEN",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sport: {
                id: "default-sport",
                name: "Mixed Sports",
                description: "Various sports predictions",
                imageUrl: "",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            teamA: {
                id: "team-a",
                name: "Team A",
                imageUrl: "",
                country: "Country A"
            },
            teamB: {
                id: "team-b",
                name: "Team B",
                imageUrl: "",
                country: "Country B"
            }
        }
    };
    
    const handleAnswerPress = (answer: 'YES' | 'NO') => {
        setSelectedAnswer(answer);
        setModalVisible(true);
    };
    
    const handleConfirmAnswer = () => {
        if (selectedAnswer) {
            onAnswer(id, selectedAnswer);
        }
        setModalVisible(false);
    };
    
    const handleCloseModal = () => {
        setModalVisible(false);
    };
    
    return (
        <View style={styles.container}>
            <Image source={{ uri: matchImage }} style={styles.image} />

            <View style={styles.overlay}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>Ends in: {timeRemaining}</Text>
                </View>

                <View style={styles.bottomContent}>
                    {question ? (
                        <TouchableOpacity
                            style={styles.questionContainer}
                            onPress={() => onQuestionPress && onQuestionPress(id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.blurContainer}>
                                <Text style={styles.questionText}>{question}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            activeOpacity={0.8}
                            onPress={() => handleAnswerPress('YES')}
                        >
                            <LinearGradient
                                colors={['#00E676', '#00C853']}
                                style={styles.button}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                                <Text style={styles.buttonText}>YES</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            activeOpacity={0.8}
                            onPress={() => handleAnswerPress('NO')}
                        >
                            <LinearGradient
                                colors={['#FF5252', '#D50000']}
                                style={styles.button}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                                <Text style={styles.buttonText}>NO</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            <ContestJoinModal
                isVisible={modalVisible}
                onClose={handleCloseModal}
                contest={contest || defaultContest}
                onConfirm={handleConfirmAnswer}
            />
        </View>
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
        // resizeMode: 'cover',
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
        padding:4,
        borderRadius:12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    buttonWrapper: {
        flex: 1,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default PredictionQuestion;
