import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PredictionQuestionProps {
    id: string;
    question: string;
    matchImage: string;
    league: string;
    teams: string;
    timeRemaining: string;
    onAnswer: (id: string, answer: 'YES' | 'NO') => void;
    onQuestionPress?: (id: string) => void; // New prop for handling question press
}

const PredictionQuestion = ({
    id,
    question,
    matchImage,
    timeRemaining,
    onAnswer,
    onQuestionPress,
}: PredictionQuestionProps) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: matchImage }} style={styles.image} />

            <View style={styles.overlay}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>Ends in: {timeRemaining}</Text>
                </View>

                <View style={styles.bottomContent}>
                    <TouchableOpacity 
                        style={styles.questionContainer}
                        onPress={() => onQuestionPress && onQuestionPress(id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.questionInnerContainer}>
                            <Text style={styles.questionText}>{question}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            activeOpacity={0.8}
                            onPress={() => onAnswer(id, 'YES')}
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
                            onPress={() => onAnswer(id, 'NO')}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
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
            web: {
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    image: {
        width: '100%',
        height: 260,
        borderRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    timeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
        width: '100%',
    },
    questionContainer: {
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 4,
    },
    questionInnerContainer: {
        paddingVertical: 6,
        width: '100%',
    },
    questionText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'transparent', 
        textAlign: 'left',
        justifyContent: 'flex-start',
        textShadowColor: 'rgba(1, 1, 1, 0.9)',
        textShadowOffset: { width: 0, height: 0 }, 
        textShadowRadius: 6, 
    },
    
    buttonsContainer: {
        flexDirection: 'row',
        gap: 8,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonWrapper: {
        width: '50%',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.2)',
            },
        }),
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 5,
        letterSpacing: 0.5,
    },
});

export default PredictionQuestion;