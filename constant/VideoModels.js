// Video model definitions for AI Video.
// Shared by the API routes (server) and the AI Video page (client).
//
// Credits: 1 credit = $0.03 of Replicate cost.
// creditsPerSecond = round(Replicate cost per second / 0.03), minimum 1.
// Prices checked on Replicate 2026-10-26.
// This is separate from ModelConfigurations.js on purpose: the image editor builds
// its model dropdown from every entry in that file.

const videoModels = {
  'wan-3': {
    name: 'Wan 3',
    historyModel: 'video-wan-3',
    replicateModel: 'alibaba/wan-3',
    description: 'Fast and affordable. Best for quick drafts and social clips.',
    minDuration: 2,
    maxDuration: 30,
    defaultDuration: 5,
    // Shown to users while a video is being made. Update it if the real wait changes.
    minimumWait: '4 to 5 minutes',
    resolutions: ['480p', '720p', '1080p'],
    defaultResolution: '480p',
    aspectRatios: ['adaptive', '16:9', '9:16', '1:1', '4:3', '3:4'],
    defaultAspectRatio: 'adaptive',
    supportsAudioToggle: false,
    // $0.025 / $0.05 / $0.10 per second
    creditsPerSecond: { '480p': 1, '720p': 2, '1080p': 3 },
  },
  'seedance-2.5': {
    name: 'Seedance 2.5',
    historyModel: 'video-seedance-2.5',
    replicateModel: 'bytedance/seedance-2.5',
    description: 'Higher quality motion with synchronized audio.',
    minDuration: 4,
    maxDuration: 30,
    defaultDuration: 5,
    // Shown to users while a video is being made. Update it if the real wait changes.
    minimumWait: '4 to 5 minutes',
    resolutions: ['480p', '720p'],
    defaultResolution: '480p',
    aspectRatios: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9', 'adaptive'],
    defaultAspectRatio: '16:9',
    supportsAudioToggle: true,
    // $0.1028 / $0.2312 per second. Audio does not change the price.
    creditsPerSecond: { '480p': 3, '720p': 8 },
    // $0.4304 / $0.9676 per second when a reference video is supplied.
    // Not exposed yet: reference videos are not supported in the UI or the API.
    creditsPerSecondWithReferenceVideo: { '480p': 14, '720p': 32 },
  },
};

// Videos are stored in History and PublishedImage under these model names.
export const VIDEO_HISTORY_MODELS = Object.values(videoModels).map((m) => m.historyModel);

// True for the stored video model names and for the playground's 'ai-video' model key
export function isVideoModel(model) {
  return typeof model === 'string' && (model === 'ai-video' || model.startsWith('video-'));
}

// Total credits for one video, or null if the options are not valid for the model.
export function getVideoCredits(modelKey, { resolution, duration, hasReferenceVideo = false } = {}) {
  const model = videoModels[modelKey];
  if (!model) return null;
  if (!Number.isInteger(duration) || duration < model.minDuration || duration > model.maxDuration) return null;

  const table = hasReferenceVideo ? model.creditsPerSecondWithReferenceVideo : model.creditsPerSecond;
  const perSecond = table?.[resolution];
  if (!perSecond) return null;

  return perSecond * duration;
}

export default videoModels;
