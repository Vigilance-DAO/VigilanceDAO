export default interface AlertMessageType {
    message: React.ReactNode,
    type: 'success' | 'warning' | 'error' | 'info',
    description: string
}