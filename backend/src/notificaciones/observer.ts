/** Patrón Observer (GoF): quien reacciona a un evento. */
export interface Observer<E> {
  update(evento: E): Promise<void>;
}

/** Patrón Observer (GoF): quien publica el evento y conoce a sus observadores. */
export interface Subject<E> {
  attach(observer: Observer<E>): void;
  detach(observer: Observer<E>): void;
  notify(evento: E): Promise<void>;
}
