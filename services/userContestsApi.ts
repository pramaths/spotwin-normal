import {USER_PARTICIPATION} from '../routes/api';
import apiClient from '@/utils/api';

export const getUserParticipationStatus = async (userId: string, contestId?: string) => {
    try {
        const response = await apiClient(USER_PARTICIPATION(userId), 'GET');
        
        if(response.success && response.data){
            if (contestId) {
                const contestsArray = Array.isArray(response.data) ? response.data : [];
                return contestsArray.some((contest: any) => contest.id === contestId);
            }
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
};
