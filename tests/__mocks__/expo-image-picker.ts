export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const requestCameraPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const getMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const getCameraPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const launchImageLibraryAsync = jest.fn().mockResolvedValue({
  cancelled: false,
  assets: [
    {
      uri: 'file://photo.jpg',
      width: 100,
      height: 100,
      type: 'image',
    },
  ],
});

export const launchCameraAsync = jest.fn().mockResolvedValue({
  cancelled: false,
  assets: [
    {
      uri: 'file://photo.jpg',
      width: 100,
      height: 100,
      type: 'image',
    },
  ],
});

export const MediaTypeOptions = {
  Images: 'images',
  Videos: 'videos',
  All: 'all',
};

export default {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  getCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
};

