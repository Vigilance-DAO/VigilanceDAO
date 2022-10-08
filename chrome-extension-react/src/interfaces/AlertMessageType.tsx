export default interface AlertMessageType {
    message: string,
    type: 'success' | 'warning' | 'error' | 'info',
    description: string
}