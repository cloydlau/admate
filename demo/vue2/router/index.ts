import VueRouter from 'vue-router'
import routes from './routes'
import { Vue2 } from 'vue-demi'
Vue2.use(VueRouter)

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
export default new VueRouter({
  routes
})
