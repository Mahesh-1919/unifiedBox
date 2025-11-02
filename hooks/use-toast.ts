import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
}

const toast = {
  success: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.success(props)
    }
    return sonnerToast.success(props.title, { description: props.description })
  },
  error: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.error(props)
    }
    return sonnerToast.error(props.title, { description: props.description })
  },
  info: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.info(props)
    }
    return sonnerToast.info(props.title, { description: props.description })
  },
  warning: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.warning(props)
    }
    return sonnerToast.warning(props.title, { description: props.description })
  },
  loading: (props: ToastProps | string) => {
    if (typeof props === "string") {
      return sonnerToast.loading(props)
    }
    return sonnerToast.loading(props.title, { description: props.description })
  },
  dismiss: sonnerToast.dismiss,
}

function useToast() {
  return { toast }
}

export { useToast, toast }
