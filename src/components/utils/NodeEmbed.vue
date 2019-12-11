<template>
<span
    class="col-xs-6 node_ident embedded_node tight">
  <a
    tabindex="0"
    role="button"
    :data-node="node.nodename"
    :title="node.nodename"
    :class="nodeCss"
    :style="nodeStyle"
    href="#"
    :id="`node_${_uid}`"
  >
    <span :class="iconCss" :style="iconStyle">
      <i :class="iconNameCss" v-if="iconNameCss"></i>
      <i class="fas fa-hdd" v-else></i>
    </span>

    <span :class="{node_unselected:unselected}">{{node['nodename']}}</span>

    <span :class="statusIconCss" :style="statusIconStyle" :title="node['ui:status:text']">
      <i :class="statusIconNameCss" v-if="statusIconNameCss"></i>
    </span>
  </a>
  <popover  :target="`#node_${_uid}`" custom-class="popover-wide " viewport="#main-panel" :hide-delay="200" :transition-duration="0">
    <template slot="popover">
      <div class="detailpopup node_entry tooltipcontent node_filter_link_holder">
          <span>
              <i class="fas fa-hdd"></i>
              {{node.nodename}}
          </span>

          <node-filter-link
              param='name'
              :value='node.nodename'
              iconCss= 'glyphicon glyphicon-circle-arrow-right'
              @nodeFilterClick="handleNodeFilterLink"
              />

          <span class="nodedesc"></span>

          <div class="nodedetail" style="overflow-x: scroll;">
              <!-- <g:render template="/framework/nodeDetailsSimpleKO" model="[useNamespace: true, crefText:'$CREF$']"/> -->
              Node detail...
          </div>
      </div>
    </template>
  </popover>
  </span>
</template>
<script lang="ts">
import Vue from "vue";
import NodeFilterLink from './NodeFilterLink.vue'

import { Component, Prop, Watch } from "vue-property-decorator";
const CSSColors = "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkturquoise darkviolet deeppink deepskyblue dimgray dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(
  " "
);
@Component({ components: {NodeFilterLink} })
export default class NodeEmbed extends Vue {
  @Prop({ required: true })
  node: any ;

  @Prop({ required: false, default:false })
  unselected!: boolean ;

  @Prop({ required: false, default:'' })
  extraClass!: string ;

  handleNodeFilterLink(){
    this.$emit('nodeFilterLink')
  }

  hasOsData() {
    return (
      ["osName", "osFamily", "osVersion", "osArch"].findIndex(
        val => this.node[val]
      ) >= 0
    );
  }
  isAnsiFg(str: string) {
    return (
      str != null &&
      typeof str == "string" &&
      str.match(
        /^ansi-fg-(light-)?(black|green|red|yellow|blue|magenta|cyan|white)$/
      )
    );
  }
  isStyleFg(str: string) {
    return (
      (str != null &&
        typeof str == "string" &&
        str.match(/^#[0-9a-fA-F]{3,6}$/)) ||
      CSSColors.indexOf(str) >= 0
    );
  }
  isAnsiBg(str: string) {
    return (
      str != null &&
      typeof str == "string" &&
      str.match(
        /^ansi-bg-(black|green|red|yellow|blue|magenta|cyan|white|default)$/
      )
    );
  }
  isStyleBg(str: string) {
    return (
      (str != null &&
        typeof str == "string" &&
        str.match(/^#[0-9a-fA-F]{3,6}$/)) ||
      CSSColors.indexOf(str) >= 0
    );
  }

  get nodeFgCss() {
    var uiColor = this.node["ui:color"]
    if (this.isAnsiFg(uiColor)) {
      return uiColor;
    }
    return null;
  }

  get nodeBgCss() {
    var uiBgcolor = this.node["ui:bgcolor"]
    if (this.isAnsiBg(uiBgcolor)) {
      return uiBgcolor;
    }
    return null;
  }

  get nodeCss(): any {
    var classnames = [this.extraClass];
    var uiColor = this.nodeFgCss;
    if (uiColor) {
      classnames.push(uiColor);
    }
    var uiBgcolor = this.nodeBgCss
    if (uiBgcolor) {
      classnames.push(uiBgcolor);
    }
    const cnames = classnames.join(" ");
    // if (other) {
    //     return jQuery.extend({}, other, {[cnames]: true})
    // }
    return cnames;
  }

  get nodeStyle() {
    var styles: { [key: string]: string } = {};
    var uiColor = this.node["ui:color"]
    if (!this.nodeFgCss && this.isStyleFg(uiColor)) {
      styles["color"] = uiColor;
    }
    var uiBgcolor = this.node["ui:bgcolor"]
    if (!this.nodeBgCss && this.isStyleBg(uiBgcolor)) {
      styles["background-color"] = uiBgcolor;
    }
    return styles;
  }

  get isLocal(): boolean {
    return false; //todo, need to compare nodename with server nodename
  }

  iconFgCss(attrName: string) {
    var uiIconColor = this.node[attrName]
    var uiColor = this.node["ui:color"]
    if (this.isAnsiFg(uiIconColor)) {
      return uiIconColor;
    } else if (this.isAnsiFg(uiColor)) {
      return uiColor;
    }
    return null;
  }
  iconBgCss(attrName: string) {
    var uiIconBgcolor = this.node["ui:icon:bgcolor"]
    var uiBgcolor = this.node["ui:bgcolor"]
    if (this.isAnsiBg(uiIconBgcolor)) {
      return uiIconBgcolor;
    } else if (this.isAnsiBg(uiBgcolor)) {
      return uiBgcolor;
    }
    return null;
  }
  get statusIconCss() {
    var classnames = [];
    var fgColor = this.iconFgCss("ui:status:color");
    if (fgColor) {
      classnames.push(fgColor);
    }
    var bgColor = this.iconBgCss("ui:status:bgcolor");
    if (bgColor) {
      classnames.push(bgColor);
    }
    return classnames.join(" ");
  }
  get iconCss() {
    var classnames = [];
    var fgColor = this.iconFgCss("ui:icon:color");
    if (fgColor) {
      classnames.push(fgColor);
    }
    var bgColor = this.iconBgCss("ui:icon:bgcolor");
    if (bgColor) {
      classnames.push(bgColor);
    }
    return classnames.join(" ");
  }

  get iconNameCss(): string {
    return this.iconNameCssForAttribute("ui:icon:name");
  }

  get statusIconNameCss(): string {
    return this.iconNameCssForAttribute("ui:status:icon");
  }

  iconNameCssForAttribute(attr: string): string {
    let name = this.node[attr];
    if (!name) {
      return "";
    }
    if (name.match(/^glyphicon-[a-z-]+$/)) {
      return "glyphicon " + name;
    } else if (name.match(/^fa-[a-z-]+$/)) {
      return "fas " + name;
    } else if (name.match(/^fab-[a-z-]+$/)) {
      return "fab fa-" + name.substring(4);
    }
    return "";
  }

  get statusIconStyle() {
    var styles: { [key: string]: string } = {};
    if (!this.iconFgCss("ui:status:color")) {
      var uiIconColor = this.node["ui:status:color"]
      var uiColor = this.node["ui:color"]
      if (this.isStyleFg(uiIconColor)) {
        styles["color"] = uiIconColor;
      } else if (this.isStyleFg(uiColor)) {
        styles["color"] = uiColor;
      }
    }
    if (!this.iconBgCss("ui:status:bgcolor")) {
      var uiIconBgcolor = this.node["ui:status:bgcolor"]
      var uiBgcolor = this.node["ui:bgcolor"]
      if (this.isStyleBg(uiIconBgcolor)) {
        styles["background-color"] = uiIconBgcolor;
      } else if (this.isStyleBg(uiBgcolor)) {
        styles["background-color"] = uiBgcolor;
      }
    }
    return styles;
  }
}
</script>
