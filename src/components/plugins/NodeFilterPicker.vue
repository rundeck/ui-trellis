<!--
  - Copyright 2019 Rundeck, Inc. (http://rundeck.com)
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
      <slot>Set Filter &hellip;</slot>
    </btn>

    <modal v-model="modalOpen" :title="'Set Filter'" ref="modal" append-to-body size="lg">

      <div v-if="showProjectSelector"><label>Project:</label><project-picker v-model="project"></project-picker></div>
      <div class="form-group">
        <span class="input-group nodefilters multiple-control-input-group">
        <input type="search" v-model.lazy="filter" class=" form-control" :placeholder="$t('enter.a.node.filter')" @keydown.enter="loadProjectNodes"/>
        <div class="input-group-btn">
        <a class="btn btn-primary btn-fill" href="#" @click="loadProjectNodes">
            {{$t('Search')}}
        </a>
        </div>
        </span>
      </div>

      <div  class="nodes-embed ansicolor-on matchednodes embed embed_clean">
        {{nodes.length}} Nodes:
        <div class="row">
            <node-embed
             v-for="(node,ndx) in nodes"
             :key="'emb'+ndx"
             :node="node"
             :extraClass="nodes.length>20?'col-lg-2':nodes.length>12?'col-md-3': nodes.length>8&&nodes.length<13 ? 'col-sm-4':''"
             :unselected="false"
             @nodeFilterLink="appendNodeFilter(node)"
             />
        </div>
      </div>
      <div slot="footer">
        <btn @click="modalOpen=false">Cancel</btn>
        <btn @click="saved">Use Filter</btn>
      </div>

    </modal>
  </div>
</template>

<script lang="ts">

import ProjectPicker from './ProjectPicker.vue'
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { client } from '../../modules/rundeckClient'
import {filterProjectNodes} from '../../modules/nodeService'
import NodeEmbed from '../utils/NodeEmbed'

Vue.component("project-picker",ProjectPicker)
Vue.component("node-embed",NodeEmbed)

@Component
export default class NodeFilterPicker extends Vue {
  @Prop({ required: false, default: '' })
  value!: string

  @Prop({ required: false, default: '' })
  selectionComponent!: string

  filter: string = this.value||''
  modalOpen: boolean = false
  project: string = ''
  showProjectSelector: boolean = true
  nodes: any[] = []

  async loadNodes(){
    if(this.project != '') {

      filterProjectNodes(this.project, this.filter).then(result => {
          let newnodes=[]
          for (let key in result) {
              newnodes.push(result[key])
          }
          this.nodes=newnodes
      })
    }
  }
  @Watch('value')
  setValue(){
    this.filter=this.value
  }

  appendNodeFilter(node:any){
    if(node && node['nodename']){
      this.filter=this.filter+" name: "+node['nodename']
    }
  }

  loadProjectNodes() {
    if(this.filter){
      this.loadNodes()
    }else{
      this.nodes=[]
    }
  }
  saved() {
    this.modalOpen = false
    if(this.selectionComponent==='nodes'){
      this.$emit('input', this.nodes.join(','))
    }else{
      this.$emit('input', this.filter)
    }
  }
  mounted() {
    if(window._rundeck.projectName) {
      this.showProjectSelector = false
      this.project = window._rundeck.projectName
    }
  }
}
</script>
