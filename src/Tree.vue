<template>
  <div class="tree-wrapper" :style="{height: treeWrapperHeight + 'px'}">
    <!-- box -->
    <div
      v-for="(item, key) in boxArr"
      :key="'box' + key" class="box"
      :nodeId="item.nodeId"
      :style="{top: (item.y - 1) * (120 + 20) + 'px', left: (item.x - 1) * (180 + 20) + 'px'}">
      <slot :boxProps="item"></slot>
    </div>
    <!-- circle -->
    <div
      v-for="(item, key) in circleArr"
      :key="'circle' + key"
      @click="toggleShow(item.nodeId)"
      :nodeId="item.nodeId"
      :class="item.showChildren ? 'icon-minus' : 'icon-plus'" class="circle"
      :style="{top: ((item.y - 1) * (120 + 20) + 120 + 2) + 'px', left: ((item.x - 1) * (180 + 20) + (180 * 0.5) - (16 * 0.5)) + 'px'}"></div>
    <!-- lines -->
    <div
      v-for="(item, key) in vLinePositionArr"
      :key="'vtLine' + key"
      class="v-line"
      :style="{top: ((item.y - 1) * (120 + 20) - (20 * 0.5)) + 'px', left: ((item.x - 1) * (180 + 20) + (180 * 0.5)) + 'px', height: (20 * 0.5) + 'px'}"></div>
    <div
      v-for="(item, key) in circleArr"
      :key="'vbLine' + key"
      class="v-line"
      :style="{top: ((item.y - 1) * (120 + 20) + 120) + 'px', left: ((item.x - 1) * (180 + 20) + (180 * 0.5)) + 'px', height: (20 * 0.5) + 'px'}"></div>
    <div
      v-for="(item, key) in hLinePositionArr"
      :key="'hLine' + key" class="h-line"
      :style="{top: ((item.y - 2) * (120 + 20) + 120 + 20 * 0.5) + 'px', left: ((item.hLinePointPositionXArr[0] - 1) * (180 + 20) + (180 * 0.5)) + 'px', width: (180 + 20) * Math.abs(item.hLinePointPositionXArr.slice(-1) - item.hLinePointPositionXArr[0]) + 'px'}"></div>
  </div>
</template>

<script>
import './icons/style.css'
export default {
  props: {
    treeData: {
      type: Array,
      required: true
    },
    childKeyName: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      // wrapper的高度
      treeWrapperHeight: 0,
      // 节点相关数组
      boxArr: [],
      circleArr: [],
      vLinePositionArr: [],
      hLinePositionArr: [],

      maxY: 1,
      x: 1
    }
  },
  computed: {
    // 处理一下prop: treeData
    // 深拷贝 & 添加properties
    _treeData () {
      let _treeData = this.treeData ? JSON.parse(JSON.stringify(this.treeData)) : []
      // 处理父组件传入的数组
      // 只有这里使用，改为了内部的function
      function nodeIdGenerator () {
        return nodeIdGenerator.number++
      }
      nodeIdGenerator.number = 0
      function addProperties (arr, that) {
        arr.forEach((v, i) => {
          // add prop: showChildren
          // add private key: nodeId
          // showChildren作为显示隐藏子节点的flag
          v.showChildren = true
          v.nodeId = i
          v.nodeId = nodeIdGenerator()
          if (v[that.childKeyName]) {
            addProperties(v[that.childKeyName], that)
          }
        }, that)
      }
      addProperties(_treeData, this)
      return _treeData
    }
  },
  methods: {
    // 递归遍历传入的数组，生成新的position arrs
    // 每个有子节点的节点都应该被遍历
    // x, y分别代表当前节点的坐标。起点为(1, 1)
    // 这个y通过【参数传递】的方式用来保存‘递归深度’
    // 深度优先，y方向递归，x方向循环
    // 一个节点由box, hLine, vLine, circle组成。同一个节点上，横线和竖线都渲染在box的上方，而circle在box的下方
    computePositions (oneLayerData, y = 1) {
      // h-line
      let hLinePointPositionXArr = []
      oneLayerData.forEach(function (v) {
        // 存放同一个节点下面第一层所有点的x值，用来画横线
        hLinePointPositionXArr.push(this.x)
        // 第一行box上面不加竖线
        if (y > 1) {
          this.vLinePositionArr.push({x: this.x, y})
        }
        // box
        this.boxArr.push({x: this.x, y, nodeId: v.nodeId, ...v})
        if (v[this.childKeyName]) {
          // circle
          this.circleArr.push({x: this.x, y, nodeId: v.nodeId, showChildren: v.showChildren})
          if (v.showChildren) {
            // recursion
            this.computePositions(v[this.childKeyName], y + 1)
          } else {
            this.x++
          }
        } else {
          this.x++
        }
        // max height of the wrapper
        this.maxY = (y > this.maxY) ? y : this.maxY
      }, this)
      // 第一行box上面不加横线
      if (y > 1) {
        this.hLinePositionArr.push({y, hLinePointPositionXArr})
      }
    },
    // 点击circle
    toggleShow (nodeId) {
      // refresh一下data
      this.x = 1
      this.maxY = 1
      this.treeWrapperHeight = 0
      this.boxArr = []
      this.circleArr = []
      this.vLinePositionArr = []
      this.hLinePositionArr = []
      // 递归找到并修改flag
      function changeShowState (arr, nodeId, that) {
        arr.forEach(v => {
          if (v.nodeId === nodeId) {
            v.showChildren = !v.showChildren
          }
          if (v[that.childKeyName]) {
            changeShowState(v[that.childKeyName], nodeId, that)
          }
        }, that)
      }
      changeShowState(this._treeData, nodeId, this)
      this.computePositions(this._treeData)
      this.treeWrapperHeight = (this.maxY * (120 + 20)) + 20
    }
  },
  mounted () {
    this.computePositions(this._treeData)
    this.treeWrapperHeight = (this.maxY * (120 + 20)) + 20
  }
}
</script>

<style scoped>
  .tree-wrapper {
    position: relative;
    overflow: scroll;
  }
  .circle {
    position: absolute;
    z-index: 10;
    cursor: pointer;
  }
  .box {
    position: absolute;
    box-sizing: border-box;
    width: 180px;
    height: 120px;
    border: 1px solid rgba(230,230,230,1);
    background:rgba(248,248,248,1);
  }
  .v-line {
    position: absolute;
    width: 1px;
    background-color: rgba(230,230,230,1);
  }
  .h-line {
    position: absolute;
    height: 1px;
    background-color: rgba(230,230,230,1);
  }
</style>
