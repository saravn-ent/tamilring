'use server'

// Re-export specific actions to maintain backward compatibility
// Admin Actions
export {
    approveRingtone,
    bulkApproveRingtones,
    rejectRingtone,
    updateWithdrawalStatus,
    deleteRingtone,
    bulkDeleteRingtones,
    updateRingtoneMetadata,
    toggleUserRole,
    backfillRingtoneArtwork
} from './actions/admin';

// Ringtone Actions
export {
    getUserLanguage,
    incrementLikes,
    incrementDownloads,
    revalidateArtistCache,
    notifyAdminOnUpload,
    getTrendingRingtones,
    getTopAlbums,
    logSearch,
    getTrendingTags,
    getSimilarRingtones,
    processAutoApproval
} from './actions/ringtones';

// User Actions
export {
    handleUploadReward,
    handleWithdrawal,
    syncProfileStats
} from './actions/user';
