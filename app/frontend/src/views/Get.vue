<template>
  <v-container>
    <BaseSecure>
      <h1 class="my-6 text-center">Download a File</h1>

      <v-row no-gutters align="center">
        <v-col cols="6">
          <h2>Download File By GUID</h2>
          <v-text-field v-model="id" label="File GUID"></v-text-field>
        </v-col>

        <v-col cols="4" class="pl-2">
          <v-btn color="info" dark small @click="getFile">
            Download
            <v-icon right dark>mdi-cloud-download</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-alert v-if="message" border="left" color="blue-grey" dark>
        {{ message }}
      </v-alert>

      <!-- <p>{{ token }}</p> -->
    </BaseSecure>
  </v-container>
</template>

<script>
import helloService from '@/services/helloService';

export default {
  name: 'Get',
  data() {
    return {
      id: undefined,
      message: '',
    };
  },
  methods: {
    createDownload(blob, filename = undefined) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    getDispositionFilename(disposition) {
      let filename = undefined;
      if (disposition) {
        filename = disposition.substring(disposition.indexOf('filename=') + 9);
      }
      return filename;
    },
    getFile() {
      this.message = '';

      helloService
        .getFile(this.id)
        .then((response) => {
          if (response.status !== 200) {
            this.message = 'Could not download file!';
          } else {
            // create file to download
            const filename = this.getDispositionFilename(
              response.headers['content-disposition']
            );

            const blob = new Blob([response.data], {
              type: 'attachment',
            });
            this.createDownload(blob, filename);
          }
        })
        .catch(() => {
          this.message = 'Could not download the file!';
        });
    },
  },
};
</script>
