<template>
  <div class="container">
    <div class="earch_container">
      <canvas id="mainCanvas" :width="winWidth" :height="winHeight"></canvas>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'static/OrbitControls'
import img from '@/assets/image/earth/earth.jpg'
import lightWhite from '@/assets/image/earth/lightray.jpg'
import lightYellow from '@/assets/image/earth/lightray_yellow.jpg'
import dot from '@/assets/image/earth/dot.png'
import cloud from '@/assets/image/earth/clouds.jpg'
import TWEEN from '@tweenjs/tween.js'
import { CreateTreeNode } from '@/utils/domain/tree.js'
import { createGPosition } from '@/utils/domain/position.js'
import treeJson from '@/utils/getRegionAndOrganizeTree.json'
import treeNodeJson from '@/utils/treeNode.json'

import ResourceTracker from '@/utils/trackResource.js'

// 在外层定义resMgr和track
let resMgr = new ResourceTracker()
const track = resMgr.track.bind(resMgr)
const scene = track(new THREE.Scene())
// TODO: 需要减少效果 雾化 避免球体后方图块影响前方显示 重影
export default {
  name: 'homepage',
  props: ['position'],
  data() {
    return {
      isFirstInit: false,
      expert: [],
      // 触摸状态
      touchState: false,
      hideLabel: false,
      // 球体半径
      CITY_RADIUS: 100,
      // 地标几何体线与中心的边距
      CITY_MARGIN: 1,
      // 地图点闪烁速度
      BLINT_SPEED: 0.05,
      // 地标半径
      HEXAGON_RADIUS: 0,
      HEXAGON_MAX_RADIUS: 5,
      radius: 100,
      dotUrl: dot,
      coneImg: [lightWhite, lightYellow],
      //hexagonColor: ["#00B6EE", "#00B6EE"],
      hexagonColor: ['#F0E68C', '#F0E68C'],
      currentCountry: {},
      earthUrl: img,
      cloudUrl: cloud,
      winWidth: '1000px',
      winHeight: '1000px',
      clickObjects: [],
      tree: null,
      GPosition: [],
      positions: [],
      sqSize: 1, // 球体大小
    }
  },
  watch: {
    // position(curVal,oldVal){
    // if(curVal != '') {
    //   this.positions = curVal;
    //   console.log(curVal,'212112')
    //   // this.createObjects(curVal)
    //   }
    // },
  },
  methods: {
    // 格式化树节点
    normalizeTreeNode(node, tree, level) {
      node.map((item, index) => {
        tree.push(
          CreateTreeNode(
            item,
            level,
            item.organizeDescribeFlag,
            item.systemFlag,
          ),
        )
      })
    },
    // 获取区域节点树
    _getNodeTree(val) {
      // 渲染地球
      this.$nextTick(() => {
        this.isFirstInit = true
        this.earthParticles = track(new THREE.Object3D())
        this.cloud = track(new THREE.Object3D())
        this.hexagon = track(new THREE.Object3D())
        this.cone = track(new THREE.Object3D())
        this.circleList = track(new THREE.Object3D())
        track(new THREE.TextureLoader()).load(this.dotUrl, (texture) => {
          this.dotTexture = texture
          this.init()
        })
      })
    },

    init() {
      this.earthImg = document.createElement('img')
      this.earthImg.src = this.earthUrl
      this.earthImg.onload = () => {
        const earthCanvas = document.createElement('canvas')
        const earthCtx = earthCanvas.getContext('2d')
        earthCanvas.width = this.earthImg.width
        earthCanvas.height = this.earthImg.height
        earthCtx.drawImage(
          this.earthImg,
          0,
          0,
          this.earthImg.width,
          this.earthImg.height,
        )
        this.earthImgData = earthCtx.getImageData(
          0,
          0,
          this.earthImg.width,
          this.earthImg.height,
        )
        // basic scene
        this.createBasicScene()
        // 光锥
        let node = treeNodeJson.data
        this.createObjects(node)
        // 球面打点
        this.createEarthParticles()
        // 云层
        this.createCloudGrid()
        this.drawParticles()
        this.drawOrbitas()
        // 事件监听
        this.initClickEvent()
        animate()
      }
      const _that = this
      function animate() {
        _that.loop = requestAnimationFrame(animate)
        TWEEN.update()
        _that.update()
        _that.render()
      }
    },
    // FUN: 渲染
    render() {
      const delta = this.clock.getDelta()
      this.control.update(delta)
      this.renderer.render(this.scene, this.camera)
    },
    // FUN: 基础场景
    createBasicScene() {
      // 设置高宽
      const _that = this
      // const width = window.innerWidth
      // const height = window.innerHeight
      const width = window.innerWidth * this.sqSize
      const height = window.innerHeight * this.sqSize
      this.winWidth = width + 'px'
      this.winHeight = height + 'px'
      // 场景
      this.scene = track(new THREE.Scene())
      // TODO: 需要减少效果 雾化 避免球体后方图块影响前方显示 重影
      this.scene.fog = new THREE.Fog(0x000000, 180, 400)
      // 相机 1、角度45 2、摄像机视锥体长宽比 3、近端面 4、远端面
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
      // 相机位置
      // this.camera.position.z = 400
      // this.camera.position.set(150, 150, 350)
      this.camera.position.set(180, 180, 230)

      this.camera.lookAt(track(new THREE.Vector3(0, 0, 0)))
      // 构造器
      this.renderer = track(
        new THREE.WebGLRenderer({
          canvas: document.getElementById('mainCanvas'),
          alpha: true,
          antialias: true, // 抗锯齿
        }),
      )
      // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      // const dpr = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1
      // this.renderer.setPixelRatio(1)
      // this.renderer.setSize(window.innerWidth * this.sqSize, window.innerHeight  * this.sqSize)
      this.container = track(new THREE.Object3D())
      this.scene.add(this.container)
      // 将输出的canvas大小调整为全局高宽
      this.renderer.setSize(width, height)
      // 是否清除颜色缓存
      this.renderer.autoClearColor = new THREE.Color(1, 0, 0, 0)
      // 用于跟踪时间
      this.clock = new THREE.Clock()
      // 轨迹球控件
      this.control = new OrbitControls(this.camera, this.renderer.domElement)
      this.control.minPolarAngle = Math.PI * 0.15
      this.control.maxPolarAngle = Math.PI * 0.85
      this.control.enableZoom = false // 不允许缩放
      this.control.enableDamping = true // 启用阻尼
      this.control.enablePan = false // 阻止相机平移
      // FUN:获取地标位置时停止自传
      this.control.autoRotate = true
      this.control.autoRotateSpeed = 2.0
      // 坐标轴辅助
      this.axes = new THREE.AxesHelper(this.CITY_RADIUS + 10)
      // this.scene.add(this.axes)
      // 监听窗口变化
      window.addEventListener('resize', this.resize)
      // TODO:滚动事件监听
      this.renderer.domElement.addEventListener('touchstart', onmousedown, true)
      this.renderer.domElement.addEventListener('touchmove', ontouchmove, true)
      this.renderer.domElement.addEventListener('touchend', ontouchend, true)
      // this.renderer.domElement.addEventListener('mousedown', onmousedown, true)
      // this.renderer.domElement.addEventListener('mousemove', ontouchmove, true)
      // this.renderer.domElement.addEventListener('mouseup', ontouchend, true)
      function onmousedown(event) {
        // event.preventDefault()
        _that.touchState = true
      }
      function ontouchmove(event) {
        // event.preventDefault()
        if (_that.touchState) {
          // FUN:获取地标位置时停止自传
          _that.control.autoRotate = true
          _that.changeColor(false)
        }
      }
      function ontouchend(event) {
        // event.preventDefault()
        // FUN:获取地标位置时输出相机位置 取position
        _that.touchState = false
      }
    },
    // FUN: 地图打点
    createEarthParticles() {
      const positions = []
      const materials = [] // 材质数组
      const sizes = []
      for (var i = 0; i < 2; i++) {
        positions[i] = {
          positions: [],
        }
        sizes[i] = {
          sizes: [],
        }
        // 点阵材质
        const mat = track(new THREE.PointsMaterial())
        // 点大小
        mat.size = 5
        // 点颜色
        mat.color = track(new THREE.Color(0x00b6ee))
        // 使用点图片
        mat.map = this.dotTexture
        // 渲染此材质是否对深度缓冲区有任何影响
        mat.depthWrite = false
        // 是否透明
        mat.transparent = true
        // 透明度
        mat.opacity = 1
        // 正面渲染
        mat.side = THREE.FrontSide
        // 混合模式
        mat.blending = THREE.AdditiveBlending
        const n = i / 2
        // 点的闪烁控制
        mat.t_ = n * Math.PI * 2
        mat.speed_ = this.BLINT_SPEED

        // mat.min_ = .2 * Math.random() + .5
        // mat.delta_ = .1 * Math.random() + .1

        mat.min_ = 0.2 * Math.random() + 0.5
        mat.delta_ = 0.1 * Math.random() + 0.1
        mat.opacity_coef_ = 1
        materials.push(mat)
      }
      // 计算球坐标
      const spherical = track(new THREE.Spherical())
      spherical.radius = this.radius
      const step = 250
      for (let i = 0; i < step; i++) {
        // 三维向量
        const vec = track(new THREE.Vector3())
        const radians =
          (step * (1 - Math.sin((i / step) * Math.PI))) / step + 0.5 // 每个纬线圈内的角度均分
        for (let j = 0; j < step; j += radians) {
          const c = j / step // 底图上的横向百分比
          const f = i / step // 底图上的纵向百分比
          const index = Math.floor(2 * Math.random())
          const pos = positions[index]
          const size = sizes[index]
          if (this.isLandByUV(c, f)) {
            // 根据横纵百分比判断在底图中的像素值
            spherical.theta = c * Math.PI * 2 - Math.PI / 2 // 横纵百分比转换为theta和phi夹角
            spherical.phi = f * Math.PI // 横纵百分比转换为theta和phi夹角
            vec.setFromSpherical(spherical) // 夹角转换为世界坐标
            pos.positions.push(vec.x)
            pos.positions.push(vec.y)
            pos.positions.push(vec.z)
            if (j % 3 === 0) {
              size.sizes.push(6.0)
            }
          }
        }
      }
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]
        const size = sizes[i]
        // 这个类用于存储与BufferGeometry相关联的 attribute（例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute ）
        const bufferGeom = track(new THREE.BufferGeometry())
        const typedArr1 = new Float32Array(pos.positions.length)
        const typedArr2 = new Float32Array(size.sizes.length)
        for (let j = 0; j < pos.positions.length; j++) {
          typedArr1[j] = pos.positions[j]
        }
        for (let j = 0; j < size.sizes.length; j++) {
          typedArr2[j] = size.sizes[j]
        }
        bufferGeom.setAttribute(
          'position',
          track(new THREE.BufferAttribute(typedArr1, 3)),
        )
        bufferGeom.setAttribute(
          'size',
          track(new THREE.BufferAttribute(typedArr2, 1)),
        )
        // 计算当前几何体的外边界球
        bufferGeom.computeBoundingSphere()
        const particle = track(new THREE.Points(bufferGeom, materials[i]))
        this.earthParticles.add(particle)
      }
      this.scene.add(this.earthParticles)
    },
    // FUN: 创建球体等物件
    createObjects(val) {
      const treeNode = []
      const nodeTreeList = val
      this.normalizeTreeNode(nodeTreeList, treeNode, 0)
      treeNode.map((item) => {
        this.GPosition.push(createGPosition(item))
      })
      // 球面
      const sphereGeom = track(
        new THREE.SphereGeometry(this.CITY_RADIUS, 20, 20),
      )
      const sphereMat = track(
        new THREE.MeshBasicMaterial({
          color: 0x03d98e,
          wireframe: true, // 将几何体渲染为线框
        }),
      )
      this.sphere = track(new THREE.Mesh(sphereGeom, sphereMat))
      // scene.add(sphere)
      // 地标及光锥
      // console.log('地标及光锥',this.GPosition)
      // console.log('地标及光锥2',this.positions)
      // this.positions.map((item) => {
      //   item.position = []
      // })
      // const arr = this.positions
      // console.log(this.GPosition, 'this.GPosition')
      // console.log(arr, 'arrarrarr')
      // arr.map((item) => {
      //   item.position[0] = Number(item.lng)
      //   item.position[1] = Number(item.lat)
      //   const position = this.createPosition(item.position)
      //   // // 随机下标 0亦或者1
      //   const index = Math.floor(Math.random() * 2)
      //   this.createHexagon(position, index, item) // 地标
      //   this.createCone(position, index) // 光锥
      //   this.createText(position, item)
      // })

      this.GPosition.map((item) => {
        const position = this.createPosition(item.position)
        // 随机下标 0亦或者1
        const index = Math.floor(Math.random() * 2)
        this.createHexagon(position, index, item) // 地标
        this.createCone(position, index) // 光锥
        this.createText(position, item)
      })
    },
    isLandByUV(c, f) {
      if (!this.earthImgData) {
        // 底图数据
        console.error('data error!')
      }
      const n = parseInt(this.earthImg.width * c) // 根据横纵百分比计算图象坐标系中的坐标
      const o = parseInt(this.earthImg.height * f) // 根据横纵百分比计算图象坐标系中的坐标
      return this.earthImgData.data[4 * (o * this.earthImgData.width + n)] === 0 // 查找底图中对应像素点的rgba值并判断
    },
    // FUN: 创建云层
    createCloudGrid() {
      // 自定义材质
      const XRayMaterial = function (options) {
        const uniforms = {
          uTex: {
            type: 't',
            value: options.map || track(new THREE.Texture()),
          },
          offsetRepeat: {
            value: track(new THREE.Vector4(0, 0, 1, 1)),
          },
          alphaProportion: {
            type: '1f',
            value: options.alphaProportion || 0.5,
          },
          diffuse: {
            value: options.color || track(new THREE.Color(16777215)),
          },
          opacity: {
            value: options.opacity || 1,
          },
          gridOffset: {
            value: 0,
          },
        }
        return track(
          new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
            varying float _alpha;
            varying vec2 vUv;
            uniform vec4 offsetRepeat;
            uniform float alphaProportion;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
                vec4 worldPosition = modelMatrix * vec4( vec3( position ), 1.0 );
                vec3 cameraToVertex = normalize( cameraPosition - worldPosition.xyz);
                _alpha = 1.0 - max( 0.0, dot( normal, cameraToVertex ) );
                _alpha = max( 0.0, (_alpha - alphaProportion) / (1.0 - alphaProportion) );
            }`,
            fragmentShader: `
            uniform sampler2D uTex;
            uniform vec3 diffuse;
            uniform float opacity;
            uniform float gridOffset;
            varying float _alpha;
            varying vec2 vUv;
            void main() {
                vec4 texColor = texture2D( uTex, vUv );
                float _a = _alpha * opacity;
                if( _a <= 0.0 ) discard;
                _a = _a * ( sin( vUv.y * 2000.0 + gridOffset ) * .5 + .5 );
                gl_FragColor = vec4( texColor.rgb * diffuse, _a );
            }`,
            transparent: !0,
            blending: THREE.AdditiveBlending,
            depthTest: !1,
          }),
        )
      }
      const geometry = track(
        new THREE.SphereGeometry(1.3 * this.radius, 66, 44),
      )
      track(new THREE.TextureLoader()).load(this.cloudUrl, (map) => {
        map.wrapT = THREE.ClampToEdgeWrapping
        map.wrapS = THREE.ClampToEdgeWrapping
        const material = new XRayMaterial({
          map: map,
          alphaProportion: 0.25,
          color: new THREE.Color(0x00b6ee),
          opacity: 0,
          gridOffsetSpeed: 0.6,
        })
        const mesh = track(new THREE.Mesh(geometry, material))
        mesh.matrixAutoUpdate = !1
        this.cloud.add(mesh)
        this.scene.add(this.cloud)
      })
    },
    // FUN: 创建地标
    createHexagon(position, index, country) {
      const radius = 0
      function drawCircle(color) {
        const canvas = document.createElement('canvas')
        canvas.width = 96
        canvas.height = 96
        canvas.style.width = canvas.width + 'px'
        canvas.style.height = canvas.height + 'px'
        const context = canvas.getContext('2d')
        context.beginPath()
        context.arc(canvas.width / 2, canvas.width / 2, radius, 0, Math.PI * 2)
        context.closePath()
        context.lineWidth = 3 // 线条宽度
        context.strokeStyle = color // 颜色
        context.stroke()
        return canvas
      }
      const canvas = drawCircle(this.hexagonColor[index])
      const texture = track(new THREE.Texture(canvas))
      const circleMaterial = track(
        new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
        }),
      )
      const planeGeometry = track(new THREE.CircleGeometry(10, 32))
      const mesh = track(new THREE.Mesh(planeGeometry, circleMaterial))
      mesh._color = this.hexagonColor[index]
      mesh._canvas = canvas
      mesh._radius = radius
      mesh._step = 1
      mesh._country = country
      mesh.position.copy(position)
      mesh.lookAt(track(new THREE.Vector3(0, 0, 0)))
      this.circleList.add(mesh)
      this.clickObjects.push(mesh)
      this.scene.add(this.circleList)
    },
    changeColor(type) {
      if (this.currentCountry.simple) {
        if (type) {
          this.circleList.children.map((item) => {
            item._color = '#00B6EE'
          })
          const idx = this.GPosition.findIndex((item) => {
            return item.simple === this.currentCountry.simple
          })
          this.circleList.children[idx]._color = '#FF9E32'
        } else {
          const idx = this.GPosition.findIndex((item) => {
            return item.simple === this.currentCountry.simple
          })
          this.circleList.children[idx]._color = '#00B6EE'
        }
      }
    },
    createText(position, country) {
      const meshSphereMake = this.makeTextSprite(country.label, {
        fontsize: 70,
        borderColor: { r: 180, g: 125, b: 125, a: 1 } /* 边框颜色 */,
        backgroundColor: { r: 255, g: 255, b: 255, a: 1 } /* 背景颜色 */,
      })
      meshSphereMake.center = track(new THREE.Vector2(0, 0)) // 精灵字体转动的时候 看向的中心点
      meshSphereMake.name = 'mesh_sphere_make'
      meshSphereMake.position.x = position.x * 1.3
      meshSphereMake.position.y = position.y * 1.3
      meshSphereMake.position.z = position.z * 1.3
      this.scene.add(meshSphereMake)
    },
    /* 创建字体精灵 */
    makeTextSprite(message, parameters) {
      if (parameters === undefined) parameters = {}

      /* 字体 */
      // eslint-disable-next-line no-prototype-builtins
      const fontface = parameters.hasOwnProperty('fontface')
        ? parameters.fontface
        : 'Arial'

      /* 字体大小 */
      // eslint-disable-next-line no-prototype-builtins
      const fontsize = parameters.hasOwnProperty('fontsize')
        ? parameters.fontsize
        : 10

      /* 创建临时画布 */
      const canvas1 = document.createElement('canvas')
      const context1 = canvas1.getContext('2d')

      /* 字体加粗 */
      context1.font = 'Bold ' + fontsize + 'px ' + fontface

      /* 获取文字的大小数据，高度取决于文字的大小 */
      const metrics = context1.measureText(message)
      const textWidth = metrics.width + 40
      const canvas = document.createElement('canvas')
      canvas.width = textWidth
      canvas.height = fontsize + 20
      canvas.style.width = textWidth + 'px'
      canvas.style.height = fontsize + 'px'
      const context = canvas.getContext('2d')
      context.font = 'Bold ' + fontsize + 'px ' + fontface

      /* 字体颜色 */
      // context.strokeStyle = '#ffffff'
      context.fillStyle = '#ffffff'
      // context.fillText(message, borderThickness, fontsize + borderThickness)
      context.fillText(message, 0, fontsize)
      /* 画布内容用于纹理贴图 */
      const texture = new THREE.Texture(canvas)
      texture.needsUpdate = true

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      // const per = textWidth / 2
      /* 缩放比例 */
      sprite.scale.set(textWidth / 9, fontsize / 9, 1)

      return sprite
    },
    // FUN: 光锥
    createCone(position, index) {
      // 光锥图片加载
      const texture = track(new THREE.TextureLoader().load(this.coneImg[index]))
      const material = track(
        new THREE.MeshBasicMaterial({
          alphaMap: texture,
          transparent: true,
          opacity: 0.9,
          depthTest: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending, // 此材质显示对象时要使用何种混合
        }),
      )
      material._bline = false
      material._bline_speed = 0.015
      // 高度随机
      // const height = (Math.random() * 5) + 20
      const height = 25
      // 平面几何体
      const geometry = track(new THREE.PlaneGeometry(10, height))
      // 四维矩阵
      const matrix1 = track(new THREE.Matrix4())
      // 创建实体
      const plane1 = track(new THREE.Mesh(geometry, material))
      plane1._scale = false
      plane1._scale_speed = 0.02
      // X轴旋转角度
      matrix1.makeRotationX(Math.PI / 2)
      // 设置坐标
      matrix1.setPosition(track(new THREE.Vector3(0, 0, height / -2)))
      // 将矩阵信息直接应用于几何体顶点坐标
      geometry.applyMatrix4(matrix1)
      // 复制第一个光锥
      const plane2 = plane1.clone()
      plane2.rotation.z = Math.PI / 2
      plane1.add(plane2)
      plane1.position.copy(position)
      plane1.lookAt(0, 0, 0)
      this.cone.add(plane1)
      this.scene.add(this.cone)
    },
    // FUN: 创建球坐标
    createPosition(lnglat) {
      // 球坐标
      console.log('创建球坐标', lnglat)
      const spherical = track(new THREE.Spherical())
      // 坐标半径
      spherical.radius = this.radius
      const lng = lnglat[0]
      const lat = lnglat[1]
      const theta = (lng + 90) * (Math.PI / 180)
      const phi = (90 - lat) * (Math.PI / 180)
      spherical.phi = phi // 从Y（向上）轴的极角
      spherical.theta = theta // 围绕y（上）轴的赤道角
      // 三维向量 例如 一个位于三维空间中的点
      const position = track(new THREE.Vector3())
      // 从笛卡尔坐标系中设置球坐标的radius，phi和theta值。
      position.setFromSpherical(spherical)
      return position
    },
    // FUN: 窗口重绘事件
    resize() {
      this.renderer.setSize(
        window.innerWidth * this.sqSize,
        window.innerHeight * this.sqSize,
      )
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    },
    // FUN: 太空撒点
    drawParticles() {
      const total = 600
      const positions = track(new Float32Array(total * 3))
      const Spherical = track(new THREE.Spherical())
      const vector3 = track(new THREE.Vector3())
      for (let n = 0; n < total; n++) {
        const o = 3 * n
        Spherical.radius = this.radius * (1 + 0.6 * Math.random())
        Spherical.theta = 8 * Math.random()
        Spherical.phi = 0.3 + 2.2 * Math.random()
        vector3.setFromSpherical(Spherical)
        positions[o] = vector3.x
        positions[o + 1] = vector3.y
        positions[o + 2] = vector3.z
      }
      const geometry = track(new THREE.BufferGeometry())
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.computeBoundingSphere()
      const material = track(new THREE.PointsMaterial())
      material.size = 2
      material.color = track(new THREE.Color(0x00b6ee))
      material.transparent = true
      material.opacity = 0.6
      material.blending = THREE.AdditiveBlending
      material.depthWrite = false
      const points = track(new THREE.Points(geometry, material))
      points.matrixAutoUpdate = false
      this.pointParticles = new THREE.Object3D()
      this.pointParticles.add(points)
      this.scene.add(this.pointParticles)
    },
    // FUN: 环状物
    drawRing(position, radius, width, rotation, dontOrient) {
      var geometry = track(
        new THREE.RingGeometry(radius, radius + width, 64, 1),
      )
      var m = track(new THREE.Matrix4())
      if (!dontOrient) {
        m.makeRotationX(Math.PI / 2)
      } else {
        m.setPosition(track(new THREE.Vector3(0, 0, radius * 0.29)))
      }
      geometry.applyMatrix4(m)

      var material = track(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x00b6ee),
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: true,
          fog: false,
          transparent: true,
          opacity: Math.random() * 0.6 + 0.1,
        }),
      )
      var cylinder = track(new THREE.Mesh(geometry, material))
      cylinder.rotation.set(rotation.x, rotation.y, rotation.z)
      cylinder.position.set(position.x, position.y, position.z)

      // cylinder.matrixAutoUpdate = false;

      this.container.add(cylinder)
      return cylinder
    },
    // FUN: 轨道
    drawOrbitas() {
      this.orbits = []

      for (var i = 0; i < this.radius; i += 21) {
        var position = track(new THREE.Vector3(0, i, 0))
        var rotation = track(
          new THREE.Vector3(
            Math.random() * Math.PI,
            0,
            Math.random() * Math.PI,
          ),
        )
        position.y = 0
        var orbit = this.drawRing(
          position,
          this.radius * 1.2,
          Math.random() * 0.1 + 0.5,
          rotation,
        )
        const speedX = Math.random() * 0.008 * 2 - 0.008
        const speedY = Math.random() * 0.008 * 2 - 0.008
        const speedZ = Math.random() * 0.008 * 2 - 0.008
        orbit._increment = track(new THREE.Vector3(speedX, speedY, speedZ))
        this.orbits.push(orbit)
      }
    },
    // 点击事件响应
    initClickEvent() {
      // this.$bus.$emit('goPage',11,22)
      this.raycaster = track(new THREE.Raycaster())
      this.clickMouse = track(new THREE.Vector2())
      this.intersect_sphere = track(
        new THREE.Sphere(this.container.position.clone(), this.CITY_RADIUS),
      )
      document
        .getElementById('mainCanvas')
        .addEventListener('click', onDocumentMouseDown, false)
      const _that = this
      function onDocumentMouseDown(event) {
        console.log(event, 'eee', _that.clickObjects)
        event.preventDefault()
        _that.clickMouse.x =
          (event.clientX / _that.renderer.domElement.clientWidth) * 2 - 1
        _that.clickMouse.y =
          -(event.clientY / _that.renderer.domElement.clientHeight) * 2 + 1

        _that.raycaster.setFromCamera(_that.clickMouse, _that.camera)
        const intersects = _that.raycaster.intersectObjects(_that.clickObjects)
        console.log(intersects, 'intersectsintersects')
        if (intersects.length > 0) {
          const end = intersects[0].object._country.camera
          const to = new THREE.Vector3(end.x, end.y, end.z)
          new TWEEN.Tween(_that.camera.position)
            .to(to, 800)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start()
          _that.control.autoRotate = false
          setTimeout(() => {
            console.log(intersects, 'intersectsintersectsintersects')
            console.log(
              intersects[0].object._country.id,
              'intersects[0].object._country.id',
            )
            _that.$bus.$emit('goPage', intersects[0].object._country.id)
            //   if (+intersects[0].object._country.isChina) {
            //     // 点击china
            //     this.$emit('goPage')
            //     // _that.$router.push('/china')
            //   } else {
            //     console.log('其它点击事件')
            //     this.$emit('goPage')

            //     // 球体其它的point点击事件
            //     // _that.label = intersects[0].object._country.label
            //     // _that.showLabel = true
            //     // _that.currentCountry = intersects[0].object._country
            //     // _that.changeColor(true)
            //     // _that.expert = _that.expertList[intersects[0].object._country.id].slice(0, 4)
            //     // _that.showExpert = true
            //   }
          }, 801)
        }
      }
    },
    // 循环更新
    update() {
      // 更新扩散地标
      function drawCircle(color, canvas, radius, step) {
        const context = canvas.getContext('2d')
        radius += step // 每一帧半径增加0.15
        radius = +radius.toFixed(2)
        // 半径radius大于30时，重置为0
        if (radius > canvas.width / 2 - 1) {
          radius = 0
        }
        context.beginPath()
        context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2)
        context.closePath()
        context.lineWidth = 3 // 线条宽度
        context.strokeStyle = color // 颜色
        context.stroke()
        return canvas
      }
      function render(item) {
        const context = item._canvas.getContext('2d')
        // 默认值为source-over
        const prev = context.globalCompositeOperation
        // 只显示canvas上原图像的重叠部分
        context.globalCompositeOperation = 'destination-in'
        // 设置主canvas的绘制透明度
        context.globalAlpha = 0.95
        // 这一步目的是将canvas上的图像变的透明
        context.fillRect(0, 0, item._canvas.width, item._canvas.height)
        // 在原图像上重叠新图像
        context.globalCompositeOperation = prev
        // 在主canvas上画新圆
        const texture = track(
          new THREE.CanvasTexture(
            drawCircle(item._color, item._canvas, item._radius, item._step),
          ),
        )
        item.material.map = texture
        item.material.map.needsUpdate = true
      }

      this.circleList.children.map((item) => {
        render(item)
        item._radius += item._step // 每一帧半径增加0.15
        item._radius = +item._radius.toFixed(2)
        // 半径radius大于30时，重置为0
        if (item._radius > item._canvas.width / 2 - 1) {
          item._radius = 0
        }
      })

      // 轨道的运动
      if (this.orbits) {
        for (var i = 0; i < this.orbits.length; i++) {
          var orbit = this.orbits[i]
          orbit.rotation.x += orbit._increment.x
          orbit.rotation.y += orbit._increment.y
          orbit.rotation.z += orbit._increment.z
        }
      }
      // 球面粒子闪烁
      const objects = this.earthParticles.children
      objects.map((obj) => {
        const material = obj.material
        material.t_ += material.speed_
        material.opacity =
          (Math.sin(material.t_) * material.delta_ + material.min_) *
          material.opacity_coef_
        material.needsUpdate = true
      })

      // 需要减少效果 太空撒点漂浮
      if (this.pointParticles) {
        this.pointParticles.rotation.y += 0.001
      }
    },
    dispose(parent, child) {
      if (child.children.length) {
        const arr = child.children.filter((x) => x)
        arr.forEach((a) => {
          this.dispose(child, a)
        })
      }
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
        child.geometry.dispose()
      } else if (child.material) {
        child.material.dispose()
        child.geometry.dispose()
      }
      child.remove()
      parent.remove(child)
    },
  },
  mounted() {
    if (!this.isFirstInit) {
      this._getNodeTree()
    }
  },
  activated() {
    if (this.isFirstInit) {
      console.log('结束')
      this.control.autoRotate = true
      this.changeColor(false)
    }
  },
  beforeDestroy() {
    try {
      THREE.Cache.clear()
      resMgr && resMgr.dispose()
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer.content = null
      cancelAnimationFrame(document.getElementById('mainCanvas'))
      let gl = this.renderer.domElement.getContext('webgl')
      gl && gl.getExtension('WEBGL_lose_context').loseContext()
      console.log(this.renderer.info, '9898') //查看memery字段即可
    } catch (e) {
      console.log(e)
    }
  },
}
</script>

<style scoped>
#mainCanvas {
  position: absolute;
  top: 0;
  top: 1rem;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  z-index: 5;
  background: #161930;
}
canvas {
  outline: none;
}
</style>
