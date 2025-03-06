import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';

type QuestionStatus = 'approved' | 'pending' | 'rejected';

interface QuestionCardProps {
  league: string;
  match: string;
  question: string;
  submittedTime: string;
  status: QuestionStatus;
  leagueIcon?: React.ReactNode;
}

export default function QuestionCard({
  league,
  match,
  question,
  submittedTime,
  status,
  leagueIcon,
}: QuestionCardProps) {
  // Status colors
  const statusColors = {
    approved: '#2ecc71',
    pending: '#f1c40f',
    rejected: '#e74c3c',
  };

  // Status text
  const statusText = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  };

  // Border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'approved':
        return '#2ecc71';
      case 'pending':
        return '#f1c40f';
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
          {leagueIcon || <Shield size={20} color="#333" />}
          <Text style={styles.leagueText}>{league}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[status] },
          ]}
        >
          <Text style={styles.statusText}>{statusText[status]}</Text>
        </View>
      </View>
      <Text style={styles.matchText}>{match}</Text>
      <Text style={styles.questionText}>{question}</Text>
      <Text style={styles.submittedText}>{submittedTime}</Text>
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
  leagueText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  rejectionReason: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  matchText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  submittedText: {
    color: '#95a5a6',
    fontSize: 12,
  },
});