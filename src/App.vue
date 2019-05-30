<template>
  <div>
    <Tree :treeData="treeData" childKeyName="children" boxIdName="bid"></Tree>
  </div>
</template>

<script>
import Tree from './Tree'
export default {
  data () {
    return {
      treeData: [{
        bid: 1,
        children: [
          {
            bid: 2,
            children: [
              {
                bid: 3,
                children: [
                  {
                    bid: 4
                  }
                ]
              },
              {
                bid: 5
              },
              {
                bid: 6
              }
            ]
          },
          {
            bid: 7,
            children: [
              {
                bid: 8
              },
              {
                bid: 9
              }
            ]
          }
        ]
      }]
    }
  },
  components: { Tree }
}
</script>
