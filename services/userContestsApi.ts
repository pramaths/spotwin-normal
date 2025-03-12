import {USER_PARTICIPATION} from '../routes/api';
import apiClient from '@/utils/api';

export const getUserParticipationStatus = async (userId: string) => {
    try {
        const response = await apiClient(USER_PARTICIPATION(userId), 'GET');
        if(response.success && response.data){
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
};
