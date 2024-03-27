import Toast from 'vue-toastification'
import { POSITION, type PluginOptions } from 'vue-toastification'

import 'vue-toastification/dist/index.css'
import '../style/toast.scss'

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: false,
  icon: false,
  toastClassName: 'custom-toast'
}

export default Toast
export { options }
