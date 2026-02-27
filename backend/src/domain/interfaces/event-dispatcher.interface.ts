
export interface IEventDispatcher {
    emit(event: string, data: any): void;
}