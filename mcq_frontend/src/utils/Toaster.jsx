
import { toast, Bounce } from 'react-toastify';

const baseOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

export const Toaster = {
  default: (msg) => toast(msg, baseOptions),
  success: (msg) => toast.success(msg, baseOptions),
  error: (msg) => toast.error(msg, baseOptions),
  info: (msg) => toast.info(msg, baseOptions),
  warn: (msg) => toast.warn(msg, baseOptions),
};