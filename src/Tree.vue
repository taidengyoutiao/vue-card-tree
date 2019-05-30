<template>
  <div class="tree-wrapper" :style="{height: treeWrapperHeight + 'px'}">
    <!-- box -->
    <div
      v-for="(item, key) in boxArr"
      :key="'box' + key" class="box"
      :bid="item.bid"
      :style="{top: (item.y - 1) * (120 + 20) + 'px', left: (item.x - 1) * (180 + 20) + 'px'}"></div>
    <!-- circle -->
    <div
      v-for="(item, key) in circleArr"
      :key="'circle' + key"
      @click="toggleShow(item.bid)"
      :bid="item.bid"
      :class="item.showChildren ? 'icon-plus' : 'icon-minus'" class="circle"
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
let x = 1
let maxY = 1

export default {
  props: {
    treeData: {
      type: Array,
      required: true
    },
    childKeyName: {
      type: String,
      required: true
    },
    boxIdName: {
      type: String,
      require: true
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
      hLinePositionArr: []
    }
  },
  computed: {
    // 处理一下prop: treeData
    // 深拷贝 & 添加properties
    _treeData () {
      let _treeData = JSON.parse(JSON.stringify(this.treeData))
      // 处理父组件传入的数组
      // 只有这里使用，改为了内部的function
      function addProperties (arr, that) {
        arr.forEach(v => {
          // only add two property now: showChildren, bid
          // showChildren作为显示隐藏子节点的flag
          // bid作为不同box的识别，也用来显示隐藏子节点，这个东西理论上来说是应该写在组件里面而不是外面传，但是考虑到可能还要传到外面去，而且多数的对象应该都有一个不重复的id
          v.showChildren = true
          v.bid = v[that.boxIdName]
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
    computePositions (someLayerData, y = 1) {
      // h-line
      let hLinePointPositionXArr = []
      someLayerData.forEach(function (v) {
        // 存放同一个节点下面第一层所有点的x值，用来画横线
        hLinePointPositionXArr.push(x)
        // 第一行box上面不加竖线
        if (y > 1) {
          this.vLinePositionArr.push({x, y})
        }
        if (v[this.childKeyName]) {
          // circle
          this.circleArr.push({x, y, bid: v.bid, showChildren: v.showChildren})
          // box
          this.boxArr.push({x, y, bid: v.bid})
          if (v.showChildren) {
            // recursion
            this.computePositions(v[this.childKeyName], y + 1)
          } else {
            x++
          }
        } else {
          // box
          this.boxArr.push({x, y, bid: v.bid})
          x++
          // max height of the wrapper
          maxY = (y > maxY) ? y : maxY
        }
      }, this)
      // 第一行box上面不加横线
      if (y > 1) {
        this.hLinePositionArr.push({y, hLinePointPositionXArr})
      }
    },
    // 点击circle
    toggleShow (bid) {
      // refresh一下data
      x = 1
      maxY = 1
      this.treeWrapperHeight = 0
      this.boxArr = []
      this.circleArr = []
      this.vLinePositionArr = []
      this.hLinePositionArr = []
      // 递归找到并修改flag
      function changeShowState (arr, bid, that) {
        arr.forEach(v => {
          if (bid && v.bid === bid) {
            v.showChildren = !v.showChildren
          }
          if (v[that.childKeyName]) {
            changeShowState(v[that.childKeyName], bid, that)
          }
        }, that)
      }
      changeShowState(this._treeData, bid, this)
      this.computePositions(this._treeData, 1)
      this.treeWrapperHeight = (maxY * (120 + 20)) + 20
    }
  },
  mounted () {
    this.computePositions(this._treeData)
    this.treeWrapperHeight = (maxY * (120 + 20)) + 20
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
    color: #409EFF;
    cursor: pointer;
  }
  .box {
    padding: 16px;
    font-size: 12px;
    position: absolute;
    box-sizing: border-box;
    width: 180px;
    height: 120px;
    border: 1px solid rgba(230,230,230,1);
    background:rgba(248,248,248,1);
  }
  .item {
    margin-bottom: 6px;
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
