<template>
  <div>
    <template v-if="prop.type==='Boolean'">
      <div class="col-xs-10 col-xs-offset-2">
        <div class="checkbox">
          <input
            type="checkbox"
            :name="`${rkey}prop_`+pindex"
            :id="`${rkey}prop_`+pindex"
            value="true"
            v-model="currentValue"
          >
          <label :for="`${rkey}prop_`+pindex">{{prop.title}}</label>
        </div>
      </div>
    </template>
    <template v-else>
      <label
        :class="'col-sm-2 control-label input-sm '+(prop.required ? 'required' : '')"
        :for="`${rkey}prop_`+pindex"
      >{{prop.title}}</label>
      <div class="col-sm-10" v-if="prop.type==='Select'">
        <select
          :name="`${rkey}prop_`+pindex"
          v-model="currentValue"
          :id="`${rkey}prop_`+pindex"
          class="form-control input-sm"
        >
          <option v-if="!prop.required" value>--None Selected--</option>
          <option
            v-for="opt in prop.allowed"
            v-bind:value="opt"
            v-bind:key="opt"
          >{{prop.selectLabels && prop.selectLabels[opt] || opt}}</option>
        </select>
      </div>
      <template v-else-if="prop.type==='FreeSelect'">
        <div class="col-sm-5">
          <input
            :name="`${rkey}prop_`+pindex"
            v-model="currentValue"
            :id="`${rkey}prop_`+pindex"
            size="100"
            type="text"
            class="form-control input-sm"
          >
        </div>
        <div class="col-sm-5">
          <select class="form-control input-sm" v-model="currentValue">
            <option
              v-for="opt in prop.allowed"
              v-bind:value="opt"
              v-bind:key="opt"
            >{{prop.selectLabels && prop.selectLabels[opt] || opt}}</option>
          </select>
        </div>
      </template>
      <template v-else-if="prop.type==='Options'">
        <div class="col-sm-10">
          <div class="grid">
            <div
              class="optionvaluemulti checkbox"
              v-for="(opt,oindex) in prop.allowed"
              v-bind:key="opt"
            >
              <input
                type="checkbox"
                v-model="currentValue"
                :value="opt"
                :id="`${rkey}opt_`+pindex+'_'+oindex"
              >
              <label
                class="grid-row optionvaluemulti"
                :for="`${rkey}opt_`+pindex+'_'+oindex"
              >{{prop.selectLabels && prop.selectLabels[opt] || opt}}</label>
            </div>
          </div>
        </div>
      </template>
      <div :class="inputColSize(prop)" v-else>
        <input
          :name="`${rkey}prop_`+pindex"
          v-model.number="currentValue"
          :id="`${rkey}prop_`+pindex"
          size="100"
          type="number"
          class="form-control input-sm"
          v-if="['Integer','Long'].indexOf(prop.type)>=0"
        >
        <template v-else-if="prop.options && prop.options['displayType']==='MULTI_LINE'">
          <textarea
            :name="`${rkey}prop_`+pindex"
            v-model="currentValue"
            :id="`${rkey}prop_`+pindex"
            rows="10"
            cols="100"
            class="form-control input-sm"
          ></textarea>
        </template>
        <template v-else-if="prop.options && prop.options['displayType']==='CODE'">
          <!-- <textarea :name="`${rkey}prop_`+pindex"
                          v-model="currentValue"
                          :id="`${rkey}prop_`+pindex"
                          rows="10"
                          cols="100"
          class="form-control input-sm"></textarea>-->
          <ace-editor
            :name="`${rkey}prop_`+pindex"
            v-model="currentValue"
            :lang="prop.options['codeSyntaxMode']"
            :codeSyntaxSelectable="prop.options['codeSyntaxSelectable']==='true'"
            :id="`${rkey}prop_`+pindex"
            height="200"
            width="100%"
          />
        </template>
        <template v-else-if="prop.options && prop.options['displayType']==='PASSWORD'">
          <input
            :name="`${rkey}prop_`+pindex"
            v-model="currentValue"
            :id="`${rkey}prop_`+pindex"
            size="100"
            type="password"
            autocomplete="new-password"
            class="form-control input-sm"
          >
        </template>
        <template v-else-if="prop.options && prop.options['displayType']==='STATIC_TEXT'">
          <span
            v-if="prop.options['staticTextContentType']==='text/html'"
          >{{prop.staticTextDefaultValue}}</span>
          <span
            v-if="prop.options['staticTextContentType']==='text/markdown'"
          >{{prop.staticTextDefaultValue}}</span>
          <span v-else>{{prop.staticTextDefaultValue}}</span>
        </template>
        <template v-else-if="prop.options && prop.options['displayType']==='RUNDECK_JOB'">
          <input
            :name="`${rkey}prop_`+pindex"
            :id="`${rkey}prop_`+pindex"
            readonly
            size="100"
            class="form-control input-sm"
            v-bind:title="currentValue"
            v-bind:value="jobName"
          >
        </template>
        <input
          :name="`${rkey}prop_`+pindex"
          v-model="currentValue"
          :id="`${rkey}prop_`+pindex"
          size="100"
          type="text"
          class="form-control input-sm"
          v-else
        >
      </div>
      <div
        v-if="prop.options && prop.options['selectionAccessor']==='PLUGIN_TYPE'"
        class="col-sm-5"
      >
        <select v-model="currentValue" class="form-control input-sm">
          <option disabled value>-- Select Plugin Type --</option>
          <option
            v-for="opt in propsComputedSelectorData[prop.name]"
            v-bind:value="opt.value"
            v-bind:key="opt.key"
          >{{opt.key}}</option>
        </select>
      </div>
      <div v-if="prop.options && prop.options['selectionAccessor']==='RUNDECK_JOB'" class="col-sm-5">
        <job-config-picker v-model="currentValue"></job-config-picker>
      </div>
      <slot
        v-else-if="prop.options && prop.options['selectionAccessor'] "
        name="accessors"
        :prop="prop"
        :inputValues="inputValues"
        :accessor="prop.options['selectionAccessor']"
      ></slot>
    </template>

    <div class="col-sm-10 col-sm-offset-2" v-if="prop.desc">
      <div class="help-block">{{prop.desc}}</div>
    </div>
    <div
      class="col-sm-10 col-sm-offset-2 text-warning"
      v-if="validation && !validation.valid && validation.errors[prop.name]"
    >{{validation.errors[prop.name]}}</div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"

import JobConfigPicker from './JobConfigPicker.vue'
import AceEditor from '../utils/AceEditor.vue'
import { client } from '../../modules/rundeckClient'
export default Vue.extend({
  components:{
    AceEditor,
    JobConfigPicker
  },
  props:[
    'prop',
    'value',
    'inputValues',
    'validation',
    'rkey',
    'pindex'
  ],
  methods:{
    inputColSize(prop: any) {
      if (prop.options && prop.options['selectionAccessor']) {
        return 'col-sm-5'
      }
      return 'col-sm-10'
    },
    setJobName(jobUuid: string) {
      if((jobUuid && jobUuid.length > 0) && (this.prop.options && this.prop.options['displayType']==='RUNDECK_JOB')) {
        client.jobInfoGet(jobUuid).then(response => {
          if(response.name) {
            var output = ''
            if(response.group) output += response.group+"/"
            output += response.name + " ("+response.project+")"
            this.jobName = output
          }
        })
      }
    }
  },
  data(){
    return{
      currentValue: this.value,
      jobName: ''
    }
  },
  watch:{
    currentValue:function(newval){
      this.$emit('input',newval)
      this.setJobName(newval)
    },
    value:function(newval){
      this.currentValue = newval
    }
  },
  mounted(){
    this.setJobName(this.value)
  }
})
</script>
