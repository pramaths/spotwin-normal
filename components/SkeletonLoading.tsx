import React from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 32) / 2; // Accounting for margins and padding

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem = ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['#EAEAEA', '#F5F5F5', '#EAEAEA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </View>
  );
};

export const ContestCardSkeleton = () => {
  return (
    <View style={styles.contestCardSkeleton}>
      <View style={styles.teamsContainer}>
        <View style={styles.teamSection}>
          <SkeletonItem width={40} height={40} borderRadius={20} />
          <SkeletonItem width={60} height={16} style={{ marginTop: 8 }} />
        </View>
        
        <SkeletonItem width={20} height={16} style={{ marginHorizontal: 8 }} />
        
        <View style={styles.teamSection}>
          <SkeletonItem width={40} height={40} borderRadius={20} />
          <SkeletonItem width={60} height={16} style={{ marginTop: 8 }} />
        </View>
      </View>

      <View style={styles.contestInfo}>
        <SkeletonItem width={120} height={18} style={{ marginBottom: 8 }} />
        <SkeletonItem width={100} height={14} />
      </View>
    </View>
  );
};

export const PredictionQuestionSkeleton = () => {
  return (
    <View style={styles.predictionCardSkeleton}>
      <SkeletonItem height={160} borderRadius={12} />
      <View style={styles.questionSkeleton}>
        <SkeletonItem width="80%" height={20} style={{ marginBottom: 12 }} />
        <View style={styles.buttonsSkeleton}>
          <SkeletonItem width="45%" height={40} borderRadius={20} />
          <SkeletonItem width="45%" height={40} borderRadius={20} />
        </View>
      </View>
    </View>
  );
};

export const PredictionGridSkeleton = () => {
  return (
    <View style={styles.gridContainer}>
      {/* First Row */}
      <View style={styles.row}>
        <View style={styles.questionWrapper}>
          <PredictionQuestionSkeleton />
        </View>
        <View style={styles.questionWrapper}>
          <PredictionQuestionSkeleton />
        </View>
      </View>
      
      {/* Second Row */}
      <View style={styles.row}>
        <View style={styles.questionWrapper}>
          <PredictionQuestionSkeleton />
        </View>
        <View style={styles.questionWrapper}>
          <PredictionQuestionSkeleton />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contestCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamSection: {
    alignItems: 'center',
    width: 100,
  },
  contestInfo: {
    marginTop: 8,
  },
  predictionCardSkeleton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionSkeleton: {
    padding: 12,
  },
  buttonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
});
