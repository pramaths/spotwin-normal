import {USER_PARTICIPATION} from '../routes/api';
import apiClient from '@/utils/api';

export const getUserParticipationStatus = async (userId: string, contestId?: string) => {
    try {
        const response = await apiClient(USER_PARTICIPATION(userId), 'GET');
        
        if(response.success && response.data){
            if (contestId) {
                // Check if user is participating in a specific contest
                const contestsArray = Array.isArray(response.data) ? response.data : [];
                return contestsArray.some((contest: any) => contest.id === contestId);
            }
            // Just check if user is participating in any contest
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
};
