import { appAxios } from '@/services/interceptors';
import { ApiRoutes } from '@/utils/constants';

export default {
  /**
   * @function getFile
   * Fetch the contents of the hello endpoint
   * @returns {Promise} An axios response
   */
  getFile(id) {
    return appAxios().get(`${ApiRoutes.FILE}/${id}`);
  },

  getMyFiles() {
    return appAxios().get(`${ApiRoutes.FILE}/`);
  },

  uploadFile(file, onUploadProgress) {
    let formData = new FormData();

    formData.append('files', file);

    return appAxios().post(`${ApiRoutes.FILE}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  share(id, user) {
    return appAxios().post(`${ApiRoutes.FILE}/${id}/${user}`);
  }
};
