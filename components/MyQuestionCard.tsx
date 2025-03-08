import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type QuestionStatus = 'PENDING' | 'ANSWERED' | 'EXPIRED' | 'approved' | 'pending' | 'rejected';

interface QuestionCardProps {
  question: string;
  matchImage?: string;
  league: string;
  leagueImage?: string;
  teams: string;
  timeRemaining?: string;
  status: QuestionStatus;
  answer?: string | null;
  submittedTime?: string;
  rejectionReason?: string;
}

export default function MyQuestionCard({
  question,
  league,
  leagueImage,
  teams,
  status,
  answer,
  submittedTime,
  rejectionReason,
}: QuestionCardProps) {
  // Status colors
  const statusColors: Record<string, string> = {
    PENDING: '#f1c40f',
    ANSWERED: '#2ecc71',
    EXPIRED: '#e74c3c',
    approved: '#2ecc71',
    pending: '#f1c40f',
    rejected: '#e74c3c',
  };

  // Status text
  const statusText: Record<string, string> = {
    PENDING: 'Pending',
    ANSWERED: 'Answered',
    EXPIRED: 'Expired',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  };

  // Border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'ANSWERED':
      case 'approved':
        return '#2ecc71';
      case 'PENDING':
      case 'pending':
        return '#f1c40f';
      case 'EXPIRED':
      case 'rejected':
        return '#e74c3c';
      default:
        return '#e0e0e0';
    }
  };

  return (
    <View style={[styles.container, { borderColor: getBorderColor() }]}>
      <View style={styles.header}>
        <View style={styles.leagueContainer}>
          {leagueImage ? (
            <Image 
              source={{ uri: leagueImage }} 
              style={styles.leagueImage} 
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <Text style={styles.leagueText}>{league}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[status] || '#f1c40f' },
          ]}
        >
          <Text style={styles.statusText}>{statusText[status] || 'Pending'}</Text>
        </View>
      </View>
      
      <Text style={styles.teamsText}>{teams}</Text>
      <Text style={styles.questionText}>{question}</Text>
      
      {submittedTime && (
        <Text style={styles.submittedText}>{submittedTime}</Text>
      )}
      
      {rejectionReason && status === 'rejected' && (
        <Text style={styles.rejectionReason}>
          {rejectionReason}
        </Text>
      )}
      
      {answer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Your answer:</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leagueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  leagueText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  teamsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  submittedText: {
    color: '#95a5a6',
    fontSize: 12,
    marginTop: 4,
  },
  rejectionReason: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginRight: 8,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
});