<!--
  - Copyright 2018 Rundeck, Inc. (http://rundeck.com)
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
    <div>

        <btn class="btn btn-sm btn-default" @click="openSelector()">
            <slot>Select… <i class="glyphicon glyphicon-folder-open"></i></slot>
        </btn>

        <modal v-model="modalOpen" title="Select a Storage File" id="storage-file" ref="modalkeys" auto-focus
               append-to-body>

            <div class="alert alert-warning" v-if="errorMsg!=''">
                <span>{{errorMsg}}</span>
            </div>

            <div class="row text-info ">
                <div class="form-group col-sm-12" :class="[invalid===true ? 'has-error' : '']">
                    <div class="input-group">
                        <div class="input-group-addon" v-if="staticRoot">
                            <span>{{showRootPath}}</span>
                        </div>
                        <input type="text" class="form-control" style="padding-left:18px"
                               v-model="inputPath" @keyup.enter="loadDirInputPath()"
                               placeholder="Enter a path"/>
                    </div>
                </div>
            </div>
            <div class="row keySelector">
                <div class="col-sm-12">
                    <div style="margin-bottom:1em;">
                        <button type="button" class="btn btn-sm btn-default"
                                @click="loadDir(upPath)" :disabled="upPath===''">
                            <i class="glyphicon glyphicon-folder-open"></i>
                            <i class="glyphicon glyphicon-arrow-up"></i>
                            <span>{{showUpPath()}}</span>
                        </button>

                    </div>


                    <table class="table table-hover table-condensed">
                        <tbody>
                        <tr>
                            <td colspan="2" class="text-primary">
                                <span v-if="files.length<1">
                                  No keys
                                </span>
                                <span v-if="files.length>0">
                                  <span>{{files.length}}</span>
                                  keys
                                </span>
                            </td>
                        </tr>
                        </tbody>
                        <tbody>
                        <tr v-for="key in files" :class="[key.path== selectedKey.path ? selectedClass : '','action']"
                            :key="key.name" @click="selectKey(key)">
                            <td>
                                <i :class="[key.path== selectedKey.path ? 'glyphicon glyphicon-ok' :'glyphicon glyphicon-unchecked']"></i>

                                <span v-if="isPrivateKey(key)"
                                      title="This path contains a private key that can be used for remote node execution.">
                                  <i class="glyphicon glyphicon-lock"></i>
                                </span>
                                <span v-if="isPublicKey(key)">
                                  <i class="glyphicon glyphicon-eye-open"></i>
                                </span>
                                <span v-if="isPassword(key)"
                                      title="This path contains a password that can be used for remote node execution.">
                                  <i class="glyphicon glyphicon-lock"></i>
                                </span>

                                <span>{{key.name}}</span>
                            </td>
                            <td class="text-primary">
                                <span class="pull-right">
                                  <span v-if="isPrivateKey(key)"
                                        title="This path contains a private key that can be used for remote node execution.">
                                    Private Key
                                  </span>
                                  <span v-if="isPublicKey(key)">
                                    Public Key
                                  </span>
                                  <span v-if="isPassword(key)"
                                        title="This path contains a password that can be used for remote node execution.">
                                    Password
                                  </span>
                                </span>
                            </td>
                        </tr>
                        </tbody>

                        <tbody v-if="notFound()===true">
                        <tr>
                            <td colspan="2">
                                <span class="text-primary">Nothing found at this path.
                                </span>
                            </td>
                        </tr>
                        </tbody>
                        <tbody>
                        <tr v-for="directory in directories" :key="directory.name">
                            <td class="action" @click="loadDir(directory.path)" colspan="2">
                                <i class="glyphicon glyphicon-arrow-down"></i>
                                <i class="glyphicon glyphicon-folder-close"></i>
                                <span>{{dirNameString(directory.path)}}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row" v-if="isKeySelected()===true">
                <div class="col-sm-12">
                    <div class="well">
                        <div>
                            Storage path:
                            <code class="text-success">{{selectedKey.path}}</code>
                            <a href="#" data-bind="attr: { href: selectedPathUrl() }">
                                <i class="glyphicon glyphicon-link"></i>
                            </a>
                        </div>
                        <div v-if="createdTime()!==''">
                            <div>
                                Created:
                                <span class="timeabs text-primary">
                                    {{createdTime() | moment("dddd, MMMM Do YYYY, h:mm:ss a") }}
                                </span>

                                <span v-if="createdUsername()!==''">
                                    by:
                                    <span class="text-primary">{{createdUsername()}}</span>
                                </span>

                            </div>
                        </div>
                        <div v-if="wasModified()!==''">
                            <div>
                                Modified:
                                <span class="timeago text-primary">
                                    {{modifiedTimeAgoText()| duration('humanize') }} ago
                                </span>

                                <span v-if="modifiedUsername()!==''">
                                by:
                                <span class="text-primary">{{modifiedUsername()}}</span>
                              </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            <div slot="footer">
                <button type="button" class="btn btn-sm btn-default" @click="handleCancel">Cancel</button>
                <button type="button" class="btn btn-sm btn-success obs-storagebrowse-select"
                        :disabled="isKeySelected()===false" @click="handleSelectKey">
                    Choose Selected Key
                </button>
            </div>

        </modal>

    </div>

</template>


<script lang="ts">
    import Vue from 'vue';

    import {
        getRundeckContext,
    } from '../../rundeckService';

    import moment from 'moment';

    export default Vue.extend({
        name: 'KeyStorageSelector',
        props: [
            'keyPath',
            'storageFilter',
        ],
        data() {
            return {
                modalOpen: false,
                inputPath: '',
                selectedKey: {} as any,
                files: [] as any,
                directories: [] as any,
                selectedClass: 'success',
                errorMsg: '',
                staticRoot: true,
                path: '',
                rootPath: 'keys',
                upPath: '',
                invalid: false
            };
        },
        mounted() {

        },
        methods: {
            openSelector(){
                this.invalid = false;
                this.setRootPath();
                this.clean();
                if (this.keyPath != null) {
                    const parentDir = this.parentDirString(this.keyPath)
                    this.loadDir(parentDir);
                    this.loadUpPath();
                    this.defaultSelectKey(this.keyPath);
                }
                this.modalOpen=true;
            },
            setRootPath() {
                if (this.rootPath == null || this.rootPath === '') {
                    this.rootPath = 'keys';
                }
                this.path = '';
            },
            selectKey(key: any) {
                if (this.selectedKey != null && this.selectedKey.path === key.path) {
                    this.selectedKey = {}
                } else {
                    this.selectedKey = key
                }
            },
            isKeySelected() {
                if (this.selectedKey.path != null) {
                    return true
                }
                return false
            },
            handleSelectKey() {
                this.modalOpen = false;
                this.$emit('input', this.selectedKey ? this.selectedKey.path : '');
                this.clean();
            },
            handleCancel() {
                this.clean();
                this.modalOpen = false;
            },
            loadUpPath() {
                let upPath = '';
                if (this.path != '' && this.path != this.rootPath && this.path != this.rootPath + '/') {
                    if (this.path.indexOf('/') >= 0) {
                        upPath = this.parentDirString(this.path);
                    } else {
                        upPath = this.rootPath;
                    }

                    if (upPath != this.rootPath) {
                        this.upPath = this.absolutePath(upPath);
                    } else {
                        this.upPath = this.rootPath;
                    }
                } else {
                    this.upPath = upPath;
                }
            },
            showUpPath(){
                if(this.upPath!=this.rootPath){
                    return this.relativePath(this.upPath);
                }else{
                    return this.upPath;
                }
            },
            checkParentDir(path: any){
                const rundeckContext = getRundeckContext();
                const fullPath = this.absolutePath(path);

                rundeckContext.rundeckClient.storageKeyGetMetadata(path).then((result: any) => {
                    if (result.resources != null) {
                        const keys = result.resources.filter((resource: any) => resource.path.indexOf(fullPath)>=0);
                        if(keys.length==0){
                            this.invalid = true
                            this.errorMsg = 'invalid path';
                        }
                    }else{
                        this.invalid = true
                        this.errorMsg = 'invalid path';
                    }
                }).catch((err) => {
                    this.invalid = true
                    this.errorMsg = 'invalid path';
                });
            },
            loadDir(selectedPath: any) {
                this.clean();
                let path = '';
                if (selectedPath != null) {
                    path = this.relativePath(selectedPath);
                }

                this.path = path;
                this.inputPath = path;

                this.checkParentDir(path)

                this.loadUpPath();
                this.loadKeys();
            },
            loadDirInputPath(){
                this.clean()
                this.loadDir(this.inputPath)
            },
            loadKeys() {
                const rundeckContext = getRundeckContext();
                rundeckContext.rundeckClient.storageKeyGetMetadata(this.path).then((result: any) => {
                    this.directories = [];
                    this.files = [];

                    if (result.resources != null) {
                        result.resources.forEach((resource: any) => {
                            if (resource.type === 'directory') {
                                this.directories.push(resource);

                                this.directories.sort((obj1: any, obj2: any) => {
                                    if (obj1.path > obj2.path) {
                                        return 1;
                                    }

                                    if (obj1.path < obj2.path) {
                                        return -1;
                                    }
                                    return 0;
                                });
                            }

                            if (resource.type === 'file') {
                                if(this.storageFilter != null){
                                    if(this.allowedResource(resource.meta)){
                                        this.files.push(resource);
                                    }
                                }else{
                                    this.files.push(resource);
                                }

                                this.files.sort((obj1: any, obj2: any) => {
                                    if (obj1.path > obj2.path) {
                                        return 1;
                                    }

                                    if (obj1.path < obj2.path) {
                                        return -1;
                                    }
                                    return 0;
                                });
                            }
                        });
                    }
                }).catch((err) => {
                    this.errorMsg = err;
                });
            },
            allowedResource(meta: any){
                const filterArray = this.storageFilter.split('=');
                const key = filterArray[0];
                const value = filterArray[1];

                if(key == 'Rundeck-key-type'){
                    if(value === meta['rundeckKeyType']){
                        return true;
                    }
                }else{
                    if(key == 'Rundeck-data-type'){
                        if(value === meta['Rundeck-data-type']){
                            return true;
                        }
                    }
                }
                return false;
            },
            defaultSelectKey(path: any) {
                const rundeckContext = getRundeckContext();

                rundeckContext.rundeckClient.storageKeyGetMetadata(this.path).then((result: any) => {
                    if (result.resources != null) {
                        result.resources.forEach((resource: any) => {
                            if (resource.type === 'file') {
                                if (resource.path === path) {
                                    this.selectedKey = resource;
                                }
                            }
                        });
                    }
                });

            },
            dirNameString(path: any) {
                if (path.lastIndexOf('/') >= 0) {
                    return path.substring(path.lastIndexOf('/') + 1);
                } else {
                    return path;
                }
            },
            isPrivateKey(key: any) {
                if (key.meta['rundeckKeyType'] && key.meta["rundeckKeyType"] === 'private') {
                    return true;
                }
                return false;
            },
            isPublicKey(key: any) {
                if (key.meta['rundeckKeyType'] && key.meta["rundeckKeyType"] === 'public') {
                    return true;
                }
                return false;
            },
            isPassword(key: any) {
                if (key.meta["Rundeck-data-type"] === 'password') {
                    return true;
                }
                return false;
            },
            notFound() {
                return false;
            },
            clean() {
                this.directories = [];
                this.files = [];
                this.selectedKey = {};
                this.inputPath = '';
                this.invalid = false;
                this.errorMsg = '';
            },
            cleanPath(path: any) {
                if (path != null) {
                    while (path.indexOf('/') == 0) {
                        path = path.substring(1);
                    }
                } else {
                    return '';
                }
                return path;
            },
            relativePath(path: any) {
                var root = this.rootPath;
                var statroot = this.staticRoot;
                if (!statroot) {
                    return path;
                }
                var newpath = '';
                if (path != null && root != null) {
                    path = this.cleanPath(path);
                    newpath = this.cleanPath(path.substring(root.length));
                }
                return newpath;
            },
            parentDirString(path: any) {
                if (null != path && path.lastIndexOf('/') >= 0) {
                    return path.substring(0, path.lastIndexOf('/'));
                } else {
                    return '';
                }
            },
            absolutePath(relpath: any) {
                var root = this.rootPath;
                var statroot = this.staticRoot;

                if (statroot === false) {
                    return relpath;
                }
                return root + '/' + relpath;
            },
            wasModified() {
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-content-creation-time'] != null &&
                    this.selectedKey.meta['Rundeck-content-modify-time'] != null) {
                    return this.selectedKey.meta['Rundeck-content-creation-time'] != this.selectedKey.meta['Rundeck-content-modify-time'];
                }
                return false;
            },
            modifiedUsername() {
                var value = '';
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-auth-modified-username']) {
                    return this.selectedKey.meta['Rundeck-auth-modified-username'];
                }
                return value;
            },
            createdUsername() {
                let value = '';
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-auth-created-username'] != null) {
                    return this.selectedKey.meta['Rundeck-auth-created-username'];
                }
                return value;
            },
            createdTime() {
                var value = '';
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-content-creation-time'] != null) {
                    value = this.selectedKey.meta['Rundeck-content-creation-time'];
                }
                return value;
            },
            modifiedTime() {
                var value = '';
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-content-modify-time'] != null) {
                    value = this.selectedKey.meta['Rundeck-content-modify-time'];
                }
                return value;
            },
            modifiedTimeAgoText() {
                var value = 0;
                if (this.selectedKey != null &&
                    this.selectedKey.meta != null &&
                    this.selectedKey.meta['Rundeck-content-modify-time'] != null) {
                    var time = this.selectedKey.meta['Rundeck-content-modify-time'];
                    value = this.duration(time);
                }
                return value;
            },
            duration(start: any) {
                return moment().diff(moment(start));
            },

        },
        computed: {
            showRootPath: function () {
                return "keys/"
            },
        },
        watch: {
            keyPath(newValue, oldValue) {
                this.setRootPath();
                this.clean();

                if(this.keyPath!=null){
                    this.defaultSelectKey(newValue);
                    this.loadDir(this.parentDirString(this.keyPath));
                }

                this.$emit('input', newValue);
            },
        },
    });
</script>

<style>
    .keySelector span {
        content: " ";
        margin: 0 2px;
    }

    .keySelector i {
        content: " ";
        margin: 0 1px;
    }
</style>

