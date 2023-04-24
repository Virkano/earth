import axios from 'axios'
import {
  MessageBox,
  Message
} from 'element-ui'

// 创建一个axios实例

const service = axios.create({
  //  baseURL: 'https://www.fastmock.site/mock/78f35070091223cf982af0eafed1e784/digitalParkH5/', // url = base url + request url
  //  baseURL: 'http://58.247.26.110:8089/prod-api/', // url = base url + request url
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // 当跨域请求时发送cookie
  timeout: 1000 * 8,// 请求设置网络超时
  //timeout: 100000
  headers: {
    // 'Authorization':'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJqaCIsImV4cCI6MTY0MTI4Mzc0NCwidXNlck5hbWUiOiJzdXBlcmFkbWluIiwidXNlcklkIjoxLCJqdGkiOiJkY2JmZWZjY2FmYmE0YWNmYTYzZWE1OTg3MzA2ODNiZSIsImF1dGhvcml0aWVzIjpbIntcImF1dGhvcml0eVwiOlwi6LaF57qn566h55CG5ZGYXCJ9Il19.taj4x2BvCOcrpWb6lD2HWr15Z_JIybMNKVwUxZuw8DKgX4pc3WSRuwmneNhPjleCY3AAQ7G0rUtCqMzeLru2-w'
  }

})

// 请求拦截器
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // 处理请求错误
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * 如果您想要获得http信息， 比如header或statustor
   * 请返回 response => response
   */

  /**
   * 通过自定义代码确定请求状态
   * 这只是一个例子
   * 您还可以通过HTTP状态码来判断状态
   */
  response => {
    const res = response.data
    // 如果自定义代码不为'0'，则判断为错误。

    if (res.code !== 200) {
      // Message({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      // return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // console.log('err' + error) // 为调试
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)
  }
)
// get查询接口请求方法  axios 是用来做ajax的请求
export const apiGet = (url, params) => {
  return new Promise((resolve, reject) => {
    service.get(url, {
      params: params,

    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

// 通用提示内容post提交接口请求方法
export const apiPost = (that, url, params) => {
  return new Promise((resolve, reject) => {
    that.$confirm('确认提交吗？', '提示', {}).then(() => {
      service.post(url, params).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  })
}
// 通用提示内容post提交接口请求方法
export const messagePost = (that, url, params) => {
  return new Promise((resolve, reject) => {
    service.post(url, params).then(res => {
      const code = res.code
      const type = code == 0 ? 'success' : 'warning'
      that.$message({
        type: type,
        message: res.message
      })
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

// 自定义提示内容post提交接口请求方法
export const apiPostCustom = (that, url, params, content) => {
  return new Promise((resolve, reject) => {
    that.$confirm(content, '提示', {
      type: 'warning'
    }).then(() => {
      service.post(url, params).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  })
}

// 无提示内容post提交接口请求方法
export const apiDefaultPost = (that, url, params) => {
  return new Promise((resolve, reject) => {
    service.post(url, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

// 通用提示内容put修改接口请求方法
export const apiPut = (that, url, params) => {
  return new Promise((resolve, reject) => {
    that.$confirm('确认提交吗？', '提示', {}).then(() => {
      service.put(url, params).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  })
}

// 无提示内容put提交接口请求方法
export const apiDefaultPut = (that, url, params) => {
  return new Promise((resolve, reject) => {
    service.put(url, params).then(res => {
      const code = res.code
      const type = code == 0 ? 'success' : 'warning'
      that.$message({
        type: type,
        message: res.message
      })
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

// 自定义提示内容put提交接口请求方法
export const apiPutCustom = (that, url, params, content) => {
  return new Promise((resolve, reject) => {
    that.$confirm(content, '提示', {
      type: 'warning'
    }).then(() => {
      service.put(url, params).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  })
}

// 通用提示内容delete删除接口请求方法
export const apiDelete = (that, url, data) => {
  return new Promise((resolve, reject) => {
    that.$confirm('确认删除该记录吗?', '提示', {
      type: 'warning'
    }).then(() => {
      service.delete(url, {
        data: data
      }).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res.data)
      }).catch(err => {
        that.listLoading = false
        reject(err)
      })
    })
  })
}

// 自定义提示内容delete删除接口请求方法
export const apiDeleteCustom = (that, url, data, content) => {
  return new Promise((resolve, reject) => {
    that.$confirm(content, '提示', {
      type: 'warning'
    }).then(() => {
      service.delete(url, {
        data: data
      }).then(res => {
        const code = res.code
        const type = code == 0 ? 'success' : 'warning'
        that.$message({
          type: type,
          message: res.message
        })
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  })
}

export default service
