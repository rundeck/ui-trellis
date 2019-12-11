<template>
  <a class="nodefilterlink" :href="href"  :class="classnames" :data-node-filter="filter" :data-node-tag="param==='tag'?value:''" @click="wasClicked">

    <i :class="iconCss" v-if="iconCss"></i>
    <span v-else :class="textCss">{{viewtext}}</span>
    <span v-if="count">
      ({{count}})
    </span>
  </a>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props:{
    param: {type:String,required:true},
    value: {type:String,required:true},
    filter: {type:String,required:false,default:''},
    iconCss: {type:String,required:false,default:''},
    suffix: {type:String,required:false,default:''},
    count: {type:Number,required:false,default:0},
    textCss: {type:String,required:false,default:''},

  },
  computed:{
    xfilter():string{
      return `${this.param}: ${this.value}`
    },
    href():string{
      //todo: compute linke
      return '#'
    },
    viewtext():string{
        return ( this.filter||this.value) + this.suffix;
    }
  },
  methods:{

    wasClicked(){
      this.$emit('nodeFilterClick')
    }
  }
});
</script>
