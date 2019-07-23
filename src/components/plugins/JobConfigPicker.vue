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
    <btn @click="modalOpen=true">
      <slot>Choose A Job &hellip;</slot>
    </btn>

    <modal v-model="modalOpen" :title="'Choose A Job'" ref="modal" append-to-body>

      <div v-if="showProjectSelector"><label>Project:</label><project-picker v-model="project"></project-picker></div>

      <div class="list-group" v-for="(item,name) in jobTree.groups" :key="'group'+name">
        <div class="list-group-item" v-if="name && item.jobs.length>0">
           <h4 class="list-group-item-heading">{{item.label}}</h4>
        </div>
        <div v-for="job in item.jobs" :key="job.id"
             class="list-group-item"
             style="overflow:hidden; text-overflow: ellipsis; white-space: nowrap"
             >

             <a href="#" class="" :title="'Choose this job: '+job.id"
                   @click="selectedJob=job">
                 <i class="glyphicon glyphicon-book"></i>
                 {{job.name}}
             </a>


            <span class="text-primary">
              {{job.description}}
            </span>


        </div>
      </div>
      <div slot="footer">
        <btn @click="modalOpen=false">Cancel</btn>
      </div>

    </modal>
  </div>
</template>
<script lang="ts">
import { JobReference } from '../../interfaces/JobReference'
import { JobTree } from '../../types/JobTree'
import { GroupedJobs, TreeItem } from '../../types/TreeItem'
import { Job } from 'ts-rundeck/dist/lib/models'
import Vue from 'vue'
import ProjectPicker from './ProjectPicker.vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { client } from '../../modules/rundeckClient'

Vue.component("project-picker",ProjectPicker)

@Component
export default class JobConfigPicker extends Vue {
  @Prop({ required: false, default: '' })
  value!: string

  selectedJob: JobReference | null = null
  modalOpen: boolean = false
  jobs: Job[] = []
  jobTree: JobTree = new JobTree()
  project: string = ''
  showProjectSelector: boolean = true

@Watch('project')
  loadJobs() {
    this.jobTree = new JobTree()
    if(this.project != '') {
      client.jobList(this.project).then(result => {
        this.jobs = result
        this.jobs.forEach(job => this.jobTree.insert(job))
      })
    }
  }

  @Watch('selectedJob')
  jobChosen() {
    this.modalOpen = false
    this.$emit('input', this.selectedJob ? this.selectedJob.id : '')
  }

  mounted() {
    if(window._rundeck.projectName) {
      this.showProjectSelector = false
      this.project = window._rundeck.projectName
    }
  }
}
</script>
<style lang="scss">
</style>
