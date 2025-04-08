import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import HeaderProfile from '../../components/HeaderProfile';
import { useUserStore } from '../../store/userStore';
import { getUserBalance } from '../../utils/common';
import { AUTH_ME } from '../../routes/api';
import apiClient from '../../utils/api';
import { IUser, ITicket } from '../../types';
import { RefreshCw, CheckCircle, Sparkles } from 'lucide-react-native';
import { GET_ALL_TICKETS, BUY_TICKET } from '../../routes/api';

const BuyTicketsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [iplTickets, setIplTickets] = useState<ITicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const shineDegree = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const shimmerAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    fetchUser();
    fetchUserBalance();
    fetchAllTickets();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient<IUser>(AUTH_ME, 'GET');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      if (user?.id) {
        const balance = await getUserBalance(user.id);
        setUserBalance(balance !== undefined ? balance : 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchUserBalance(), fetchAllTickets()]);
    setRefreshing(false);
  };

  const fetchAllTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const response = await apiClient<ITicket[]>(GET_ALL_TICKETS, 'GET');
      if (response.success && response.data) {
        setIplTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleBuyTicket = async (ticketId: string) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsPurchasing(ticketId);

    console.log("handleBuyTicket called with ticketId:", ticketId);
    
    try {
      const ticket = iplTickets.find(t => t.id === ticketId);
      if (!ticket) {
        console.error("Ticket not found for ID:", ticketId);
        setErrorMessage("Ticket not found. Please try again.");
        return;
      }
      
      console.log("Found ticket:", ticket);
      
      if (userBalance < ticket.costPoints) {
        const pointsNeeded = ticket.costPoints - userBalance;
        console.log(`Insufficient balance. Need ${pointsNeeded} more points`);
        setErrorMessage(`Insufficient balance. You need ${pointsNeeded} more points. Play more contests and try again!.`);
        return;
      }
      
      console.log(`Attempting to purchase ticket: ${ticketId}, API endpoint: ${BUY_TICKET}`);
      
      const response = await apiClient(BUY_TICKET, 'POST', { ticketId: ticketId });
      console.log("API response:", response);
      
      if (response.success) {
        setSuccessMessage('Ticket purchased successfully. Will receive a call from our team to confirm the purchase, if you have any questions please contact us!');
        setUserBalance(prevBalance => prevBalance - ticket.costPoints);
        
        await fetchUser();
        await fetchUserBalance();
      } else {
        console.error("Purchase failed:", response.message);
        setErrorMessage(response.message || 'Failed to purchase ticket. Please try again.');
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      setErrorMessage('Failed to purchase ticket. Please try again.');
    } finally {
      setIsPurchasing(null);
      
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 4000);
    }
  };
  // Render skeleton loading for tickets
  const renderSkeletonTickets = () => {
    const shimmerTranslate = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-350, 350]
    });

    return Array.from({ length: 3 }).map((_, index) => (
      <View key={`skeleton-${index}`} style={styles.ticketCard}>
        <LinearGradient
          colors={['rgba(25, 25, 35, 0.95)', 'rgba(12, 12, 20, 0.98)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.glassContainer}>
            {/* Premium gold border overlay */}
            <View style={[styles.goldBorder, { pointerEvents: 'none' }]} />
            
            {/* Holographic pattern background */}
            <LinearGradient
              colors={['#2c2c54', '#1f1f3a', '#14142c']}
              style={styles.holographicBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.ticketHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
            
            <View style={styles.ticketBody}>
              <View style={styles.teamsContainer}>
                <View style={styles.teamContainer}>
                  <View style={styles.skeletonTeamLogo} />
                </View>
                
                <View style={styles.vsContainer}>
                  <View style={styles.skeletonVsCircle} />
                </View>
                
                <View style={styles.teamContainer}>
                  <View style={styles.skeletonTeamLogo} />
                </View>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.actionContainer}>
                <View style={styles.priceContainer}>
                  <View style={styles.skeletonPriceLabel} />
                  <View style={styles.skeletonPriceValue} />
                  <View style={styles.skeletonPriceCurrency} />
                </View>
                
                <View style={styles.skeletonBuyButton} />
              </View>
            </View>
            
            <View style={styles.shineContainer}>
              <Animated.View 
                style={[
                  styles.shine, 
                  { 
                    transform: [
                      { translateX: shimmerTranslate },
                      { rotate: '45deg' }
                    ] 
                  }
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    ));
  };

  const renderTicketCard = (ticket: ITicket) => {
    const translateX = shineDegree.interpolate({
      inputRange: [0, 1],
      outputRange: [-350, 350]
    });

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <View key={ticket.id} style={styles.ticketCard}>
        <LinearGradient
          colors={['#1A237E', '#0D1642']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.glassContainer}>
            {/* Premium gold border overlay */}
            <View style={[styles.goldBorder, { pointerEvents: 'none' }]} />
            
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>{ticket.teamA.name} vs {ticket.teamB.name}</Text>
              <Text style={styles.ticketInfo}>{ticket.stadium}</Text>
            </View>
            
            <View style={styles.ticketBody}>
              <View style={styles.teamsContainer}>
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: ticket.teamA.imageUrl }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.vsContainer}>
                  <LinearGradient
                    colors={['#FFEB3B', '#FFC107']}
                    style={styles.vsCircle}
                  >
                    <Text style={styles.vsText}>VS</Text>
                  </LinearGradient>
                  <View style={styles.vsLine} />
                </View>
                
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: ticket.teamB.imageUrl }}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>
              
              <View style={styles.separator} />
              
              <View style={styles.actionContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>PRICE</Text>
                  <Text style={styles.priceValue}>{ticket.costPoints}</Text>
                  <Text style={styles.priceCurrency}>points</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={() => {
                    console.log('Buy button pressed for ticket:', ticket.id);
                    console.log('Button pressed at:', new Date().toISOString());
                    handleBuyTicket(ticket.id);
                  }}
                  disabled={isPurchasing === ticket.id}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2', '#0D47A1']}
                    style={styles.buyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isPurchasing === ticket.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buyButtonText}>BUY NOW</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Luxury badge */}
            <View style={styles.luxuryBadge}>
              <Sparkles size={10} color="#2196F3" />
              <Text style={styles.luxuryText}>PREMIUM</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HeaderProfile />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} 
            colors={["#3F51B5"]}
            tintColor="#3F51B5"
          />
        }
      >
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#E8EAF6', '#C5CAE9']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceTitle}>BALANCE</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>{userBalance} <Text style={styles.pointsText}>points</Text></Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchUserBalance}
                  disabled={isLoadingBalance}
                >
                  {isLoadingBalance ? (
                    <ActivityIndicator size="small" color="#3F51B5" />
                  ) : (
                    <RefreshCw size={16} color="#3F51B5" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {successMessage && (
          <View style={styles.successMessage}>
            <CheckCircle color="#4CAF50" size={16} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}
        
        {errorMessage && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>IPL tickets</Text>
        </View>
        
        {isLoadingTickets ? renderSkeletonTickets() : iplTickets.map(ticket => renderTicketCard(ticket))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  balanceContent: {
    padding: 16,
    position: 'relative',
  },
  balanceGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.3)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3F51B5',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1A237E',
  },
  pointsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(63, 81, 181, 0.7)',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.3)',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  successText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1A237E',
    letterSpacing: 0.5,
  },
  ticketCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.3)',
    position: 'relative',
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.3)',
    borderRadius: 20,
    zIndex: 10,
  },
  holographicBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ticketHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    zIndex: 2,
  },
  ticketTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketInfo: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ticketBody: {
    padding: 12,
    position: 'relative',
    zIndex: 2,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    position: 'relative',
  },
  teamLogo: {
    width: 60,
    height: 60,
    zIndex: 2,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  vsLine: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },
  vsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 3,
    letterSpacing: 1,
  },
  priceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  priceCurrency: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  buyButton: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
    minWidth: 100,
    minHeight: 45,
  },
  buyButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  shineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 3,
  },
  shine: {
    position: 'absolute',
    top: -200,
    left: -200,
    width: 15,
    height: 600,
    backgroundColor: 'rgba(63, 81, 181, 0.3)',
  },
  shineSecondary: {
    position: 'absolute',
    top: -200,
    left: -200,
    width: 8,
    height: 600,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
  },
  tearLine: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  tearDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(63, 81, 181, 0.5)',
  },
  qrCodeContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  qrCode: {
    width: 35,
    height: 35,
    opacity: 0.8,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#F44336',
  },
  // Skeleton loading styles
  skeletonTitle: {
    height: 24,
    width: '80%',
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: '60%',
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 4,
  },
  skeletonTeamLogo: {
    width: 65,
    height: 65,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 32.5,
  },
  skeletonVsCircle: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 18,
  },
  skeletonPriceLabel: {
    height: 10,
    width: 40,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  skeletonPriceValue: {
    height: 24,
    width: 60,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 4,
    marginBottom: 2,
  },
  skeletonPriceCurrency: {
    height: 12,
    width: 40,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 2,
  },
  skeletonBuyButton: {
    height: 40,
    width: 100,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    borderRadius: 10,
  },
  // Luxury badge
  luxuryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.5)',
    zIndex: 5,
  },
  luxuryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: '#2196F3',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
});

export default BuyTicketsScreen; 