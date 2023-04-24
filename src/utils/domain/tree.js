/**
 * 树节点
 * id 表示id
 * isChina 是否是中国
 * nodeLevel 节点层次 1-根节点 2-区域节点 3-标准组织节点 4-标准体系节点
 * nodeNum 位置编号
 * name 节点名称
 * label 节点简称
 * isShowSystem 是否显示关联标准体系
 * showChildren 是否显示子项
 * choose 是否被选择
 * children 子项数组
 * hasSystem 是否有关联标准体系
 * hasDesc 是否有组织介绍
 */

class TreeNode {
  constructor(node) {
    this.id = node.id
    this.isChina = node.isChina
    this.nodeLevel = node.nodeLevel
    this.nodeNum = node.nodeNum
    this.name = node.name
    this.label = node.label
    this.isShowSystem = node.isShowSystem
    this.showChildren = node.showChildren
    this.choose = node.choose
    this.children = node.children
    this.level = node.level
    this.hasSystem = node.hasSystem
    this.hasDesc = node.hasDesc
    this.desc = node.desc
  }
}

export function CreateTreeNode(node, level, desc, system) {
  return new TreeNode({
    id: node.id,
    isChina: !!node.nodeChinaFlag,
    nodeLevel: node.nodeLevel,
    nodeNum: node.nodeLocationNumber,
    name: node.nodeName,
    label: node.nodeNameAbbr,
    isShowSystem: !!node.nodeSystemFlag,
    showChildren: false,
    choose: false,
    level: level,
    children: [],
    hasSystem: system,
    hasDesc: desc
  })
}
