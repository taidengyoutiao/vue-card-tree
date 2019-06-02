<template>
  <div>
    <Tree :treeData="treeData" childKeyName="xx">
      <template v-slot="{boxProps}">
        <h2>{{boxProps.text}}</h2>
      </template>
    </Tree>
  </div>
</template>

<script>
import Tree from 'vue-card-tree'
import 'vue-card-tree/vue-card-tree.css'
export default {
  data () {
    return {
      treeData: [
        {
          text: '🌲',
          xx: [{
            text: '...',
            xx: [
              {xx: [{}, {}]}
            ]
          },{
            xx: [{}, {
              text: '🌲'
            }]
          }]
        },{
          text: '🌲',
          xx: [
          {}
        ]}
      ]
    }
  },
  components: {Tree}
}
</script>

<style scoped>
.tac {
  text-align: center;
  font-size: 16px;
}
img {
  width: 150px;
  height: 100px;
}
</style>
