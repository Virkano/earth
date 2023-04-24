class GPosition {
  constructor (position) {
    this.id = position.id
    this.name = position.name
    this.simple = position.simple
    this.label = position.label
    this.isChina = position.isChina
    this.camera = position.camera
    this.position = position.position
  }
}

class CPosition {
  constructor (position) {
    this.id = position.id
    this.class = position.class
    this.name = position.name
    this.num = position.num
  }
}

export function createGPosition (position) {
  return new GPosition({
    id: position.id,
    name: position.label,
    simple: position.label,
    label: position.name,
    isChina: position.nodeNum === '1',
    camera: GlobalPosition[position.nodeNum].camera,
    position: GlobalPosition[position.nodeNum].position
  })
}

export function createCPosition (position) {
  return new CPosition({
    id: position.id,
    class: `num_0${position.nodeNum}`,
    name: position.name,
    num: position.nodeNum
  })
}

const GlobalPosition = {
  1: {
    num: 1,
    numName: '中国',
    camera: {
      x: -104.20365855512935,
      y: 198.52836681125362,
      z: -218.2385967581862
    },
    position: [116.20, 39.55]
  },
  2: {
    num: 2,
    numName: '美国华盛顿',
    camera: {
      x: 53.500602018160215,
      y: 199.625293965259,
      z: 234.92004510679413
    },
    position: [-77.02, 39.91]
  },
  3: {
    num: 3,
    numName: '美国加州',
    camera: {
      x: -107.83853169937589,
      y: 183.88556021689953,
      z: 229.03482666319482
    },
    position: [-115.15, 36.16]
  },
  4: {
    num: 4,
    numName: '美国底特律',
    camera: {
      x: 1.7941288547576453,
      y: 180.27605505183163,
      z: 255.72900710830856
    },
    position: [-89.49, 35.35]
  },
  5: {
    num: 5,
    numName: '欧洲西班牙',
    camera: {
      x: 237.53627078152564,
      y: 203.10688857027128,
      z: 14.970366679167444
    },
    position: [-3.45, 40.25]
  },
  6: {
    num: 6,
    numName: '欧洲波兰',
    camera: {
      x: 181.97529700825504,
      y: 245.3080425885128,
      z: -67.8892886996888
    },
    position: [21.00, 52.13]
  },
  7: {
    num: 7,
    numName: '英国',
    camera: {
      x: 194.46384017017022,
      y: 245.1196691586589,
      z: 0.4033085915722223
    },
    position: [-0.05, 51.36]
  },
  8: {
    numName: '日本',
    camera: {
      x: -193.00900186111303,
      y: 182.0243935707149,
      z: -165.8753910192524
    },
    position: [139.46, 35.42]
  }
}

// const ChinaPosition = [
//   {
//     id: 1,
//     num: 1,
//     name: '国家标准化管理委员会',
//     class: 'num_01',
//     address: '北京',
//     path: '/combination'
//   },
//   {
//     id: 2,
//     num: 2,
//     name: '上海市地方标准',
//     class: 'num_02',
//     address: '上海',
//     path: ''
//   },
//   {
//     id: 3,
//     num: 3,
//     name: '其他地方标准',
//     class: 'num_03',
//     address: '深圳',
//     path: ''
//   },
//   {
//     id: 4,
//     num: 4,
//     name: '联盟标准',
//     class: 'num_04',
//     address: '武汉',
//     path: ''
//   },
//   {
//     id: 5,
//     num: 5,
//     name: '团体标准',
//     class: 'num_05',
//     address: '内蒙',
//     path: ''
//   }
// ]
