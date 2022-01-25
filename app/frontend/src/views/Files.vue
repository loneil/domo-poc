<template>
  <v-container>
    <BaseSecure>
      <h1 class="my-6 text-center">MyFiles</h1>
      <v-data-table
        :headers="headers"
        :items="myFiles"
        :items-per-page="100"
        show-expand
        hide-default-footer
        class="elevation-1"
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <p class="pt-5">
              My Permissions: {{ item.filePermissions.map((fp) => fp.code) }}
            </p>
            <p v-if="item.filePermissions.map((fp) => fp.code).includes('READ')">
              <v-btn color="info" dark small @click="getFile(item.id)">
                Download
                <v-icon right dark>mdi-cloud-download</v-icon>
              </v-btn>
            </p>
            <p v-if="item.filePermissions.map((fp) => fp.code).includes('MANAGE')">
              <v-btn color="info" dark small @click="share(item.id, '2dc9deeb-ec1a-45f6-9408-b1b994b3d42d')">
                Share with
              </v-btn>
              (2dc9deeb-ec1a-45f6-9408-b1b994b3d42d)
            </p>
          </td>
        </template></v-data-table
      >
    </BaseSecure>
  </v-container>
</template>

<script>
import helloService from '@/services/helloService';
import Vue from 'vue';

export default {
  name: 'Files',
  data() {
    return {
      myFiles: [],
      headers: [
        {
          text: 'File GUID',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Name', value: 'originalName' },
        { text: 'Public', value: 'public' },
        { text: 'Added', value: 'createdAt' },
        { text: 'Originator', value: 'createdBy' },
      ],
    };
  },
  computed: {
    token() {
      return Vue.prototype.$keycloak.token;
    },
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
    getFile(id) {
      this.message = '';

      helloService
        .getFile(id)
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
    share(id, user) {
      this.message = '';

      helloService
        .share(id, user)
        .then((response) => {
          if (response.status !== 200) {
            this.message = 'Could not download file!';
          }
        })
        .catch(() => {
          this.message = 'Could not download the file!';
        });
    },
  },
  mounted() {
    helloService
      .getMyFiles()
      .then((response) => {
        if (response.status !== 201) {
          this.message = 'Could not download file!';
        } else {
          this.myFiles = response.data;
        }
      })
      .catch(() => {
        this.message = 'Could not download the file!';
      });
  },
};
</script>
