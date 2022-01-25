<template>
  <v-container>
    <BaseSecure>
      <h1 class="my-6 text-center">Upload a File</h1>

      <v-row no-gutters align="center">
        <v-col cols="6">
          <h2>Choose A File</h2>
          <div v-if="currentFile">
            <div>
              <v-progress-linear
                v-model="progress"
                color="light-blue"
                height="25"
                reactive
              >
                <strong>{{ progress }} %</strong>
              </v-progress-linear>
            </div>
          </div>
          <v-file-input
            show-size
            label="File input"
            @change="selectFile"
          ></v-file-input>
        </v-col>

        <v-col cols="4" class="pl-2">
          <v-btn color="success" dark small @click="upload">
            Upload
            <v-icon right dark>mdi-cloud-upload</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <h2 class="mt-10">Upload Results</h2>

      <v-alert v-if="message" border="left" color="blue-grey" dark>
        {{ message }}
      </v-alert>
      <div v-else>
        <div v-if="uploadResult">
          <p><strong>File GUID:</strong> {{ uploadResult.data.id }}</p>
          <p><strong>Created By:</strong> {{ uploadResult.data.createdBy }}</p>
        </div>
        <p v-else>N/A</p>
      </div>

      <v-card v-if="fileInfos.length > 0" class="mx-auto">
        <v-list>
          <v-subheader>List of Files</v-subheader>
          <v-list-item-group color="primary">
            <v-list-item v-for="(file, index) in fileInfos" :key="index">
              <a :href="file.url">{{ file.name }}</a>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>

      <!-- <p>{{ token }}</p> -->
    </BaseSecure>
  </v-container>
</template>

<script>
import helloService from '@/services/helloService';
import Vue from 'vue';

export default {
  name: 'Secure',
  data() {
    return {
      currentFile: undefined,
      progress: 0,
      message: '',
      uploadResult: undefined,

      fileInfos: [],
    };
  },
  computed: {
    token() {
      return Vue.prototype.$keycloak.token;
    },
  },
  methods: {
    selectFile(file) {
      this.progress = 0;
      this.currentFile = file;
    },
    upload() {
      if (!this.currentFile) {
        this.message = 'Please select a file!';
        return;
      }

      this.message = '';

      helloService
        .uploadFile(this.currentFile, (event) => {
          this.progress = Math.round((100 * event.loaded) / event.total);
        })
        .then((response) => {
          if (response.status !== 201) {
            this.progress = 0;
            this.message = 'Could not upload the file!';
            this.currentFile = undefined;
          } else {
            this.message = response.data.message;
            this.uploadResult = response;
            // return uploadFile.getFiles();
          }
        })
        .then((files) => {
          this.fileInfos = files.data;
        });
    },
  },
};
</script>
