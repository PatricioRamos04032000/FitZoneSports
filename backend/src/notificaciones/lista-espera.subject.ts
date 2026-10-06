import { Injectable, Logger } from '@nestjs/common';
import { LugarLiberadoEvent } from './lugar-liberado.event';
import { Observer, Subject } from './observer';

/** Fila de `lista_espera` que devuelven `cancelar_inscripcion` y `procesar_lista_espera`. */
export interface EsperaNotificada {
  id: string;
  perfil_id: string;
  vence_en: string;
}

export interface ClaseNotificable {
  id: string;
  tipo: string;
  inicio: string;
}

/**
 * Sujeto de la lista de espera. Clases lo usa después de cancelar una
 * inscripción o procesar la lista; no conoce a los observadores concretos.
 */
@Injectable()
export class ListaEsperaSubject implements Subject<LugarLiberadoEvent> {
  private readonly logger = new Logger(ListaEsperaSubject.name);
  private readonly observers = new Set<Observer<LugarLiberadoEvent>>();

  attach(observer: Observer<LugarLiberadoEvent>): void {
    this.observers.add(observer);
  }

  detach(observer: Observer<LugarLiberadoEvent>): void {
    this.observers.delete(observer);
  }

  /** Un observador que falla no frena a los demás ni a la operación que liberó el lugar. */
  async notify(evento: LugarLiberadoEvent): Promise<void> {
    const observers = [...this.observers];
    const resultados = await Promise.allSettled(
      observers.map((observer) => observer.update(evento)),
    );
    resultados.forEach((resultado, i) => {
      if (resultado.status === 'rejected') {
        this.logger.error(
          `${observers[i].constructor.name} falló para la espera ${evento.esperaId}: ${String(resultado.reason)}`,
        );
      }
    });
  }

  async notificarLugaresLiberados(
    clase: ClaseNotificable,
    esperas: EsperaNotificada[],
  ): Promise<void> {
    for (const espera of esperas) {
      await this.notify({
        esperaId: espera.id,
        perfilId: espera.perfil_id,
        venceEn: espera.vence_en,
        clase: { id: clase.id, tipo: clase.tipo, inicio: clase.inicio },
      });
    }
  }
}
